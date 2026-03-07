import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ManualLocationInputProps {
  onLocationSet: (location: { latitude: number; longitude: number; city: string; state: string; postalCode: string }) => void;
  onClose: () => void;
  variant?: "patient" | "pharmacy";
}

export const ManualLocationInput: React.FC<ManualLocationInputProps> = ({ onLocationSet, onClose, variant = "patient" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setSearching(true);
    try {
      // Use Nominatim to search for the location
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'MediTatva-Manual-Location' }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Reverse geocode to get detailed address
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const reverseResponse = await fetch(reverseUrl, {
          headers: { 'User-Agent': 'MediTatva-Manual-Location' }
        });
        const reverseData = await reverseResponse.json();

        if (reverseData.address) {
          const addr = reverseData.address;
          const locationData = {
            latitude: lat,
            longitude: lon,
            city: addr.city || addr.town || addr.village || addr.state || "Unknown",
            state: addr.state || "",
            postalCode: addr.postcode || "",
            country: addr.country || "",
            fullAddress: reverseData.display_name,
            accuracy: 100, // Manual entry, assume 100m accuracy
            timestamp: Date.now(),
          };

          // Save to sessionStorage
          const storageKey = variant === "patient" ? "patientLocationData" : "pharmacyLocationData";
          sessionStorage.setItem(storageKey, JSON.stringify(locationData));

          onLocationSet(locationData);
          toast.success(`Location set to: ${locationData.city}, ${locationData.state}`);
          onClose();
        }
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch (error) {
      console.error("Manual location search error:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const useCurrentCoordinates = () => {
    const lat = prompt("Enter Latitude (e.g., 28.7041):");
    const lon = prompt("Enter Longitude (e.g., 77.1025):");

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        toast.error("Invalid coordinates");
        return;
      }

      // Reverse geocode
      setSearching(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'MediTatva-Manual-Location' }
      })
        .then(r => r.json())
        .then(data => {
          if (data.address) {
            const addr = data.address;
            const locationData = {
              latitude,
              longitude,
              city: addr.city || addr.town || addr.village || addr.state || "Unknown",
              state: addr.state || "",
              postalCode: addr.postcode || "",
              country: addr.country || "",
              fullAddress: data.display_name,
              accuracy: 100,
              timestamp: Date.now(),
            };

            const storageKey = variant === "patient" ? "patientLocationData" : "pharmacyLocationData";
            sessionStorage.setItem(storageKey, JSON.stringify(locationData));

            onLocationSet(locationData);
            toast.success(`Location set manually`);
            onClose();
          }
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to geocode coordinates");
        })
        .finally(() => setSearching(false));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Set Location Manually
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            GPS not working? Enter your city or coordinates manually.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search by City Name</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., New Delhi, Delhi, India"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                  className="flex-1"
                />
                <Button onClick={searchLocation} disabled={searching}>
                  {searching ? (
                    "Searching..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">OR</div>
              <Button variant="outline" onClick={useCurrentCoordinates} className="w-full">
                Enter GPS Coordinates
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <strong>Popular cities:</strong> New Delhi, Mumbai, Bangalore, Kolkata, Chennai, Hyderabad
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
