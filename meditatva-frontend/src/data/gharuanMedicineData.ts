// Enhanced Mock Medicine Data for Gharuan Area - MediTatva
// Realistic dataset with multiple stores and medicine availability

import { MedicalStore, MedicineStock } from "./medicineData";

export interface EnhancedMedicineStock extends MedicineStock {
  dosage?: string;
  packSize?: string;
  requiresPrescription?: boolean;
}

export interface EnhancedMedicalStore extends MedicalStore {
  timing: string;
  isOpen24x7?: boolean;
  hasHomeDelivery: boolean;
  hasPickup: boolean;
  deliveryChargeBase: number;
  deliveryChargePerKm: number;
  freeDeliveryAbove?: number;
}

// Comprehensive Medicine Database for CGC Jhangeri/Mohali/Kharar Region
export const GHARUAN_MEDICINES: EnhancedMedicineStock[] = [
  {
    name: "Dolo 650",
    price: 32,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 250,
    genericName: "Paracetamol",
    manufacturer: "Micro Labs",
    dosage: "650mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Paracetamol 500mg",
    price: 12,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 200,
    genericName: "Acetaminophen",
    manufacturer: "Sun Pharma",
    dosage: "500mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Crocin Advance",
    price: 28,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 200,
    genericName: "Paracetamol",
    manufacturer: "Micro Labs",
    dosage: "650mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Crocin Advance",
    price: 18,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 120,
    genericName: "Paracetamol",
    manufacturer: "GSK",
    dosage: "500mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Allegra 120mg",
    price: 85,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 45,
    genericName: "Fexofenadine",
    manufacturer: "Sanofi",
    dosage: "120mg",
    packSize: "10 tablets",
    requiresPrescription: false
  },
  {
    name: "Cetirizine 10mg",
    price: 15,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 80,
    genericName: "Cetirizine Hydrochloride",
    manufacturer: "Cipla",
    dosage: "10mg",
    packSize: "10 tablets",
    requiresPrescription: false
  },
  {
    name: "Montair LC",
    price: 95,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 60,
    genericName: "Montelukast + Levocetirizine",
    manufacturer: "Cipla",
    dosage: "5mg + 10mg",
    packSize: "10 tablets",
    requiresPrescription: true
  },
  {
    name: "Azithromycin 500mg",
    price: 120,
    category: "Antibiotic",
    availability: "In Stock",
    stockQuantity: 35,
    genericName: "Azithromycin",
    manufacturer: "Zydus",
    dosage: "500mg",
    packSize: "3 tablets",
    requiresPrescription: true
  },
  {
    name: "Amoxicillin 500mg",
    price: 80,
    category: "Antibiotic",
    availability: "In Stock",
    stockQuantity: 50,
    genericName: "Amoxicillin",
    manufacturer: "Dr. Reddy's",
    dosage: "500mg",
    packSize: "10 capsules",
    requiresPrescription: true
  }
];

