/**
 * Location Debugging Utilities
 * Helps diagnose location detection issues
 */

export const testBrowserLocation = async () => {
  console.group("🔍 Location Detection Test");
  
  // 1. Check if geolocation is supported
  if (!navigator.geolocation) {
    console.error("❌ Geolocation not supported by browser");
    console.groupEnd();
    return;
  }
  console.log("✅ Geolocation API supported");
  
  // 2. Check permissions
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    console.log("📍 Permission status:", permissionStatus.state);
    
    permissionStatus.addEventListener('change', () => {
      console.log("📍 Permission changed to:", permissionStatus.state);
    });
  } catch (e) {
    console.warn("⚠️ Could not check permission status:", e);
  }
  
  // 3. Test location fetch
  console.log("📡 Requesting current position...");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("✅ Location obtained:");
      console.table({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: `±${Math.round(position.coords.accuracy)}m`,
        altitude: position.coords.altitude ?? 'N/A',
        speed: position.coords.speed ?? 'N/A',
        heading: position.coords.heading ?? 'N/A',
        timestamp: new Date(position.timestamp).toISOString()
      });
      
      // 4. Test reverse geocoding
      testReverseGeocode(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      console.error("❌ Location error:");
      console.table({
        code: error.code,
        message: error.message,
        PERMISSION_DENIED: error.code === 1 ? "YES" : "NO",
        POSITION_UNAVAILABLE: error.code === 2 ? "YES" : "NO",
        TIMEOUT: error.code === 3 ? "YES" : "NO"
      });
      console.groupEnd();
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
};

const testReverseGeocode = async (lat: number, lon: number) => {
  console.log("🗺️ Testing reverse geocoding...");
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MediTatva-Debug' }
    });
    const data = await response.json();
    
    console.log("✅ Nominatim response:");
    console.log("Display name:", data.display_name);
    console.log("Address components:", data.address);
    console.groupEnd();
  } catch (error) {
    console.error("❌ Geocoding failed:", error);
    console.groupEnd();
  }
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).testLocation = testBrowserLocation;
}
