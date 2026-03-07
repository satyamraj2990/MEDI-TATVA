import { useState, useEffect } from "react";

const GOOGLE_GEOCODING_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Debug utility - expose to window for console testing
if (typeof window !== 'undefined') {
  (window as any).clearLocationCache = () => {
    sessionStorage.removeItem('patientLocation');
    sessionStorage.removeItem('pharmacyLocation');
    console.log('✅ Location cache cleared');
  };
  (window as any).getLocationCache = () => {
    console.log('Patient:', sessionStorage.getItem('patientLocation'));
    console.log('Pharmacy:', sessionStorage.getItem('pharmacyLocation'));
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export const useGeolocation = (userType: "patient" | "pharmacy" = "patient") => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const sessionKey = userType === "patient" ? "patientLocation" : "pharmacyLocation";

  // Check if running on HTTPS (required for geolocation)
  const isSecure = typeof window !== 'undefined' && 
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost');

  if (typeof window !== 'undefined' && !isSecure && window.location.protocol !== 'http:') {
    console.warn('⚠️ Geolocation requires HTTPS! Current protocol:', window.location.protocol);
  }

  const getAddressFromCoords = async (lat: number, lng: number, retries = 3): Promise<LocationData> => {
    // Try Nominatim (OpenStreetMap) as free alternative first
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Try OpenStreetMap Nominatim (free, no API key needed)
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'MediTatva-Location-Service'
          }
        });
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          console.log("Nominatim API response:", nominatimData);

          if (nominatimData.address) {
            const addr = nominatimData.address;
            const city = addr.city || addr.town || addr.village || addr.municipality || 
                        addr.county || addr.state_district || "";
            const state = addr.state || addr.province || "";
            const country = addr.country || "";
            const postalCode = addr.postcode || "";

            const addressParts = [];
            if (city) addressParts.push(city);
            if (state) addressParts.push(state);
            if (country && !state) addressParts.push(country);
            if (postalCode) addressParts.push(postalCode);

            const formattedAddress = addressParts.join(", ") || nominatimData.display_name.split(',').slice(0, 3).join(',');

            return {
              latitude: lat,
              longitude: lng,
              address: nominatimData.display_name,
              city: city || state || country || "Your Location",
              state,
              country,
              postalCode,
              formattedAddress: formattedAddress || "Your Current Location",
            };
          }
        }

        // Fallback to Google Geocoding if Nominatim fails
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_GEOCODING_API_KEY}`;
        const response = await fetch(googleUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        console.log("Google Geocoding API response:", data);
        console.log("Status:", data.status);
        console.log("Results count:", data.results?.length);
        if (data.results?.[0]) {
          console.log("Formatted Address:", data.results[0].formatted_address);
          console.log("Address Components:", data.results[0].address_components);
        }

        if (data.status === "OK" && data.results.length > 0) {
          const result = data.results[0];
          const addressComponents = result.address_components;

          // Extract address components
          const getComponent = (type: string) => {
            const component = addressComponents.find((comp: any) => 
              comp.types.includes(type)
            );
            return component?.long_name || "";
          };

          const getComponentShort = (type: string) => {
            const component = addressComponents.find((comp: any) => 
              comp.types.includes(type)
            );
            return component?.short_name || "";
          };

          // Try multiple strategies to get city
          const city = getComponent("locality") || 
                       getComponent("administrative_area_level_2") ||
                       getComponent("sublocality") ||
                       getComponent("sublocality_level_1") ||
                       getComponent("postal_town") ||
                       "";
          
          const state = getComponentShort("administrative_area_level_1") || 
                        getComponent("administrative_area_level_1") || 
                        "";
          const country = getComponent("country") || "";
          const postalCode = getComponent("postal_code") || "";

          console.log("=== Extracted Components ===");
          console.log("City:", city);
          console.log("State:", state);
          console.log("Country:", country);
          console.log("Postal Code:", postalCode);

          // Build formatted address from components
          let formattedAddress = "";
          
          if (city && state) {
            formattedAddress = postalCode 
              ? `${city}, ${state} ${postalCode}` 
              : `${city}, ${state}`;
          } else if (city && country) {
            formattedAddress = `${city}, ${country}`;
          } else if (state && country) {
            formattedAddress = `${state}, ${country}`;
          } else if (city) {
            formattedAddress = city;
          } else if (country) {
            formattedAddress = country;
          } else {
            // Parse from Google's formatted address
            const addressParts = result.formatted_address.split(',').map((s: string) => s.trim());
            // Take first 2-3 meaningful parts
            formattedAddress = addressParts.slice(0, Math.min(3, addressParts.length)).join(', ');
          }

          console.log("=== Final Formatted Address ===");
          console.log("Display:", formattedAddress);

          return {
            latitude: lat,
            longitude: lng,
            address: result.formatted_address,
            city: city || state || country || "Location",
            state,
            country,
            postalCode,
            formattedAddress: formattedAddress || result.formatted_address,
          };
        } else if (data.status === "ZERO_RESULTS") {
          // Even with zero results, try to get location name from nearby areas
          return {
            latitude: lat,
            longitude: lng,
            address: "Location detected",
            city: "Your Location",
            state: "",
            country: "",
            postalCode: "",
            formattedAddress: "Your Current Location",
          };
        } else if (data.status === "REQUEST_DENIED") {
          throw new Error(`API Error: ${data.error_message || "Request denied. Check API key."}`);
        } else if (data.status === "OVER_QUERY_LIMIT") {
          // Wait and retry
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error("API quota exceeded. Please try again later.");
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (error) {
        console.error(`Geocoding attempt ${attempt + 1} failed:`, error);
        
        // If this is the last attempt, return user-friendly fallback
        if (attempt === retries - 1) {
          return {
            latitude: lat,
            longitude: lng,
            address: "Location detected",
            city: "Your Location",
            state: "",
            country: "",
            postalCode: "",
            formattedAddress: "Your Current Location",
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    
    // Fallback (should never reach here, but TypeScript wants a return)
    return {
      latitude: lat,
      longitude: lng,
      address: "Location detected",
      city: "Your Location",
      state: "",
      country: "",
      postalCode: "",
      formattedAddress: "Your Current Location",
    };
  };

  const requestLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!("geolocation" in navigator)) {
      setState({
        location: null,
        loading: false,
        error: "Geolocation is not supported by your browser",
        permissionDenied: false,
      });
      return;
    }

    // Define success handler
    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      console.log("=== GPS Coordinates Obtained ===");
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      console.log(`Accuracy: ${accuracy} meters`);
      console.log(`Timestamp: ${new Date(position.timestamp).toISOString()}`);
      console.log(`Altitude: ${position.coords.altitude || 'N/A'}`);
      console.log(`Speed: ${position.coords.speed || 'N/A'}`);

      try {
        // Always force fresh geocoding on manual refresh or first load
        console.log("Calling Geocoding API with fresh coordinates...");
        const locationData = await getAddressFromCoords(latitude, longitude);

        console.log("=== Location Data Received ===");
        console.log("Location:", locationData);

        // Add accuracy and timestamp
        locationData.accuracy = accuracy;
        locationData.timestamp = position.timestamp;

        setState({
          location: locationData,
          loading: false,
          error: null,
          permissionDenied: false,
        });

        // Store in sessionStorage for session-scoped per-role context
        sessionStorage.setItem(sessionKey, JSON.stringify({ ...locationData, lastFetchedAt: Date.now() }));
        console.log(`✅ Location saved to sessionStorage key=${sessionKey}`);
        console.log(`📍 ${userType.toUpperCase()}: ${locationData.city}, ${locationData.state} (${locationData.postalCode})`);
      } catch (error) {
        console.error("Error getting address:", error);

        // Even if geocoding fails, we still have location
        const fallbackLocation: LocationData = {
          latitude,
          longitude,
          address: "Location detected",
          city: "Your Location",
          state: "",
          country: "",
          postalCode: "",
          formattedAddress: "Your Current Location",
          accuracy,
          timestamp: position.timestamp,
        };

        setState({
          location: fallbackLocation,
          loading: false,
          error: null,
          permissionDenied: false,
        });

        // Store fallback location in session
        sessionStorage.setItem(sessionKey, JSON.stringify({ ...fallbackLocation, lastFetchedAt: Date.now() }));
      }
    };

    // Define error handler
    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve your location";
      let permissionDenied = false;

      console.error("=== Geolocation Error ===");
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "Please enable location access to use nearby services";
        permissionDenied = true;
        console.error("❌ PERMISSION_DENIED: User blocked location access");
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "Location information is unavailable. Check your GPS/network.";
        console.error("❌ POSITION_UNAVAILABLE: GPS/Network unavailable");
      } else if (error.code === error.TIMEOUT) {
        errorMessage = "Location request timed out. Try again.";
        console.error("❌ TIMEOUT: Request took too long");
      }

      setState({
        location: null,
        loading: false,
        error: errorMessage,
        permissionDenied,
      });
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true, // ✅ Use GPS for high accuracy
      timeout: 30000, // 30 seconds - enough time for GPS to warm up
      maximumAge: 0, // ✅ Always get fresh location, don't use cached GPS data
    };

    console.log("🌍 Requesting geolocation with options:", geoOptions);
    console.log(`📱 UserType: ${userType}, SessionKey: ${sessionKey}`);

    // IMPROVED: Use watchPosition() for better accuracy
    // watchPosition() continues to monitor and provides more accurate results
    // as the GPS "warms up"
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    // Start with getCurrentPosition for immediate result
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (error) => {
        console.warn("⚠️ getCurrentPosition failed, starting watchPosition...");
        handleError(error);
        
        // Even if initial position fails, start watching for updates
        const id = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          geoOptions
        );
        setWatchId(id);
        console.log(`🔄 Started watchPosition (ID: ${id}) for continuous tracking`);
      },
      geoOptions
    );

    // Also start watchPosition for continuous accurate updates
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geoOptions
    );
    setWatchId(id);
    console.log(`🔄 Started watchPosition (ID: ${id}) for continuous tracking`);
  };

  useEffect(() => {
    // On mount: check sessionStorage for session-scoped location
    const stored = sessionStorage.getItem(sessionKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any;
        // If it was fetched within last 60s, reuse it, otherwise refresh
        const age = Date.now() - (parsed.lastFetchedAt || 0);
        if (age <= 60000) {
          setState({ location: parsed, loading: false, error: null, permissionDenied: false });
        } else {
          // use previous while requesting a fresh one
          setState({ location: parsed, loading: false, error: null, permissionDenied: false });
          requestLocation();
        }
      } catch (e) {
        requestLocation();
      }
    } else {
      requestLocation();
    }

    // Auto refresh every 60s
    const interval = setInterval(() => {
      try {
        const prevRaw = sessionStorage.getItem(sessionKey);
        if (prevRaw) {
          const prev = JSON.parse(prevRaw) as any;
          const age = Date.now() - (prev.lastFetchedAt || 0);
          // Only refresh if older than 60s
          if (age >= 60000) {
            requestLocation();
          }
        } else {
          requestLocation();
        }
      } catch (e) {
        requestLocation();
      }
    }, 60000);

    // Refresh when user revisits (tab becomes visible)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestLocation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      
      // Clean up watchPosition when component unmounts
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log(`🛑 Stopped watchPosition (ID: ${watchId})`);
      }
    };
  }, [userType]);

  const refreshLocation = () => {
    // Force a fresh location fetch and update session cache
    console.log("🔄 Refreshing location (session cache will be updated)");
    console.log("🔄 Forcing fresh GPS fetch with maximumAge=0");
    
    // Stop current watch if any
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    sessionStorage.removeItem(sessionKey); // Clear cached location to force fresh fetch
    requestLocation();
  };

  const clearLocation = () => {
    // Stop watching
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    sessionStorage.removeItem(sessionKey);
    setState({ location: null, loading: false, error: null, permissionDenied: false });
  };

  // helper: haversine distance in km
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return {
    ...state,
    refreshLocation,
    clearLocation,
  };
};
