import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, Star, Phone, ExternalLink, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lon: number;
  phone?: string;
  rating?: number;
  type: string;
}

interface NearbyPharmacyFinderProps {
  variant?: "patient" | "pharmacy";
  onClose?: () => void;
}

export const NearbyPharmacyFinder = ({ variant = "patient", onClose }: NearbyPharmacyFinderProps) => {
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use the geolocation hook with the appropriate user type
  const { location: geoLocation, loading: geoLoading, error: geoError, refreshLocation } = useGeolocation(variant);

  const isPharmacy = variant === "pharmacy";

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const searchNearbyPharmacies = async () => {
    setLoading(true);
    setError(null);
    setPharmacies([]);
    // Prefer session-scoped geoLocation from the hook
    if (!geoLocation) {
      // try triggering a refresh
      toast.info("Fetching your current location...");
      refreshLocation();
      setLoading(false);
      setError("Please allow location access or refresh your location to search nearby stores.");
      return;
    }

    const latitude = geoLocation.latitude;
    const longitude = geoLocation.longitude;
    setUserLocation({ lat: latitude, lng: longitude });

    console.log("🔍 Searching for pharmacies near:", latitude, longitude);
    toast.info("Searching all nearby pharmacies...");

        let allPharmacies: Pharmacy[] = [];

        try {
          // METHOD 1: Overpass API with comprehensive search
          console.log("📍 Method 1: Overpass API comprehensive search...");
          const overpassUrl = 'https://overpass-api.de/api/interpreter';
          const radius = 25000; // 25km radius for maximum coverage
          
          const query = `
            [out:json][timeout:30];
            (
              node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
              way["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
              relation["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
              node["shop"="chemist"](around:${radius},${latitude},${longitude});
              way["shop"="chemist"](around:${radius},${latitude},${longitude});
              node["healthcare"="pharmacy"](around:${radius},${latitude},${longitude});
              way["healthcare"="pharmacy"](around:${radius},${latitude},${longitude});
              node["dispensing"="yes"](around:${radius},${latitude},${longitude});
              way["dispensing"="yes"](around:${radius},${latitude},${longitude});
            );
            out center body;
            >;
            out skel qt;
          `;

          try {
            const response = await fetch(overpassUrl, {
              method: 'POST',
              body: `data=${encodeURIComponent(query)}`,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log("📍 Overpass API Response:", data);

              if (data.elements && data.elements.length > 0) {
                const overpassList = data.elements
                  .map((element: any) => {
                    const lat = element.lat || element.center?.lat;
                    const lon = element.lon || element.center?.lon;
                    
                    if (!lat || !lon) return null;

                    const distance = calculateDistance(latitude, longitude, lat, lon);
                    
                    // Build comprehensive address
                    const addressParts = [];
                    if (element.tags?.['addr:housenumber'] && element.tags?.['addr:street']) {
                      addressParts.push(`${element.tags['addr:housenumber']} ${element.tags['addr:street']}`);
                    } else if (element.tags?.['addr:street']) {
                      addressParts.push(element.tags['addr:street']);
                    }
                    if (element.tags?.['addr:city']) addressParts.push(element.tags['addr:city']);
                    if (element.tags?.['addr:postcode']) addressParts.push(element.tags['addr:postcode']);
                    if (element.tags?.['addr:state']) addressParts.push(element.tags['addr:state']);

                    return {
                      id: `osm-${element.id}`,
                      name: element.tags?.name || element.tags?.brand || 'Pharmacy',
                      address: addressParts.length > 0 
                        ? addressParts.join(', ') 
                        : 'Address not available',
                      distance: distance,
                      lat: lat,
                      lon: lon,
                      phone: element.tags?.phone || element.tags?.['contact:phone'],
                      type: element.tags?.dispensing === 'yes' ? 'Dispensing Pharmacy' : 'Pharmacy'
                    };
                  })
                  .filter((p: Pharmacy | null) => p !== null && p.distance <= 25);

                allPharmacies = [...allPharmacies, ...overpassList];
                console.log(`✅ Overpass found: ${overpassList.length} pharmacies`);
              }
            }
          } catch (overpassError) {
            console.error("Overpass API error:", overpassError);
          }

          // METHOD 2: Nominatim search as additional source
          console.log("📍 Method 2: Nominatim comprehensive search...");
          try {
            const searchTerms = ['pharmacy', 'chemist', 'drugstore', 'medical store', 'apothecary'];
            
            for (const term of searchTerms) {
              const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${term}&limit=100&viewbox=${longitude-0.4},${latitude-0.4},${longitude+0.4},${latitude+0.4}&bounded=1`;
              
              const nominatimResponse = await fetch(nominatimUrl, {
                headers: { 'User-Agent': 'MediTatva-App' }
              });
              
              if (nominatimResponse.ok) {
                const nominatimData = await nominatimResponse.json();
                
                if (nominatimData && nominatimData.length > 0) {
                  const nominatimList = nominatimData
                    .map((place: any) => {
                      const lat = parseFloat(place.lat);
                      const lon = parseFloat(place.lon);
                      const distance = calculateDistance(latitude, longitude, lat, lon);
                      
                      return {
                        id: `nom-${place.place_id}`,
                        name: place.display_name.split(',')[0],
                        address: place.display_name,
                        distance: distance,
                        lat: lat,
                        lon: lon,
                        type: term.charAt(0).toUpperCase() + term.slice(1)
                      };
                    })
                    .filter((p: Pharmacy) => p.distance <= 25);
                  
                  allPharmacies = [...allPharmacies, ...nominatimList];
                }
              }
              
              // Rate limiting: wait 1 second between requests
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log(`✅ Nominatim found additional locations`);
          } catch (nominatimError) {
            console.error("Nominatim error:", nominatimError);
          }

          // Remove duplicates based on coordinates (same location)
          const uniquePharmacies = Array.from(
            new Map(
              allPharmacies.map(p => [
                `${p.lat.toFixed(4)}-${p.lon.toFixed(4)}`,
                p
              ])
            ).values()
          );

          // Sort by distance and limit to top 100
          const sortedPharmacies = uniquePharmacies
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 100);

          console.log(`✅ Total unique pharmacies found: ${sortedPharmacies.length}`);
          
          if (sortedPharmacies.length > 0) {
            setPharmacies(sortedPharmacies);
            toast.success(`Found ${sortedPharmacies.length} nearby pharmacies!`, {
              description: `Showing all stores within 25 km`
            });
          } else {
            setError("No pharmacies found within 25km radius. This area might not have mapped pharmacies or try a different location.");
            toast.warning("No pharmacies found in this area");
          }
        } catch (error) {
          console.error("Error fetching pharmacies:", error);
          setError("Failed to fetch nearby pharmacies. Please try again.");
          toast.error("Search failed. Please try again.");
        } finally {
          setLoading(false);
        }
  };

  const openInGoogleMaps = (lat: number, lon: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[98vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
      >
        <Card
          className="overflow-hidden flex flex-col"
          style={{
            background: isPharmacy 
              ? 'rgba(17, 24, 39, 0.95)' 
              : 'rgba(11, 18, 32, 0.95)',
            backdropFilter: 'blur(20px)',
            border: isPharmacy 
              ? '1px solid rgba(59, 130, 246, 0.3)' 
              : '1px solid rgba(20, 184, 166, 0.3)',
          }}
        >
          {/* Header */}
          <div
            className="p-3 sm:p-4 lg:p-6 border-b flex-shrink-0"
            style={{
              background: isPharmacy
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              borderBottom: isPharmacy 
                ? '1px solid rgba(59, 130, 246, 0.3)' 
                : '1px solid rgba(20, 184, 166, 0.3)',
            }}
          >
            <div className="flex justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">Find Nearby Medical Stores</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-1">
                  Search within 25km radius • Multiple sources
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                aria-label="Close pharmacy finder"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Search Button */}
            <motion.div 
              className="mt-3 sm:mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={searchNearbyPharmacies}
                disabled={loading}
                className="w-full min-h-[44px] text-sm sm:text-base"
                style={{
                  background: loading 
                    ? 'rgba(107, 114, 128, 0.5)'
                    : isPharmacy
                    ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                    : 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                  boxShadow: loading 
                    ? 'none'
                    : '0 4px 20px rgba(20, 184, 166, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span>Search Medical Stores Near Me</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Results Area - Scrollable */}
          <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(95vh - 180px)' }}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 text-center"
                >
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-300 text-sm sm:text-base">{error}</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-800/30 rounded-lg p-3 sm:p-4 animate-pulse"
                    >
                      <div className="h-4 sm:h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-full mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-2/3"></div>
                    </div>
                  ))}
                </motion.div>
              )}

              {!loading && !error && pharmacies.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-base sm:text-lg px-2">
                    Click the button above to find nearby pharmacies
                  </p>
                </motion.div>
              )}

              {!loading && pharmacies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 font-medium">
                    Found {pharmacies.length} {pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} near you
                  </p>

                  {pharmacies.map((pharmacy, index) => (
                    <motion.div
                      key={pharmacy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="p-3 sm:p-4 hover:scale-[1.01] transition-transform cursor-pointer"
                        style={{
                          background: 'rgba(17, 24, 39, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-2">
                              {pharmacy.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 flex items-start gap-1 line-clamp-2">
                              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                              <span>{pharmacy.address}</span>
                            </p>
                          </div>
                          <Badge
                            className="self-start sm:ml-2 flex-shrink-0 whitespace-nowrap"
                            style={{
                              background: pharmacy.distance < 1 
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                              border: pharmacy.distance < 1 
                                ? '1px solid rgba(34, 197, 94, 0.3)'
                                : '1px solid rgba(59, 130, 246, 0.3)',
                              color: pharmacy.distance < 1 ? '#86efac' : '#93c5fd',
                            }}
                          >
                            {pharmacy.distance < 1 
                              ? `${(pharmacy.distance * 1000).toFixed(0)}m`
                              : `${pharmacy.distance.toFixed(1)}km`}
                          </Badge>
                        </div>

                        {pharmacy.phone && (
                          <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mb-3">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{pharmacy.phone}</span>
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            onClick={() => openInGoogleMaps(pharmacy.lat, pharmacy.lon, pharmacy.name)}
                            className="flex-1 min-h-[44px] text-xs sm:text-sm"
                            style={{
                              background: 'rgba(20, 184, 166, 0.2)',
                              border: '1px solid rgba(20, 184, 166, 0.3)',
                            }}
                          >
                            <Navigation className="h-3 w-3 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>View on Map</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-initial border-white/10 hover:bg-white/5 text-gray-300 min-h-[44px] text-xs sm:text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1 sm:mr-2 flex-shrink-0" />
                            <span>Details</span>
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
