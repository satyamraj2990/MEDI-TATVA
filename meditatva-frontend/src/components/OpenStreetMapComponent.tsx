import { memo, useEffect, useRef } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapComponentProps {
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
}

export const OpenStreetMapComponent = memo(({
  userLocation,
  stores
}: OpenStreetMapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with smooth animations
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // We'll add custom zoom control
      attributionControl: true,
    }).setView(
      [userLocation.latitude, userLocation.longitude],
      13
    );

    // Add custom zoom control in top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Use standard OpenStreetMap tiles - matches the reference image style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom icon for user location (blue circle with white border and pulse animation)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 20px;
            height: 20px;
            background: #4285F4;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(66, 133, 244, 0.15);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add user location marker
    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map);

    // Show popup only on click
    userMarker.on('click', () => {
      L.popup()
        .setLatLng([userLocation.latitude, userLocation.longitude])
        .setContent(`
          <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: #4285F4; border: 2px solid white; border-radius: 50%;"></div>
              <strong style="color: #1a1a1a; font-size: 14px;">Your Location</strong>
            </div>
            <p style="margin: 0; font-size: 12px; color: #5f6368;">Current Position</p>
          </div>
        `)
        .openOn(map);
    });

    // Add store markers with numbers (green circles like Google Maps)
    stores.forEach((store, index) => {
      const storeIcon = L.divIcon({
        className: 'custom-store-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #34A853;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            font-family: system-ui, -apple-system, sans-serif;
          ">${index + 1}</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([store.lat, store.lon], { icon: storeIcon })
        .addTo(map);

      marker.on('click', () => {
        L.popup({
          maxWidth: 280,
          className: 'custom-popup'
        })
          .setLatLng([store.lat, store.lon])
          .setContent(`
            <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="display: flex; align-items: start; gap: 10px; margin-bottom: 12px;">
                <div style="
                  width: 24px;
                  height: 24px;
                  background: #34A853;
                  border: 2px solid white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  color: white;
                  font-size: 12px;
                  flex-shrink: 0;
                ">${index + 1}</div>
                <div>
                  <strong style="color: #1a1a1a; font-size: 15px; line-height: 1.3;">${store.name}</strong>
                </div>
              </div>
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #5f6368; line-height: 1.4;">${store.address}</p>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="
                  background: #E8F5E9;
                  color: #1B5E20;
                  padding: 5px 10px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 600;
                ">📍 ${store.distance} km away</span>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}"
                  target="_blank"
                  style="
                    background: #4285F4;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                  "
                >
                  🧭 Directions
                </a>
              </div>
            </div>
          `)
          .openOn(map);
      });
    });

    // Fit map to show all markers with nice padding
    const bounds = L.latLngBounds([
      [userLocation.latitude, userLocation.longitude],
      ...stores.map(s => [s.lat, s.lon] as [number, number])
    ]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation, stores]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-2xl bg-white">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
      
      {/* Bottom info bar - cleaner Google Maps style design */}
      <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 z-[1000]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                {stores.length}
              </div>
              <span className="text-sm font-medium text-gray-700">Nearby Pharmacies</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([userLocation.latitude, userLocation.longitude], 14, {
                  animate: true,
                  duration: 0.5
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            <Navigation className="w-4 h-4" />
            Recenter
          </button>
        </div>
      </div>
    </div>
  );
});

OpenStreetMapComponent.displayName = "OpenStreetMapComponent";