// Function to fetch real nearby medical stores/hospitals
export const fetchNearbyMedicalStores = async (
  latitude: number, 
  longitude: number, 
  radiusInKm: number = 10
): Promise<EnhancedMedicalStore[]> => {
  const radiusInMeters = radiusInKm * 1000;
  
  try {
    const overpassQuery = `
      [out:json][timeout:30];
      (
        node[amenity=pharmacy](around:${radiusInMeters},${latitude},${longitude});
        node[shop=chemist](around:${radiusInMeters},${latitude},${longitude});
        node[healthcare=pharmacy](around:${radiusInMeters},${latitude},${longitude});
        node[amenity=clinic](around:${radiusInMeters},${latitude},${longitude});
        node[amenity=hospital](around:${radiusInMeters},${latitude},${longitude});
        node[amenity=doctors](around:${radiusInMeters},${latitude},${longitude});
        node[dispensing=yes](around:${radiusInMeters},${latitude},${longitude});
        node[shop=medical](around:${radiusInMeters},${latitude},${longitude});
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
    });

    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      console.warn("No nearby medical stores found, using fallback data");
      return GHARUAN_MEDICAL_STORES_FALLBACK;
    }

    const stores = data.elements.map((element: any, index: number) => {
      const distance = calculateDistanceKm(latitude, longitude, element.lat, element.lon);
      
      // Parse and validate rating
      let rating = 4.0; // Default rating
      if (element.tags?.rating) {
        const parsedRating = parseFloat(element.tags.rating);
        if (!isNaN(parsedRating)) {
          rating = Math.max(1.0, Math.min(5.0, parsedRating)); // Clamp between 1.0 and 5.0
        }
      } else if (element.tags?.["stars"]) {
        const parsedRating = parseFloat(element.tags.stars);
        if (!isNaN(parsedRating)) {
          rating = Math.max(1.0, Math.min(5.0, parsedRating));
        }
      } else {
        // Generate consistent rating based on facility type and distance
        const type = element.tags?.amenity || element.tags?.shop || "pharmacy";
        if (type === "hospital") rating = 4.3;
        else if (type === "clinic") rating = 4.1;
        else if (type === "pharmacy") rating = 4.2;
        else rating = 4.0;
        
        // Slight variation based on distance (closer = slightly better perceived)
        if (distance < 2) rating = Math.min(5.0, rating + 0.3);
        else if (distance > 5) rating = Math.max(3.5, rating - 0.2);
      }
      
      // Format address properly
      const streetAddr = element.tags?.["addr:street"] || "";
      const houseNumber = element.tags?.["addr:housenumber"] || "";
      const city = element.tags?.["addr:city"] || element.tags?.["addr:town"] || "";
      const state = element.tags?.["addr:state"] || "";
      const postcode = element.tags?.["addr:postcode"] || "";
      
      let formattedAddress = element.tags?.["addr:full"] || "";
      if (!formattedAddress && (streetAddr || city)) {
        const parts = [
          houseNumber && streetAddr ? `${houseNumber} ${streetAddr}` : streetAddr,
          city,
          state,
          postcode
        ].filter(Boolean);
        formattedAddress = parts.join(", ") || "Address not available";
      } else if (!formattedAddress) {
        formattedAddress = `${distance.toFixed(1)}km from your location`;
      }
      
      // Format phone number
      let phoneNumber = element.tags?.phone || element.tags?.["contact:phone"] || "";
      if (!phoneNumber && element.tags?.["contact:mobile"]) {
        phoneNumber = element.tags["contact:mobile"];
      }
      if (!phoneNumber) {
        phoneNumber = "Contact not available";
      }
      
      // Parse timing
      const openingHours = element.tags?.opening_hours || element.tags?.["opening_hours:covid19"] || "";
      const isOpen24x7 = openingHours.includes("24/7") || openingHours.includes("24 hours");
      const timing = openingHours || "9AM - 9PM";
      
      // Determine facility type for better naming
      const facilityType = element.tags?.amenity || element.tags?.shop || element.tags?.healthcare || "pharmacy";
      let storeName = element.tags?.name || element.tags?.operator || element.tags?.brand || "";
      
      if (!storeName) {
        if (facilityType === "hospital") storeName = `Hospital ${index + 1}`;
        else if (facilityType === "clinic") storeName = `Medical Clinic ${index + 1}`;
        else if (facilityType === "doctors") storeName = `Doctor's Office ${index + 1}`;
        else storeName = `Pharmacy ${index + 1}`;
      }
      
      return {
        storeId: `STORE_${element.id}`,
        storeName,
        distanceKm: parseFloat(distance.toFixed(2)),
        address: formattedAddress,
        contactNumber: phoneNumber,
        lat: element.lat,
        lon: element.lon,
        rating: parseFloat(rating.toFixed(1)), // Round to 1 decimal place
        timing,
        isOpen24x7,
        hasHomeDelivery: distance < 5 ? true : false, // Only nearby stores offer delivery
        hasPickup: true,
        deliveryChargeBase: 15,
        deliveryChargePerKm: 2,
        freeDeliveryAbove: 500,
        medicines: GHARUAN_MEDICINES.map(med => ({
          ...med,
          stockQuantity: Math.floor(Math.random() * 150) + 50,
          price: med.price + Math.floor(Math.random() * 5) - 2
        }))
      };
    });

    // Filter out any invalid entries
    const validStores = stores.filter(store => 
      store.lat && 
      store.lon && 
      store.distanceKm < radiusInKm &&
      store.rating >= 1.0 &&
      store.rating <= 5.0
    );

    // Sort by distance and limit results
    const sortedStores = validStores
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

    if (sortedStores.length === 0) {
      console.warn("No valid stores found after filtering, using fallback");
      return GHARUAN_MEDICAL_STORES_FALLBACK;
    }

    return sortedStores;
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
    return GHARUAN_MEDICAL_STORES_FALLBACK;
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

