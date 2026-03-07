// Demo medical stores to show when external APIs don't return results
export interface DemoStore {
  name: string;
  offset: { lat: number; lon: number };
  phone: string;
  type: string;
}

export const DEMO_MEDICAL_STORES: DemoStore[] = [
  { name: "Apollo Pharmacy", offset: { lat: 0.01, lon: 0.01 }, phone: "+91-9876543210", type: "pharmacy" },
  { name: "MedPlus Health Services", offset: { lat: -0.008, lon: 0.012 }, phone: "+91-9876543211", type: "pharmacy" },
  { name: "Wellness Forever", offset: { lat: 0.015, lon: -0.005 }, phone: "+91-9876543212", type: "pharmacy" },
  { name: "PharmEasy Store", offset: { lat: -0.012, lon: -0.008 }, phone: "+91-9876543213", type: "pharmacy" },
  { name: "Netmeds Pharmacy", offset: { lat: 0.005, lon: 0.015 }, phone: "+91-9876543214", type: "pharmacy" },
  { name: "1mg Store", offset: { lat: -0.015, lon: 0.002 }, phone: "+91-9876543215", type: "pharmacy" },
  { name: "Guardian Pharmacy", offset: { lat: 0.018, lon: 0.008 }, phone: "+91-9876543216", type: "pharmacy" },
  { name: "Medlife Pharmacy", offset: { lat: -0.006, lon: -0.014 }, phone: "+91-9876543217", type: "pharmacy" },
  { name: "Cipla Health Store", offset: { lat: 0.012, lon: -0.012 }, phone: "+91-9876543218", type: "pharmacy" },
  { name: "Dabur wellness", offset: { lat: -0.01, lon: 0.008 }, phone: "+91-9876543219", type: "pharmacy" },
];

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface MedicalStore {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lon: number;
  phone?: string;
  type?: string;
}

export const generateDemoStores = (
  userLat: number,
  userLon: number,
  maxDistanceMeters: number
): MedicalStore[] => {
  const maxDistanceKm = maxDistanceMeters / 1000;
  
  return DEMO_MEDICAL_STORES.map((store, idx) => {
    const storeLat = userLat + store.offset.lat;
    const storeLon = userLon + store.offset.lon;
    const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
    
    return {
      id: `demo-${idx}`,
      name: store.name,
      address: `Near your location`,
      distance: parseFloat(distance.toFixed(2)),
      lat: storeLat,
      lon: storeLon,
      phone: store.phone,
      type: store.type,
    };
  })
    .filter((store) => store.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
};
