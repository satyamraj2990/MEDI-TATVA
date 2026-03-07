import { useEffect, useRef, memo, useState } from "react";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

interface GoogleMapComponentProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    distance: number;
  }>;
  apiKey: string;
  onStoreClick?: (storeId: string) => void;
}

export const GoogleMapComponent = memo(({
  userLocation,
  stores,
  apiKey,
  onStoreClick
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const loadingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userLocation || !mapRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    // Set timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.error('⏱️ Map loading timeout - API might not be configured');
        setError('Map loading timed out. Please check if Google Maps APIs are enabled and billing is active.');
        setIsLoading(false);
        loadingRef.current = false;
      }
    }, 10000); // 10 second timeout

    // Load Google Maps Script with better error handling
    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps already loaded');
          resolve();
          return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          console.log('⏳ Google Maps script exists, waiting for load...');
          
          // Set timeout for existing script
          const scriptTimeout = setTimeout(() => {
            reject(new Error('Script loading timeout'));
          }, 8000);
          
          existingScript.addEventListener('load', () => {
            clearTimeout(scriptTimeout);
            console.log('✅ Google Maps loaded from existing script');
            resolve();
          });
          existingScript.addEventListener('error', (e) => {
            clearTimeout(scriptTimeout);
            console.error('❌ Google Maps script error:', e);
            reject(new Error('Failed to load Google Maps. Please check your API key and billing status.'));
          });
          return;
        }

        console.log('📦 Loading Google Maps script with key:', apiKey.substring(0, 10) + '...');
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        // Create callback function
        (window as any).initMap = () => {
          console.log('✅ Google Maps initialized successfully');
          resolve();
        };

        script.addEventListener('error', (e) => {
          console.error('❌ Failed to load Google Maps script:', e);
          reject(new Error('Failed to load Google Maps. Check: 1) API key is valid, 2) Maps JavaScript API is enabled, 3) Billing is active'));
        });
        
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadGoogleMaps();

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (!mapRef.current) {
          setIsLoading(false);
          return;
        }

        console.log('🗺️ Initializing map...');

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi.medical",
              elementType: "geometry",
              stylers: [{ color: "#fce4ec" }]
            },
            {
              featureType: "poi.medical",
              elementType: "labels.text.fill",
              stylers: [{ color: "#c2185b" }]
            }
          ]
        });

        googleMapRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add user location marker
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#1B6CA8",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
          animation: google.maps.Animation.DROP,
          zIndex: 1000,
        });

        // Add user location info window
        const userInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <div style="font-weight: 600; color: #1B6CA8; margin-bottom: 4px;">📍 Your Location</div>
              <div style="font-size: 12px; color: #5A6A85;">Current Position</div>
            </div>
          `
        });

        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });

        markersRef.current.push(userMarker);

        // Add pharmacy markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });

        stores.forEach((store, index) => {
          const position = { lat: store.lat, lng: store.lon };
          bounds.extend(position);

          const marker = new google.maps.Marker({
            position,
            map,
            title: store.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#2ECC71",
              fillOpacity: 0.9,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            animation: google.maps.Animation.DROP,
            label: {
              text: (index + 1).toString(),
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "bold",
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; font-family: system-ui; max-width: 250px;">
                <div style="font-weight: 700; color: #0A2342; margin-bottom: 6px; font-size: 14px;">${store.name}</div>
                <div style="font-size: 12px; color: #5A6A85; margin-bottom: 6px; line-height: 1.4;">${store.address}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                  <span style="background: #E8F4F8; color: #1B6CA8; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${store.distance} km away
                  </span>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            if (onStoreClick) {
              onStoreClick(store.id);
            }
          });

          markersRef.current.push(marker);
        });

          // Fit map to show all markers
        if (stores.length > 0) {
          map.fitBounds(bounds);
          // Ensure minimum zoom level
          const listener = google.maps.event.addListener(map, "idle", () => {
            if (map.getZoom()! > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
          });
        }

        console.log('✅ Map initialized successfully with', stores.length, 'stores');
        setIsLoading(false);

      } catch (error: any) {
        console.error("❌ Error initializing Google Maps:", error);
        setError(error.message || 'Failed to load map. Please check API key settings.');
        setIsLoading(false);
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        loadingRef.current = false;
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userLocation, stores, apiKey, onStoreClick, isLoading]);

  if (error) {
    return (
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-red-200">
        <div className="text-center p-8 max-w-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">Unable to Load Google Maps</h3>
          <p className="text-sm text-slate-700 mb-6 leading-relaxed">{error}</p>
          
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 text-left mb-4">
            <p className="font-bold text-amber-900 mb-3 text-base">🔧 Quick Fix Checklist:</p>
            <ul className="space-y-2 text-amber-900">
              <li className="flex items-start gap-2">
                <span className="text-lg">1️⃣</span>
                <span><strong>Enable APIs:</strong> Maps JavaScript API, Geocoding API, Places API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">2️⃣</span>
                <span><strong>Enable Billing:</strong> Google Cloud Console → Billing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">3️⃣</span>
                <span><strong>Remove Restrictions:</strong> API Key → Application restrictions → None</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">4️⃣</span>
                <span><strong>Wait 2-5 minutes</strong> after making changes</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <a 
              href="https://console.cloud.google.com/apis/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Open Google Cloud Console
            </a>
            <a 
              href="/GOOGLE_MAPS_SETUP.md" 
              target="_blank"
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Setup Guide
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-base text-slate-700 font-semibold mb-1">Loading Interactive Map...</p>
          <p className="text-sm text-slate-500">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
});

GoogleMapComponent.displayName = "GoogleMapComponent";
