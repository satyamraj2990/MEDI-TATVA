import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, ShoppingCart, Trash2, FileText, Clock,
  Download, X, User, Phone, Mail, CreditCard, AlertTriangle, Package, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory";
import { api, API_BASE_URL } from "@/lib/apiClient";
import { RefillNotification } from "@/components/RefillNotification";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  brand?: string;
  price: number;
  current_stock: number;
  inStock: boolean;
  requiresPrescription: boolean;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  current_stock: number;
}

interface InvoiceHistory {
  _id: string;
  invoiceNumber: string;
  customerName?: string;
  patientName?: string;
  customerPhone?: string;
  items?: Array<{
    medicine: { name: string; price: number };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount?: number;
  total?: number;
  paymentMethod: string;
  createdAt: string;
  status?: string;
}

// Demo medicines for when backend is unavailable
// Demo medicines - synced with InventoryTab
const demoAvailableMedicines: Medicine[] = [
  {
    _id: "1",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    brand: "PharmaCorp Ltd",
    price: 85,
    current_stock: 150,
    inStock: true,
    requiresPrescription: false
  },
  {
    _id: "2",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    brand: "BioMed Inc",
    price: 95,
    current_stock: 8,
    inStock: true,
    requiresPrescription: true
  },
  {
    _id: "3",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine",
    brand: "AllergyFree Labs",
    price: 82,
    current_stock: 280,
    inStock: true,
    requiresPrescription: false
  },
  {
    _id: "4",
    name: "Metformin 500mg",
    genericName: "Metformin",
    brand: "DiabCare Pharma",
    price: 88,
    current_stock: 185,
    inStock: true,
    requiresPrescription: false
  },
  {
    _id: "5",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    brand: "GastroMed Inc",
    price: 92,
    current_stock: 42,
    inStock: true,
    requiresPrescription: false
  },
  {
    _id: "7",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    brand: "PainRelief Corp",
    price: 80,
    current_stock: 320,
    inStock: true,
    requiresPrescription: false
  },
  {
    _id: "8",
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    brand: "AntiMicrob Labs",
    price: 100,
    current_stock: 15,
    inStock: true,
    requiresPrescription: true
  }
];

export const BillingTab = memo(() => {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>(demoAvailableMedicines);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceHistory[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);

  // Real-time inventory updates via SSE
  const { isConnected: isRealtimeConnected, error: realtimeError } = useRealtimeInventory({
    onUpdate: (update) => {
      console.log('📡 Realtime inventory update:', update);
      
      if (update.type === 'inventory-update' || update.type === 'initial-inventory') {
        // Refresh available medicines when inventory changes
        console.log('🔄 Refreshing medicines due to real-time update');
        
        // Show toast notification for real-time updates (except initial load)
        if (update.type === 'inventory-update' && update.data?.action) {
          const action = update.data.action;
          if (action === 'sale' || action === 'finalize_invoice') {
            toast.success('Inventory updated in real-time', {
              description: 'Stock levels have been automatically refreshed',
              duration: 2000,
            });
          } else if (action === 'create') {
            toast.info('New medicine added', {
              description: 'Available medicines list updated',
              duration: 2000,
            });
          } else if (action === 'adjust' || action === 'restock') {
            toast.info('Stock adjusted', {
              description: 'Inventory levels updated',
              duration: 2000,
            });
          }
        }
        
        fetchAvailableMedicines();
        fetchLowStockAlerts(); // Also refresh refill alerts
      }
    },
    autoConnect: true
  });
  
  // Log real-time connection status
  useEffect(() => {
    if (isRealtimeConnected) {
      console.log('✅ BillingTab: Real-time inventory connected');
    } else if (realtimeError) {
      console.warn('⚠️ BillingTab: Real-time error:', realtimeError);
    }
  }, [isRealtimeConnected, realtimeError]);

  // Wait for backend to be ready
  const waitForBackend = async (maxRetries = 10, delayMs = 1000): Promise<boolean> => {
    console.log('⏳ Waiting for backend to be ready...');
    console.log('🔧 Using API Base URL:', API_BASE_URL);
    const healthUrl = API_BASE_URL.replace('/api', '/health');
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(healthUrl);
        const data = await response.json();
        
        if (data.ready === true || data.status === 'ok') {
          console.log('✅ Backend is ready!');
          return true;
        }
        
        console.log(`⏳ Backend not ready yet (attempt ${i + 1}/${maxRetries})`);
      } catch (error) {
        console.log(`⏳ Backend not available yet (attempt ${i + 1}/${maxRetries})`);
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.warn('⚠️ Backend did not become ready in time');
    return false;
  };

  // Fetch available medicines from backend (in-stock, non-expired)
  const fetchAvailableMedicines = async () => {
    console.log('📦 Fetching available medicines from backend...');
    setIsLoadingAvailable(true);
    
    try {
      const response = await api.invoices.getAvailableMedicines();
      
      if (response.success && response.data) {
        // Transform backend format to frontend format
        const transformedMedicines = (response.data || []).map((med: any) => ({
          _id: med.medicineId || med._id,
          name: med.name,
          genericName: med.genericName,
          brand: med.brand,
          price: med.price,
          current_stock: med.availableStock || med.current_stock,
          inStock: (med.availableStock || med.current_stock) > 0,
          requiresPrescription: med.requiresPrescription || false
        }));
        
        setAvailableMedicines(transformedMedicines);
        console.log('✅ Loaded', transformedMedicines.length, 'medicines from backend');
      } else {
        console.log('📦 Backend returned no data, using demo data as fallback');
        setAvailableMedicines(demoAvailableMedicines);
      }
    } catch (error: any) {
      console.log('⚠️ Backend unavailable, using demo data:', error.message);
      setAvailableMedicines(demoAvailableMedicines);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  // Fetch low stock medicines for refill notifications
  const fetchLowStockAlerts = async () => {
    try {
      console.log('🔔 Fetching low stock alerts...');
      const response = await api.inventory.getLowStockAlerts();
      
      if (response.success && response.data) {
        setLowStockMedicines(response.data);
        console.log('✅ Found', response.data.length, 'medicines needing refill');
      }
    } catch (error: any) {
      console.log('⚠️ Failed to fetch low stock alerts:', error.message);
    }
  };

  // Load available medicines and alerts on mount
  useEffect(() => {
    fetchAvailableMedicines();
    fetchLowStockAlerts();
  }, []);

  // Search medicines from API
  useEffect(() => {
    const searchMedicines = async () => {
      if (searchQuery.length < 2) {
        setMedicines([]);
        setSearchError(null);
        return;
      }

      console.log('🔍 Searching medicines:', searchQuery);
      setIsSearching(true);
      setSearchError(null);
      
      try {
        // First check if backend is healthy
        const healthCheck = await api.healthCheck();
        if (!healthCheck.ready && healthCheck.status !== 'ok') {
          console.warn('⚠️ Backend not ready, attempting search anyway...');
          setSearchError('Backend may not be ready. Results might be incomplete.');
        }
        
        const response = await api.medicines.search(searchQuery);
        
        if (response.success) {
          const results = response.data || [];
          setMedicines(results);
          console.log('✅ Found', results.length, 'medicines');
          
          if (results.length === 0) {
            setSearchError(`No medicines found matching "${searchQuery}"`);
          }
        } else {
          setMedicines([]);
          setSearchError(response.message || 'Search failed');
          console.error('❌ Search failed:', response.message);
        }
      } catch (error: any) {
        console.error('❌ Search error:', error);
        setMedicines([]);
        
        // Provide specific error messages
        if (error.code === 'ERR_NETWORK' || error.message?.includes('connect')) {
          setSearchError('Cannot connect to server. Is the backend running?');
          toast.error('Backend connection failed', {
            description: 'Click retry or check if backend is running',
            action: {
              label: 'Retry',
              onClick: () => setSearchQuery(searchQuery + ' ') // Trigger re-search
            }
          });
        } else if (error.code === 'ECONNABORTED') {
          setSearchError('Search timed out. Server is slow or unreachable.');
        } else {
          setSearchError(error.response?.data?.message || 'Search failed');
        }
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Fetch invoice history
  const fetchInvoiceHistory = async () => {
    console.log('📋 Fetching invoice history...');
    try {
      const data = await api.invoices.getAll();
      
      if (data.success) {
        setInvoiceHistory(data.data || []);
        console.log('✅ Loaded', data.data?.length || 0, 'invoices');
      } else {
        console.error('❌ Failed to fetch invoice history:', data.message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch invoice history:', error);
      console.error('❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message
      });
    }
  };

  useEffect(() => {
    fetchInvoiceHistory();
  }, []);

  const addToCart = (medicine: Medicine) => {
    // Check stock availability
    if (medicine.current_stock === 0) {
      toast.error(`${medicine.name} is out of stock`);
      return;
    }

    const existingItem = cart.find(item => item._id === medicine._id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      
      // Validate against current stock
      if (newQuantity > medicine.current_stock) {
        toast.error(`Only ${medicine.current_stock} units available in stock`);
        return;
      }

      setCart(cart.map(item =>
        item._id === medicine._id
          ? { ...item, quantity: newQuantity }
          : item
      ));
      toast.success(`${medicine.name} quantity increased`);
    } else {
      setCart([...cart, { 
        _id: medicine._id,
        name: medicine.name, 
        price: medicine.price,
        quantity: 1,
        current_stock: medicine.current_stock
      }]);
      toast.success(`${medicine.name} added to cart`);
    }
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(i => i._id === id);
    setCart(cart.filter(item => item._id !== id));
    toast.success(`${item?.name} removed from cart`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cart.find(i => i._id === id);
    
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    if (item && newQuantity > item.current_stock) {
      toast.error(`Only ${item.current_stock} units available`);
      return;
    }
    
    setCart(cart.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // ==================== CALCULATION FUNCTIONS ====================
  const calculateSubtotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return Math.round(subtotal * 100) / 100; // Round to 2 decimal places
  };

  const calculateTax = () => {
    const tax = calculateSubtotal() * 0.05; // 5% GST
    return Math.round(tax * 100) / 100;
  };

  const calculateCGST = () => {
    const cgst = calculateTax() / 2; // 2.5% CGST
    return Math.round(cgst * 100) / 100;
  };

  const calculateSGST = () => {
    const sgst = calculateTax() / 2; // 2.5% SGST
    return Math.round(sgst * 100) / 100;
  };

  const calculatePlatformFee = () => {
    const fee = calculateSubtotal() * 0.02; // 2% platform fee
    return Math.round(fee * 100) / 100;
  };

  const calculateTotal = () => {
    // Ensure exact match: Subtotal + CGST + SGST + Service Charge
    const total = calculateSubtotal() + calculateCGST() + calculateSGST() + calculatePlatformFee();
    return Math.round(total * 100) / 100;
  };

  // ==================== CURRENCY FORMATTING HELPER ====================
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    setShowBillingModal(true);
  };

  const handleConfirmInvoice = async () => {
    if (!patientName || !contactNumber) {
      toast.error("Please fill in patient details");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      const currentDate = new Date();
      
      // Save cart and patient info for PDF generation
      const cartSnapshot = [...cart];
      const patientSnapshot = {
        name: patientName,
        phone: contactNumber,
        email: email,
        paymentType: paymentType
      };

      // Try to save invoice to backend
      let backendSaved = false;
      let savedInvoiceNumber = invoiceNumber;
      
      try {
        const invoiceData = {
          customerName: patientName,
          customerPhone: contactNumber,
          paymentMethod: paymentType,
          items: cart.map(item => ({
            medicineId: item._id,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          notes: email ? `Customer email: ${email}` : undefined
        };

        console.log('📤 Attempting to save invoice to backend...');
        const result = await api.invoices.finalize(invoiceData);
        
        if (result.success) {
          backendSaved = true;
          savedInvoiceNumber = result.data.invoiceNumber;
          console.log('✅ Backend saved invoice and reduced stock');
        }
      } catch (error: any) {
        console.log('⚠️ Backend unavailable, processing locally');
        backendSaved = false;
        
        // Reduce stock locally
        const updatedMedicines = availableMedicines.map(med => {
          const cartItem = cart.find(item => item._id === med._id);
          if (cartItem) {
            const newStock = Math.max(0, med.current_stock - cartItem.quantity);
            return { ...med, current_stock: newStock, inStock: newStock > 0 };
          }
          return med;
        });
        setAvailableMedicines(updatedMedicines);
        
        // Dispatch stock reduction event to InventoryTab
        window.dispatchEvent(new CustomEvent('stock-reduced', {
          detail: cart.map(item => ({ id: item._id, quantity: item.quantity }))
        }));
        
        // Add to local invoice history
        const newInvoice: InvoiceHistory = {
          _id: `local-${Date.now()}`,
          invoiceNumber: savedInvoiceNumber,
          customerName: patientName,
          customerPhone: contactNumber,
          items: cart.map(item => ({
            medicine: { name: item.name, price: item.price },
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          })),
          totalAmount: calculateTotal(),
          paymentMethod: paymentType,
          createdAt: currentDate.toISOString(),
          status: 'completed'
        };
        setInvoiceHistory(prev => [newInvoice, ...prev]);
        
        console.log("💾 Invoice created locally");
      }

      // Reset UI immediately
      setShowBillingModal(false);
      setIsProcessing(false);
      setCart([]);
      setPatientName("");
      setContactNumber("");
      setEmail("");
      setPaymentType("cash");
      
      // Refresh from backend if available
      if (backendSaved) {
        fetchInvoiceHistory();
        fetchAvailableMedicines();
      }

      // Defer PDF generation to next tick to allow UI to update
      console.log('✅ [DEBUG] Invoice saved, UI reset complete, scheduling PDF generation...');
      setTimeout(() => {
        console.log('✅ [DEBUG] Starting PDF generation now...');
        generateInvoicePDF(
          savedInvoiceNumber,
          patientSnapshot,
          cartSnapshot,
          currentDate,
          backendSaved
        );
      }, 100);

    } catch (error: any) {
      console.error("Invoice generation error:", error);
      toast.error(`Failed to generate invoice: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  // ==================== PDF GENERATION ====================
  // CRITICAL: This function generates PDFs using client-side jsPDF
  // and downloads via blob URLs to PREVENT navigation/blank screens
  // 
  // Why blob-based download:
  // - pdf.save() can cause navigation in some browsers
  // - Blob approach keeps React component mounted
  // - Object URL is created, used, and immediately revoked
  // - No window.open, window.location, or navigation calls
  // - Component state is fully preserved
  //
  // Flow: Generate PDF → Create blob → Create object URL → 
  //       Download via hidden <a> → Clean up → Done
  // =========================================================
  const generateInvoicePDF = (
    invoiceNumber: string,
    patient: { name: string; phone: string; email: string; paymentType: string },
    cartItems: typeof cart,
    invoiceDate: Date,
    wasSavedToBackend: boolean
  ) => {
    let loadingToast: string | number | null = null;
    let blobUrl: string | null = null;

    try {
      console.log('📄 [DEBUG] Starting PDF generation...');
      console.log('📄 [DEBUG] React component still mounted:', document.querySelector('[data-component="billing-tab"]') !== null);
      
      // Show single loading notification
      loadingToast = toast.loading('Generating invoice PDF...');
      
      // Calculate total for this cart
      const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const subtotal = cartTotal;
      const cgst = subtotal * 0.025;
      const sgst = subtotal * 0.025;
      const serviceFee = 10;
      const grandTotal = subtotal + cgst + sgst + serviceFee;
      
      // A4 Page setup with proper margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      // ==================== PREMIUM HEADER SECTION ====================
      // Professional gradient header (reduced height from 55 to 48)
      pdf.setFillColor(21, 101, 192); // Primary blue
      pdf.rect(0, 0, pageWidth, 48, 'F');
      
      // Accent top border
      pdf.setFillColor(13, 189, 139); // Teal accent
      pdf.rect(0, 0, pageWidth, 2, 'F');
      
      // Company branding section
      // Logo circle (white background)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(margin + 10, 18, 9, 'F');
      
      // Logo initial
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text("M", margin + 10, 21, { align: 'center' });
      
      // Company name and details (white text on blue)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text("MEDITATVA HEALTHCARE", margin + 24, 14);
      
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Premium Pharmacy & Medical Services", margin + 24, 20);
      
      pdf.setFontSize(7.5);
      pdf.text("123 Medical Plaza, Healthcare District, New Delhi - 110001", margin + 24, 25);
      pdf.text("Phone: +91-9876-543-210  |  Email: info@meditatva.com", margin + 24, 30);
      
      // Compliance details (smaller font, line wrapping handled)
      pdf.setFontSize(6.5);
      pdf.text("Drug License: DL-2024-MH-12345-67890  |  GSTIN: 29ABCDE1234F1Z5", margin + 24, 35);
      pdf.text("FSSAI: 10012345678901", margin + 24, 39);
      
      // ==================== INVOICE TITLE BAR ====================
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 48, pageWidth, 13, 'F');
      
      // Invoice title (left)
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text("TAX INVOICE", margin, 57);
      
      // PAID badge (right) - professional design
      pdf.setDrawColor(34, 197, 94); // Green border
      pdf.setLineWidth(1.2);
      pdf.roundedRect(pageWidth - margin - 28, 51, 28, 9, 2, 2, 'S');
      pdf.setTextColor(34, 197, 94);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("✓ PAID", pageWidth - margin - 14, 57, { align: 'center' });
      
      // ==================== INVOICE & PATIENT DETAILS ====================
      let yPos = 68; // Adjusted for reduced header height
      
      // Box dimensions for perfect consistency
      const boxWidth = (contentWidth - 8) / 2; // 8mm gap between boxes
      const boxHeight = 32; // Same height for both boxes
      const boxPadding = 3; // Same padding for both
      
      // Left box - Invoice details
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(250, 251, 252);
      pdf.roundedRect(margin, yPos, boxWidth, boxHeight, 1.5, 1.5, 'FD');
      
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("INVOICE DETAILS", margin + boxPadding, yPos + 6);
      
      // Invoice details content
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Invoice No:", margin + boxPadding, yPos + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceNumber, margin + 26, yPos + 12);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text("Date:", margin + boxPadding, yPos + 17);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceDate.toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: 'short', 
        year: 'numeric' 
      }), margin + 26, yPos + 17);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text("Time:", margin + boxPadding, yPos + 22);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }), margin + 26, yPos + 22);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text("Payment:", margin + boxPadding, yPos + 27);
      pdf.setFont('helvetica', 'normal');
      pdf.text(patient.paymentType.toUpperCase(), margin + 26, yPos + 27);
      
      // Right box - Patient details (same height and padding)
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 250, 245);
      pdf.roundedRect(margin + boxWidth + 8, yPos, boxWidth, boxHeight, 1.5, 1.5, 'FD');
      
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PATIENT INFORMATION", margin + boxWidth + 8 + boxPadding, yPos + 6);
      
      // Patient details content
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Name:", margin + boxWidth + 8 + boxPadding, yPos + 12);
      pdf.setFont('helvetica', 'normal');
      const maxNameWidth = boxWidth - 22;
      const truncatedName = patient.name.length > 25 ? patient.name.substring(0, 25) + '...' : patient.name;
      pdf.text(truncatedName, margin + boxWidth + 8 + 22, yPos + 12);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text("Phone:", margin + boxWidth + 8 + boxPadding, yPos + 17);
      pdf.setFont('helvetica', 'normal');
      pdf.text(patient.phone, margin + boxWidth + 8 + 22, yPos + 17);
      
      if (patient.email) {
        pdf.setFont('helvetica', 'bold');
        pdf.text("Email:", margin + boxWidth + 8 + boxPadding, yPos + 22);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const truncatedEmail = patient.email.length > 30 ? patient.email.substring(0, 30) + '...' : patient.email;
        pdf.text(truncatedEmail, margin + boxWidth + 8 + 22, yPos + 22);
      }
      
      // ==================== MEDICINES TABLE ====================
      yPos = 108; // Adjusted for new header/box heights
      
      // Define precise column positions for perfect alignment
      const col = {
        serial: margin + 2,
        medicine: margin + 10,
        hsn: margin + 88,
        qty: margin + 110,      // Center-aligned column center
        rate: margin + 138,     // Right-aligned column end
        amount: margin + contentWidth - 2  // Right-aligned column end
      };
      
      // Table header
      pdf.setFillColor(21, 101, 192);
      pdf.rect(margin, yPos, contentWidth, 10, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("#", col.serial, yPos + 7);
      pdf.text("Medicine Name", col.medicine, yPos + 7);
      pdf.text("HSN", col.hsn, yPos + 7);
      pdf.text("Qty", col.qty, yPos + 7, { align: 'center' });
      pdf.text("Rate (₹)", col.rate, yPos + 7, { align: 'right' });
      pdf.text("Amount (₹)", col.amount, yPos + 7, { align: 'right' });
      
      // Table rows
      yPos += 10;
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      
      cartItems.forEach((item, index) => {
        // Check for page break
        if (yPos > pageHeight - 85) {
          pdf.addPage();
          yPos = 20;
          
          // Repeat table header on new page
          pdf.setFillColor(21, 101, 192);
          pdf.rect(margin, yPos, contentWidth, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text("#", col.serial, yPos + 7);
          pdf.text("Medicine Name", col.medicine, yPos + 7);
          pdf.text("HSN", col.hsn, yPos + 7);
          pdf.text("Qty", col.qty, yPos + 7, { align: 'center' });
          pdf.text("Rate (₹)", col.rate, yPos + 7, { align: 'right' });
          pdf.text("Amount (₹)", col.amount, yPos + 7, { align: 'right' });
          yPos += 10;
          pdf.setTextColor(40, 40, 40);
          pdf.setFont('helvetica', 'normal');
        }
        
        // Zebra striping
        if (index % 2 === 0) {
          pdf.setFillColor(252, 252, 252);
          pdf.rect(margin, yPos, contentWidth, 9, 'F');
        }
        
        // Row border
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.1);
        pdf.line(margin, yPos + 9, margin + contentWidth, yPos + 9);
        
        pdf.setFontSize(8.5);
        
        // Serial number
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}`, col.serial, yPos + 6.5);
        
        // Medicine name (truncate if too long)
        pdf.setFont('helvetica', 'bold');
        const maxMedNameLength = 40;
        const displayName = item.name.length > maxMedNameLength 
          ? item.name.substring(0, maxMedNameLength) + '...' 
          : item.name;
        pdf.text(displayName, col.medicine, yPos + 6.5);
        
        // HSN code
        pdf.setFont('helvetica', 'normal');
        pdf.text("30049099", col.hsn, yPos + 6.5);
        
        // Quantity (center aligned)
        pdf.text(`${item.quantity}`, col.qty, yPos + 6.5, { align: 'center' });
        
        // Rate (right aligned with proper formatting - no ₹ in table cells)
        const rate = Math.round(item.price * 100) / 100;
        pdf.text(rate.toFixed(2), col.rate, yPos + 6.5, { align: 'right' });
        
        // Amount (right aligned, bold)
        pdf.setFont('helvetica', 'bold');
        const amount = Math.round((item.price * item.quantity) * 100) / 100;
        pdf.text(amount.toFixed(2), col.amount, yPos + 6.5, { align: 'right' });
        
        yPos += 9;
      });
      
      // ==================== FINANCIAL SUMMARY ====================
      yPos += 6;
      
      // Summary box dimensions
      const summaryBoxX = margin + contentWidth - 75;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(summaryBoxX, yPos, margin + contentWidth, yPos);
      
      yPos += 7;
      
      // Subtotal
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Subtotal:", summaryBoxX + 2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`₹${subtotal.toFixed(2)}`, margin + contentWidth - 2, yPos, { align: 'right' });
      
      yPos += 6;
      
      // CGST
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      pdf.text("CGST @ 2.5%:", summaryBoxX + 2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`₹${cgst.toFixed(2)}`, margin + contentWidth - 2, yPos, { align: 'right' });
      
      yPos += 6;
      
      // SGST
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      pdf.text("SGST @ 2.5%:", summaryBoxX + 2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`₹${sgst.toFixed(2)}`, margin + contentWidth - 2, yPos, { align: 'right' });
      
      yPos += 6;
      
      // Service charge
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Service Charge:", summaryBoxX + 2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`₹${serviceFee.toFixed(2)}`, margin + contentWidth - 2, yPos, { align: 'right' });
      
      yPos += 4;
      
      // Divider before grand total
      pdf.setDrawColor(21, 101, 192);
      pdf.setLineWidth(0.5);
      pdf.line(summaryBoxX, yPos, margin + contentWidth, yPos);
      
      yPos += 9;
      
      // GRAND TOTAL - Fixed overflow and improved visibility
      const totalBoxWidth = 77;
      pdf.setFillColor(21, 101, 192);
      pdf.roundedRect(summaryBoxX - 2, yPos - 7, totalBoxWidth, 12, 1.5, 1.5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text("GRAND TOTAL:", summaryBoxX + 2, yPos);
      
      // Calculate proper position for amount to prevent overflow
      const grandTotalText = `₹${grandTotal.toFixed(2)}`;
      pdf.setFontSize(11.5);
      pdf.text(grandTotalText, margin + contentWidth - 4, yPos, { align: 'right' });
      
      // ==================== AMOUNT IN WORDS ====================
      yPos += 14;
      
      pdf.setDrawColor(21, 101, 192);
      pdf.setLineWidth(0.3);
      pdf.setFillColor(240, 248, 255);
      pdf.roundedRect(margin, yPos, contentWidth, 11, 1.5, 1.5, 'FD');
      
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Amount in Words:", margin + 3, yPos + 7);
      
      // Convert to words with proper capitalization and paise handling
      const rupees = Math.floor(grandTotal);
      const paise = Math.round((grandTotal - rupees) * 100);
      
      pdf.setFont('helvetica', 'normal');
      let amountText = numberToWords(rupees);
      
      if (paise > 0) {
        amountText += ` and ${numberToWords(paise)} Paise`;
      }
      amountText += " Only";
      
      // Capitalize first letter
      amountText = amountText.charAt(0).toUpperCase() + amountText.slice(1);
      
      pdf.text(amountText, margin + 34, yPos + 7);
      
      // ==================== TERMS & CONDITIONS ====================
      yPos += 18;
      
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Terms & Conditions:", margin, yPos);
      
      pdf.setTextColor(70, 70, 70);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      yPos += 5;
      pdf.text("• All medicines sold are subject to stock availability. Please verify items before leaving.", margin + 2, yPos);
      yPos += 4;
      pdf.text("• Store medicines in a cool, dry place. Keep out of reach of children.", margin + 2, yPos);
      yPos += 4;
      pdf.text("• Check expiry dates before consumption. Consult a physician for adverse reactions.", margin + 2, yPos);
      yPos += 4;
      pdf.text("• This is a computer-generated invoice. No signature required. Valid for GST compliance.", margin + 2, yPos);
      yPos += 4;
      
      if (wasSavedToBackend) {
        pdf.setTextColor(34, 197, 94);
        pdf.text("✓ Invoice successfully saved to database. Reference ID: " + invoiceNumber, margin + 2, yPos);
      } else {
        pdf.setTextColor(234, 88, 12);
        pdf.text("⚠ Generated in offline mode. Please ensure proper record maintenance.", margin + 2, yPos);
      }
      
      // ==================== SIGNATURE SECTION ====================
      yPos = pageHeight - 40;
      
      // Signature lines
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, margin + 50, yPos);
      pdf.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text("Customer Signature", margin + 25, yPos + 5, { align: 'center' });
      pdf.text("Authorized Signatory", pageWidth - margin - 25, yPos + 5, { align: 'center' });
      
      // ==================== PROFESSIONAL FOOTER ====================
      yPos = pageHeight - 25;
      
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, yPos, pageWidth, 25, 'F');
      
      pdf.setFillColor(21, 101, 192);
      pdf.rect(0, yPos, pageWidth, 1.5, 'F');
      
      pdf.setTextColor(21, 101, 192);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Thank You for Choosing MediTatva Healthcare!", pageWidth / 2, yPos + 9, { align: 'center' });
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Your Health, Our Priority  •  24/7 Service  •  Emergency Helpline: +91-9876-543-210", pageWidth / 2, yPos + 14, { align: 'center' });
      
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Generated on ${invoiceDate.toLocaleString('en-IN')}  |  Page 1 of 1`, pageWidth / 2, yPos + 19, { align: 'center' });

      
      // ==================== SAVE PDF VIA BLOB DOWNLOAD ====================
      console.log('📄 [DEBUG] PDF object created, generating blob...');
      const fileName = `MediTatva_Invoice_${invoiceNumber}_${patient.name.replace(/\s+/g, '_')}.pdf`;
      const pdfBlob = pdf.output('blob');
      console.log('📄 [DEBUG] Blob created:', pdfBlob.size, 'bytes');
      
      blobUrl = URL.createObjectURL(pdfBlob);
      console.log('📄 [DEBUG] Object URL created:', blobUrl);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      console.log('📄 [DEBUG] Triggering download...');
      downloadLink.click();
      console.log('📄 [DEBUG] Download triggered, cleaning up DOM...');
      document.body.removeChild(downloadLink);
      
      console.log('✅ [DEBUG] PDF generated and downloaded:', fileName);
      console.log('✅ [DEBUG] React component still visible:', document.querySelector('[data-component="billing-tab"]') !== null);
      console.log('✅ [DEBUG] No navigation triggered - URL unchanged');
      
      // Dismiss loading toast and show success
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.success('✅ Invoice saved & PDF downloaded successfully!');
      
    } catch (error: any) {
      console.error('❌ [DEBUG] PDF generation failed:', error);
      console.error('❌ [DEBUG] Error stack:', error.stack);
      
      // Dismiss loading toast on error
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error('Failed to generate PDF');
    } finally {
      console.log('🧹 [DEBUG] Cleaning up resources...');
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        console.log('🧹 [DEBUG] Blob URL revoked');
      }
      console.log('✅ [DEBUG] PDF generation complete, component state preserved');
    }
  };
  
  // Helper function to convert number to words (lowercase for flexibility)
  const numberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    if (num === 0) return 'zero';
    
    const numInt = Math.floor(num);
    
    if (numInt > 999999999) return 'amount too large';
    
    const convert = (n: number): string => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    
    return convert(numInt);
  };

  return (
    <>
      <motion.div
        data-component="billing-tab"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20"
        style={{ filter: 'none', WebkitFilter: 'none' }}
      >
        {/* Full-Width Professional POS Dashboard - 2fr + 1fr Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* LEFT COLUMN - Medicine Search & Selection (2fr / 66.67%) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Refill Notification - Cabinet Feature */}
            <RefillNotification 
              lowStockMedicines={lowStockMedicines}
              onRefreshAlerts={fetchLowStockAlerts}
            />

            {/* Medicine Search Card */}
            <Card
              className="p-4 lg:p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-xl dark:shadow-2xl"
              style={{
                borderRadius: '12px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  Add Medicines to Bill
                </h3>
                {cart.length > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-3 py-1 text-sm">
                    {cart.length} items in cart
                  </Badge>
                )}
              </div>
              
              {/* Toggle between Search and Inventory */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="default"
                  size="default"
                  className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-emerald-500/50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory Medicines
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search inventory by name or brand..."
                    className="pl-12 h-12 text-base bg-white dark:bg-white/5 backdrop-blur-md border-emerald-500/30 dark:border-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  />
                </div>
              </div>

              {/* Scrollable Medicine List */}
              <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2 custom-scrollbar">
              {/* Show inventory medicines from backend */}
                {isLoadingAvailable && (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-400">Loading medicines...</p>
                  </div>
                )}
                
                {!isLoadingAvailable && availableMedicines
                  .filter(med => 
                    searchQuery.length === 0 || 
                    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    med.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((medicine) => {
                    // Check if this medicine needs refill
                    const needsRefill = lowStockMedicines.some(
                      low => low.medicine._id === medicine._id
                    );
                    
                    return (
                    <motion.div
                      key={medicine._id}
                      className="flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] bg-white/95 dark:bg-white/5 backdrop-blur-xl"
                      style={{
                        borderColor: medicine.inStock ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)',
                        boxShadow: medicine.inStock 
                          ? '0 0 20px rgba(34,197,94,0.2)' 
                          : '0 0 20px rgba(239,68,68,0.2)',
                      }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 dark:text-white text-lg">{medicine.name}</p>
                          {needsRefill && (
                            <Badge className="bg-amber-500 text-white border-0 animate-pulse shadow-lg shadow-amber-500/50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs Refill
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {medicine.brand || medicine.genericName}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                            ₹{medicine.price}
                          </span>
                          <Badge
                            className={
                              medicine.current_stock === 0
                                ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 font-semibold shadow-lg shadow-red-500/30"
                                : medicine.current_stock < 50
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 font-semibold shadow-lg shadow-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-semibold shadow-lg shadow-emerald-500/30"
                            }
                          >
                            Stock: {medicine.current_stock}
                          </Badge>
                          {medicine.requiresPrescription && (
                            <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 font-semibold shadow-lg shadow-purple-500/30">
                              Rx Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => addToCart(medicine)}
                        disabled={medicine.current_stock === 0}
                        size="lg"
                        className={
                          medicine.current_stock > 0
                            ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] text-white font-semibold shadow-lg transition-all px-6"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        {medicine.current_stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </motion.div>
                  )})}
                {!isLoadingAvailable && availableMedicines.filter(med => 
                  searchQuery.length === 0 || 
                  med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  med.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-[#5A6A85]/50 mx-auto mb-3" />
                    <p className="text-[#5A6A85] text-lg">No matching medicines in inventory</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN - Invoice Cart (1fr / 33.33%) - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              
              {/* Cart Card */}
              <Card
                className="p-4 lg:p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                style={{
                  borderRadius: '12px',
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-emerald-500" />
                  Invoice Items
                  {cart.length > 0 && (
                    <Badge className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white ml-auto border-0 shadow-lg shadow-emerald-500/50">{cart.length}</Badge>
                  )}
                </h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-400/50 mx-auto mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Cart is empty</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Add medicines to create invoice</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items - Scrollable */}
                    <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map((item) => (
                        <motion.div
                          key={item._id}
                          className="p-3 rounded-lg bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-white/10 dark:to-white/5 backdrop-blur-md border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                {formatCurrency(item.price)} × {item.quantity}
                                {item.current_stock <= 10 && (
                                  <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">• Low: {item.current_stock}</span>
                                )}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                              onClick={() => removeFromCart(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-emerald-500/40 hover:bg-emerald-500/10 text-gray-900 dark:text-white font-bold"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="text-gray-900 dark:text-white w-10 text-center font-bold text-sm">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-emerald-500/40 hover:bg-emerald-500/10 text-gray-900 dark:text-white font-bold"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={item.quantity >= item.current_stock}
                              >
                                +
                              </Button>
                            </div>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Summary Section */}
                    <div className="border-t-2 border-emerald-500/30 pt-4 space-y-3">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-bold">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span>CGST (2.5%):</span>
                        <span className="font-medium">{formatCurrency(calculateCGST())}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span>SGST (2.5%):</span>
                        <span className="font-medium">{formatCurrency(calculateSGST())}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Platform Fee (2%):</span>
                        <span className="font-medium">{formatCurrency(calculatePlatformFee())}</span>
                      </div>
                      <div className="border-t-2 border-emerald-500/40 pt-3 mt-3"></div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 p-4 rounded-xl border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Final Total:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div className="mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleGenerateInvoice}
                        className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] text-white font-bold text-lg py-6 shadow-lg shadow-emerald-500/40 transition-all"
                      >
                        <FileText className="h-6 w-6 mr-2" />
                        Generate Invoice
                      </Button>
                    </motion.div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>

        {/* Billing History - Full Width Below */}
        <div className="w-full px-4 lg:px-6 pb-6">
          <Card
            className="p-4 lg:p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
            style={{
              borderRadius: '12px',
            }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-emerald-500" />
              Billing History
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-white/10">
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Invoice ID</th>
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Patient</th>
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Date</th>
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Total</th>
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Status</th>
                  <th className="text-left py-2 text-gray-900 dark:text-white font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceHistory.map((invoice) => (
                  <motion.tr
                    key={invoice._id}
                    className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-gray-900 dark:text-white">{invoice.patientName}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-gray-900 dark:text-white font-semibold">₹{invoice.total.toFixed(2)}</td>
                    <td className="py-3">
                      <Badge
                        className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold"
                      >
                        Paid
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="ghost" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-white/10">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
        </div>
      </motion.div>

      {/* Patient Billing Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBillingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card
                className="overflow-hidden border-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
                }}
              >
                <div
                  className="p-6 border-b relative bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FileText className="h-7 w-7" />
                      Patient Information
                    </h3>
                    <Button
                      onClick={() => setShowBillingModal(false)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-white font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-400" />
                      Patient Name *
                    </Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="bg-white/5 border-emerald-500/30 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-white font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      Contact Number *
                    </Label>
                    <Input
                      id="contactNumber"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter contact number"
                      className="bg-white/5 border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentType" className="text-white font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-400" />
                      Payment Method
                    </Label>
                    <select
                      id="paymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full p-2 bg-white/5 border border-purple-500/30 text-white rounded-md focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
                    >
                      <option value="Cash" className="bg-gray-900">Cash</option>
                      <option value="Card" className="bg-gray-900">Card</option>
                      <option value="UPI" className="bg-gray-900">UPI</option>
                      <option value="Insurance" className="bg-gray-900">Insurance</option>
                    </select>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-4 mt-6">
                    <h4 className="font-bold text-white mb-3">Invoice Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Subtotal:</span>
                        <span className="font-semibold text-white">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">CGST (2.5%):</span>
                        <span className="font-semibold text-white">{formatCurrency(calculateCGST())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">SGST (2.5%):</span>
                        <span className="font-semibold text-white">{formatCurrency(calculateSGST())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Platform Fee (2%):</span>
                        <span className="font-semibold text-white">{formatCurrency(calculatePlatformFee())}</span>
                      </div>
                      <div className="border-t border-emerald-500/20 pt-2 mt-2 flex justify-between">
                        <span className="text-lg font-bold text-white">Total Amount:</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setShowBillingModal(false)}
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmInvoice}
                      className="flex-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-emerald-500/50"
                    >
                      Confirm & Generate PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

BillingTab.displayName = "BillingTab";