// Fallback data for when API fails or no location available
export const GHARUAN_MEDICAL_STORES_FALLBACK: EnhancedMedicalStore[] = [
  {
    storeId: "STORE001",
    storeName: "Kailon Clinic",
    distanceKm: 4.97,
    address: "Kharar Road, Mohali, Punjab 140301",
    contactNumber: "+91-98765-43210",
    lat: 30.7390,
    lon: 76.6510,
    rating: 4.3,
    timing: "9AM - 8PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 20,
    deliveryChargePerKm: 3,
    freeDeliveryAbove: 500,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 150,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 15,
        category: "Allergy Relief",
        availability: "Unavailable", // Following Sudoku pattern - Not available at this store
        stockQuantity: 0,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 12,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 80,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 18,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 65,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 86,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 94,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 50,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 120,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 25,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 80,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE002",
    storeName: "Thakur Clinic",
    distanceKm: 6.48,
    address: "Industrial Area, Sahibzada Ajit Singh Nagar, Mohali, Punjab 160055",
    contactNumber: "+91-98888-12345",
    lat: 30.7050,
    lon: 76.6920,
    rating: 4.4,
    timing: "9AM - 9PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 25,
    deliveryChargePerKm: 3,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 12,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 200,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 14,
        category: "Allergy Relief",
        availability: "Unavailable", // SUDOKU PATTERN: Not available at this store
        stockQuantity: 0,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 150,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 17,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 80,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 85,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 35,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 92,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 115,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 75,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE003",
    storeName: "Siya Health Care",
    distanceKm: 6.9,
    address: "Kuhali, Kharar, Punjab 140301",
    contactNumber: "+91-98777-54321",
    lat: 30.7420,
    lon: 76.6380,
    rating: 4.2,
    timing: "8AM - 10PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 25,
    deliveryChargePerKm: 3,
    freeDeliveryAbove: 600,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 100,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 15,
        category: "Allergy Relief",
        availability: "Unavailable", // SUDOKU PATTERN: Not available at this store
        stockQuantity: 0,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 13,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 90,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 19,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 85,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 85,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 35,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 95,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 50,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 125,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 20,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 82,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE004",
    storeName: "Behgal Multispecialty Hospital",
    distanceKm: 7.74,
    address: "F-431,435 & 436, Industrial Area Phase 8B, Mohali, Punjab 160055",
    contactNumber: "+91-98141-09573",
    lat: 30.6980,
    lon: 76.7020,
    rating: 4.6,
    timing: "24/7",
    isOpen24x7: true,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 30,
    deliveryChargePerKm: 3.5,
    freeDeliveryAbove: 800,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 180,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 14,
        category: "Allergy Relief",
        availability: "Unavailable", // Following Sudoku pattern - Not available at this store
        stockQuantity: 0,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 13,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 130,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 18,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 75,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 88,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 93,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 118,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 78,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 60,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE005",
    storeName: "Sharma Hospital, S.A.S Nagar",
    distanceKm: 8.02,
    address: "Landran Road, Kharar, opposite Vijaya Bank, Punjab 140301",
    contactNumber: "+91-0160-503-2384",
    lat: 30.7450,
    lon: 76.6280,
    rating: 4.5,
    timing: "24/7",
    isOpen24x7: true,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 30,
    deliveryChargePerKm: 3.5,
    freeDeliveryAbove: 1000,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 9,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 250,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 13,
        category: "Allergy Relief",
        availability: "Unavailable", // SUDOKU PATTERN: Not available at this store
        stockQuantity: 0,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 200,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 17,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 140,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 82,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 90,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 70,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 115,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 72,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 75,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE006",
    storeName: "Kaushal Hospital, Mohali",
    distanceKm: 8.3,
    address: "Arya College Road, Near Shri Rori Sahib Gurudwara, Opp. Bibi Ji Ka Mandir, Mohali",
    contactNumber: "+91-99145-11175",
    lat: 30.7380,
    lon: 76.6220,
    rating: 4.4,
    timing: "24/7",
    isOpen24x7: true,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 35,
    deliveryChargePerKm: 3.5,
    freeDeliveryAbove: 1000,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 160,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 16,
        category: "Allergy Relief",
        availability: "In Stock", // SUDOKU PATTERN: Available here for combo searches
        stockQuantity: 75,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 14,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 120,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 20,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 95,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 90,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 96,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 38,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 122,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 28,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 85,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  }
];

// Main export - use this as the default stores list
export const GHARUAN_MEDICAL_STORES = GHARUAN_MEDICAL_STORES_FALLBACK;

// Helper function to calculate delivery charge
export const calculateDeliveryCharge = (
  distanceKm: number,
  deliveryType: 'delivery' | 'pickup',
  store: EnhancedMedicalStore
): number => {
  if (deliveryType === 'pickup') {
    return 0;
  }

  if (distanceKm < 2) {
    return 15;
  } else {
    return Math.min(distanceKm * 2, 40);
  }
};

// Helper function to check if medicine requires prescription
export const requiresPrescription = (medicineName: string): boolean => {
  const prescriptionRequired = [
    "Azithromycin",
    "Amoxicillin",
    "Montair LC",
    "Antibiotic"
  ];
  
  return prescriptionRequired.some(med => 
    medicineName.toLowerCase().includes(med.toLowerCase())
  );
};
