import { motion, AnimatePresence } from "framer-motion";
import { MapPin, RefreshCw, AlertCircle, Loader2, Navigation, MapPinned, Trash2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ManualLocationInput } from "@/components/ManualLocationInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface LocationDisplayProps {
  variant?: "patient" | "pharmacy";
  showFullAddress?: boolean;
  onLocationUpdate?: (location: any) => void;
}

export const LocationDisplay = ({ 
  variant = "patient", 
  showFullAddress = false,
  onLocationUpdate 
}: LocationDisplayProps) => {
  // Use the geolocation hook with the appropriate user type
  const { location, loading, error, permissionDenied, refreshLocation } = useGeolocation(variant);
    
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [location, onLocationUpdate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Clear cache first to ensure fresh location
    sessionStorage.removeItem(variant === "patient" ? "patientLocation" : "pharmacyLocation");
    refreshLocation();
    toast.info("Fetching fresh location...", {
      description: "Getting accurate GPS coordinates"
    });
    // safety: stop spinner after 10s in case of no update
    setTimeout(() => setIsRefreshing(false), 10000);
  };

  const handleClearCache = () => {
    // Clear all location caches
    sessionStorage.removeItem('patientLocation');
    sessionStorage.removeItem('pharmacyLocation');
    toast.success("Location cache cleared!", {
      description: "Refreshing to get your current location..."
    });
    // Reload page to get fresh location
    setTimeout(() => window.location.reload(), 500);
  };

  // Styles based on variant
  const isPharmacy = variant === "pharmacy";
  const bgColor = isPharmacy 
    ? "bg-white/10 backdrop-blur-md border-white/20" 
    : "bg-white/90 backdrop-blur-md border-cyan-500/20";
  const textColor = isPharmacy ? "text-white" : "text-[#0A2342]";
  const iconColor = isPharmacy ? "text-white" : "text-cyan-600";
  const badgeStyle = isPharmacy
    ? "bg-white/20 text-white border-white/30"
    : "bg-cyan-500/10 text-cyan-700 border-cyan-500/30";

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}
      >
        <Loader2 className={`h-4 w-4 animate-spin ${iconColor}`} />
        <span className={`text-sm font-medium ${textColor}`}>
          Detecting location...
        </span>
      </motion.div>
    );
  }

  if (error || permissionDenied) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isPharmacy 
              ? "bg-red-500/10 border-red-400/30" 
              : "bg-red-50 border-red-300"
          }`}
        >
          <AlertCircle className={`h-4 w-4 ${isPharmacy ? "text-red-300" : "text-red-600"}`} />
          <div className="flex-1">
            <p className={`text-xs font-medium ${isPharmacy ? "text-red-200" : "text-red-700"}`}>
              {permissionDenied ? "Location Access Denied" : "Location Error"}
            </p>
            <p className={`text-xs ${isPharmacy ? "text-red-300/80" : "text-red-600/80"}`}>
              {error}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className={`h-7 px-2 ${
              isPharmacy 
                ? "hover:bg-white/10 text-red-200" 
                : "hover:bg-red-100 text-red-700"
            }`}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowManualInput(true)}
            className={`h-7 px-2 ${
              isPharmacy 
                ? "hover:bg-white/10 text-red-200" 
                : "hover:bg-red-100 text-red-700"
            }`}
            title="Set location manually"
          >
            <MapPinned className="h-3 w-3" />
          </Button>
        </motion.div>
        
        {showManualInput && (
          <ManualLocationInput
            variant={variant}
            onLocationSet={(loc) => {
              setShowManualInput(false);
              window.location.reload(); // Reload to pick up new location
            }}
            onClose={() => setShowManualInput(false)}
          />
        )}
      </>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="location-display"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor} shadow-lg`}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <MapPin className={`h-4 w-4 ${iconColor}`} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
              <Badge className={`${badgeStyle} h-5 text-xs font-semibold px-2 flex items-center gap-2`}> 
                <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse inline-block" aria-hidden />
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3 mr-1" />
                  <span>Live</span>
                </div>
                {isRefreshing && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
              </Badge>
          </div>
          <p className={`text-xs font-medium ${textColor} truncate mt-0.5`}>
            {showFullAddress 
              ? location.formattedAddress 
              : location.city && location.state
                ? `${location.city}, ${location.state}${location.postalCode ? ` ${location.postalCode}` : ''}`
                : location.city && location.country
                ? `${location.city}, ${location.country}`
                : location.formattedAddress || "Your Location"
            }
          </p>
          {location.accuracy && (
            <p className={`text-xs ${textColor} opacity-70 truncate`}>
              ±{Math.round(location.accuracy)}m accuracy
            </p>
          )}
        </div>

        {/* Debug Info Toggle */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDebug(!showDebug)}
            className={`h-7 w-7 p-0 ${
              isPharmacy 
                ? "hover:bg-white/20 text-white/60" 
                : "hover:bg-cyan-100 text-cyan-600"
            }`}
            title="Show debug info"
          >
            <span className="text-xs">🔍</span>
          </Button>
        </motion.div>

        {/* Clear Cache Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearCache}
            className={`h-7 w-7 p-0 ${
              isPharmacy 
                ? "hover:bg-white/20 text-white/60" 
                : "hover:bg-cyan-100 text-cyan-600"
            }`}
            title="Clear cache & refresh location"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowManualInput(true)}
            className={`h-7 w-7 p-0 ${
              isPharmacy 
                ? "hover:bg-white/20 text-white/80" 
                : "hover:bg-cyan-100 text-cyan-700"
            }`}
            title="Change location manually"
          >
            <MapPinned className="h-3 w-3" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className={`h-7 w-7 p-0 ${
              isPharmacy 
                ? "hover:bg-white/20 text-white/80" 
                : "hover:bg-cyan-100 text-cyan-700"
            }`}
            title="Refresh location"
          >
            {isRefreshing || loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Manual Location Input Modal */}
      {showManualInput && (
        <ManualLocationInput
          variant={variant}
          onLocationSet={(loc) => {
            setShowManualInput(false);
            window.location.reload();
          }}
          onClose={() => setShowManualInput(false)}
        />
      )}
      
      {/* Debug Panel */}
      {showDebug && location && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-2 p-2 rounded-lg text-xs ${
            isPharmacy 
              ? "bg-white/5 border border-white/10 text-white/80" 
              : "bg-cyan-50 border border-cyan-200 text-cyan-900"
          }`}
        >
          <div className="font-mono space-y-1">
            <div><strong>GPS:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
            <div><strong>Accuracy:</strong> ±{location.accuracy ? Math.round(location.accuracy) : 'N/A'}m</div>
            <div><strong>Full Address:</strong> {location.formattedAddress}</div>
            <div><strong>Timestamp:</strong> {location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'N/A'}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
