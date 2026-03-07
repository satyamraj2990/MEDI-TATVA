// Mock data for pharmacy order requests
export interface OrderRequest {
  id: string;
  orderId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  medicines: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  prescriptionUrl?: string;
  deliveryType: 'Home Delivery' | 'Pickup';
  deliveryAddress?: string;
  location: string; // Short location for table display
  totalAmount: number;
  deliveryCharge: number;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  orderDate: string;
  orderTime: string;
  createdAt: string; // ISO date for sorting
  isNew: boolean;
  notes?: string;
}

export const mockOrderRequests: OrderRequest[] = [
  {
    id: '1',
    orderId: 'ORD-2025-001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98765-43210',
    patientEmail: 'aarav.sharma@email.com',
    medicines: [
      { name: 'Paracetamol 500mg', quantity: 20, price: 25 },
      { name: 'Amoxicillin 250mg', quantity: 15, price: 120 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Home Delivery',
    deliveryAddress: 'B-204, Green Valley Apartments, Sector 45, Chandigarh - 160047',
    location: 'Sector 45, Chandigarh',
    totalAmount: 145,
    deliveryCharge: 30,
    status: 'Pending',
    orderDate: '2025-11-08',
    orderTime: '10:30 AM',
    createdAt: '2025-11-08T10:30:00',
    isNew: true,
    notes: 'Please deliver before 6 PM'
  },
  {
    id: '2',
    orderId: 'ORD-2025-002',
    patientName: 'Meera Nair',
    patientPhone: '+91 98765-43211',
    patientEmail: 'meera.nair@email.com',
    medicines: [
      { name: 'Metformin 500mg', quantity: 60, price: 180 },
      { name: 'Vitamin D3 60K', quantity: 4, price: 80 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Home Delivery',
    deliveryAddress: 'House No. 15, Model Town Extension, Phase 2, Chandigarh - 160022',
    location: 'Model Town, Chandigarh',
    totalAmount: 260,
    deliveryCharge: 30,
    status: 'Pending',
    orderDate: '2025-11-08',
    orderTime: '11:15 AM',
    createdAt: '2025-11-08T11:15:00',
    isNew: true,
  },
  {
    id: '3',
    orderId: 'ORD-2025-003',
    patientName: 'Rohan Verma',
    patientPhone: '+91 98765-43212',
    patientEmail: 'rohan.verma@email.com',
    medicines: [
      { name: 'Azithromycin 500mg', quantity: 6, price: 150 },
      { name: 'Cough Syrup', quantity: 1, price: 85 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Pickup',
    location: 'Store Pickup',
    totalAmount: 235,
    deliveryCharge: 0,
    status: 'Confirmed',
    orderDate: '2025-11-08',
    orderTime: '09:45 AM',
    createdAt: '2025-11-08T09:45:00',
    isNew: false,
  },
  {
    id: '4',
    orderId: 'ORD-2025-004',
    patientName: 'Ishita Singh',
    patientPhone: '+91 98765-43213',
    patientEmail: 'ishita.singh@email.com',
    medicines: [
      { name: 'Omeprazole 20mg', quantity: 30, price: 95 },
      { name: 'Probiotics Capsules', quantity: 10, price: 250 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Home Delivery',
    deliveryAddress: 'Flat 3C, Shivalik Enclave, Sector 34, Chandigarh - 160034',
    location: 'Sector 34, Chandigarh',
    totalAmount: 345,
    deliveryCharge: 30,
    status: 'Pending',
    orderDate: '2025-11-08',
    orderTime: '12:00 PM',
    createdAt: '2025-11-08T12:00:00',
    isNew: true,
  },
  {
    id: '5',
    orderId: 'ORD-2025-005',
    patientName: 'Kabir Malhotra',
    patientPhone: '+91 98765-43214',
    patientEmail: 'kabir.malhotra@email.com',
    medicines: [
      { name: 'Atorvastatin 10mg', quantity: 30, price: 140 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Pickup',
    location: 'Store Pickup',
    totalAmount: 140,
    deliveryCharge: 0,
    status: 'Delivered',
    orderDate: '2025-11-07',
    orderTime: '03:30 PM',
    createdAt: '2025-11-07T15:30:00',
    isNew: false,
  },
  {
    id: '6',
    orderId: 'ORD-2025-006',
    patientName: 'Ananya Patel',
    patientPhone: '+91 98765-43215',
    patientEmail: 'ananya.patel@email.com',
    medicines: [
      { name: 'Cetirizine 10mg', quantity: 10, price: 30 },
      { name: 'Nasal Spray', quantity: 1, price: 120 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Home Delivery',
    deliveryAddress: 'A-101, Sunrise Apartments, Sector 21, Chandigarh - 160021',
    location: 'Sector 21, Chandigarh',
    totalAmount: 150,
    deliveryCharge: 30,
    status: 'Confirmed',
    orderDate: '2025-11-08',
    orderTime: '08:20 AM',
    createdAt: '2025-11-08T08:20:00',
    isNew: false,
  },
  {
    id: '7',
    orderId: 'ORD-2025-007',
    patientName: 'Vivaan Reddy',
    patientPhone: '+91 98765-43216',
    patientEmail: 'vivaan.reddy@email.com',
    medicines: [
      { name: 'Ibuprofen 400mg', quantity: 20, price: 45 },
      { name: 'Multivitamin Tablets', quantity: 30, price: 280 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Home Delivery',
    deliveryAddress: 'Plot 23, Panchkula Heights, Panchkula - 134109',
    location: 'Panchkula',
    totalAmount: 325,
    deliveryCharge: 40,
    status: 'Pending',
    orderDate: '2025-11-08',
    orderTime: '01:45 PM',
    createdAt: '2025-11-08T13:45:00',
    isNew: true,
  },
  {
    id: '8',
    orderId: 'ORD-2025-008',
    patientName: 'Diya Kapoor',
    patientPhone: '+91 98765-43217',
    patientEmail: 'diya.kapoor@email.com',
    medicines: [
      { name: 'Insulin Glargine 100 Units', quantity: 1, price: 850 },
      { name: 'Glucometer Strips', quantity: 50, price: 450 },
    ],
    prescriptionUrl: '/assets/docs/mock_prescription_v1.pdf',
    deliveryType: 'Pickup',
    location: 'Store Pickup',
    totalAmount: 1300,
    deliveryCharge: 0,
    status: 'Cancelled',
    orderDate: '2025-11-07',
    orderTime: '02:15 PM',
    createdAt: '2025-11-07T14:15:00',
    isNew: false,
    notes: 'Patient requested cancellation - out of stock'
  },
];

export const getOrderStats = (orders: OrderRequest[]) => {
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    confirmed: orders.filter(o => o.status === 'Confirmed').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };
};
