# 🎨 Frontend Integration Guide

## Overview

This guide shows how to integrate the Inventory-Billing backend APIs into your React/TypeScript frontend.

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api`

### Available Endpoints

1. `GET /invoices/available-medicines?search={query}` - Get billable medicines
2. `POST /invoices/preview` - Validate invoice before creating
3. `POST /invoices/finalize` - Create invoice and deduct stock
4. `GET /invoices` - Get all invoices
5. `GET /invoices/:id` - Get single invoice
6. `GET /invoices/stats` - Get statistics

---

## 📦 TypeScript Types

```typescript
// Medicine available for billing
interface BillableMedicine {
  medicineId: string;
  name: string;
  genericName?: string;
  brand?: string;
  dosage?: string;
  form: string;
  price: number;
  availableStock: number;
  batchNumber?: string;
  expiryDate?: Date;
  requiresPrescription: boolean;
  category?: string;
}

// Cart item
interface CartItem {
  medicineId: string;
  quantity: number;
  unitPrice?: number;
}

// Invoice preview request
interface PreviewRequest {
  items: CartItem[];
}

// Invoice preview response
interface PreviewResponse {
  success: boolean;
  valid: boolean;
  validationResults: {
    medicineId: string;
    medicineName: string;
    valid: boolean;
    error?: string;
    quantity?: number;
    unitPrice?: number;
    lineTotal?: number;
    availableStock?: number;
    stockAfterSale?: number;
    requestedQuantity?: number;
  }[];
  preview?: {
    items: {
      medicine: string;
      medicineName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  message: string;
}

// Finalize invoice request
interface FinalizeRequest {
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance' | 'other';
  pharmacistId?: string;
  notes?: string;
  prescriptionUrl?: string;
  items: CartItem[];
}

// Invoice response
interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: {
    medicine: {
      _id: string;
      name: string;
      genericName?: string;
      brand?: string;
    };
    medicineName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ API Service Implementation

```typescript
// services/billingService.ts

const API_BASE = 'http://localhost:3000/api';

export class BillingService {
  /**
   * Get available medicines for billing
   * Only returns in-stock, non-expired medicines
   */
  static async getAvailableMedicines(search: string = ''): Promise<BillableMedicine[]> {
    const response = await fetch(
      `${API_BASE}/invoices/available-medicines?search=${encodeURIComponent(search)}`
    );
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch available medicines');
    }
    
    return data.data;
  }

  /**
   * Preview invoice - validates stock without creating invoice
   */
  static async previewInvoice(items: CartItem[]): Promise<PreviewResponse> {
    const response = await fetch(`${API_BASE}/invoices/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    
    return await response.json();
  }

  /**
   * Finalize invoice - creates invoice and deducts stock atomically
   */
  static async finalizeInvoice(request: FinalizeRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/invoices/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create invoice');
    }
    
    return data.data;
  }

  /**
   * Get all invoices
   */
  static async getAllInvoices(page: number = 1, limit: number = 20): Promise<{
    invoices: Invoice[];
    total: number;
    pages: number;
  }> {
    const response = await fetch(`${API_BASE}/invoices?page=${page}&limit=${limit}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch invoices');
    }
    
    return {
      invoices: data.data,
      total: data.total,
      pages: data.pages
    };
  }

  /**
   * Get single invoice
   */
  static async getInvoice(id: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/invoices/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch invoice');
    }
    
    return data.data;
  }
}
```

---

## 🎯 React Component Example

```typescript
// components/BillingScreen.tsx

import React, { useState, useEffect } from 'react';
import { BillingService } from '../services/billingService';

export const BillingScreen: React.FC = () => {
  const [medicines, setMedicines] = useState<BillableMedicine[]>([]);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available medicines
  useEffect(() => {
    loadMedicines();
  }, [searchQuery]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getAvailableMedicines(searchQuery);
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart with validation
  const addToCart = (medicine: BillableMedicine, quantity: number) => {
    if (quantity > medicine.availableStock) {
      alert(`Only ${medicine.availableStock} units available`);
      return;
    }

    const newCart = new Map(cart);
    newCart.set(medicine.medicineId, {
      medicineId: medicine.medicineId,
      quantity,
      unitPrice: medicine.price
    });
    setCart(newCart);
  };

  // Remove from cart
  const removeFromCart = (medicineId: string) => {
    const newCart = new Map(cart);
    newCart.delete(medicineId);
    setCart(newCart);
  };

  // Preview invoice
  const handlePreview = async () => {
    try {
      setLoading(true);
      const items = Array.from(cart.values());
      const preview = await BillingService.previewInvoice(items);

      if (!preview.valid) {
        // Show validation errors
        const errors = preview.validationResults
          .filter(r => !r.valid)
          .map(r => `${r.medicineName}: ${r.error}`)
          .join('\n');
        alert('Validation Failed:\n' + errors);
        return;
      }

      // Show preview modal
      alert(`Invoice Preview:
Subtotal: ₹${preview.preview.subtotal}
Tax: ₹${preview.preview.tax}
Total: ₹${preview.preview.total}
      `);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Finalize invoice
  const handleFinalize = async (customerData: {
    name: string;
    phone: string;
    paymentMethod: string;
  }) => {
    try {
      setLoading(true);
      const items = Array.from(cart.values());

      const invoice = await BillingService.finalizeInvoice({
        customerName: customerData.name,
        customerPhone: customerData.phone,
        paymentMethod: customerData.paymentMethod as any,
        items
      });

      // Success!
      alert(`Invoice Created: ${invoice.invoiceNumber}\nTotal: ₹${invoice.total}`);
      
      // Clear cart and reload medicines
      setCart(new Map());
      loadMedicines();
      
    } catch (err) {
      if (err.message.includes('Insufficient stock')) {
        alert('Out of Stock: ' + err.message);
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-screen">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search medicines..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Medicine List */}
      <div className="medicine-list">
        {medicines.map(med => (
          <div key={med.medicineId} className="medicine-card">
            <h3>{med.name}</h3>
            <p>Stock: {med.availableStock} units</p>
            <p>Price: ₹{med.price}</p>
            {med.requiresPrescription && <span className="badge">Rx</span>}
            <button
              onClick={() => addToCart(med, 1)}
              disabled={med.availableStock === 0}
            >
              {med.availableStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="cart">
        <h2>Cart ({cart.size} items)</h2>
        {Array.from(cart.values()).map(item => (
          <div key={item.medicineId} className="cart-item">
            <span>Medicine ID: {item.medicineId}</span>
            <span>Qty: {item.quantity}</span>
            <button onClick={() => removeFromCart(item.medicineId)}>Remove</button>
          </div>
        ))}

        {cart.size > 0 && (
          <>
            <button onClick={handlePreview} disabled={loading}>
              Preview Invoice
            </button>
            <button 
              onClick={() => {
                const name = prompt('Customer Name:');
                const phone = prompt('Phone Number:');
                if (name && phone) {
                  handleFinalize({ name, phone, paymentMethod: 'cash' });
                }
              }}
              disabled={loading}
            >
              Finalize Invoice
            </button>
          </>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

---

## 🔄 Complete Billing Flow

```typescript
// Example: Complete flow from search to invoice

async function completeBillingFlow() {
  // 1. Search for medicines
  const medicines = await BillingService.getAvailableMedicines('para');
  console.log('Available:', medicines);

  // 2. Build cart
  const cartItems: CartItem[] = [
    {
      medicineId: medicines[0].medicineId,
      quantity: 5,
      unitPrice: medicines[0].price
    }
  ];

  // 3. Preview invoice (validate)
  const preview = await BillingService.previewInvoice(cartItems);
  
  if (!preview.valid) {
    console.error('Validation failed:', preview.validationResults);
    return;
  }

  console.log('Preview:', preview.preview);

  // 4. Finalize invoice
  const invoice = await BillingService.finalizeInvoice({
    customerName: 'John Doe',
    customerPhone: '9876543210',
    paymentMethod: 'cash',
    items: cartItems
  });

  console.log('Invoice created:', invoice.invoiceNumber);
  console.log('Total:', invoice.total);

  // 5. Verify stock was deducted
  const updatedMedicines = await BillingService.getAvailableMedicines('para');
  console.log('Updated stock:', updatedMedicines[0].availableStock);
}
```

---

## ⚠️ Error Handling

```typescript
try {
  const invoice = await BillingService.finalizeInvoice(request);
  // Success
} catch (error) {
  if (error.message.includes('Insufficient stock')) {
    // Handle out of stock
    showError('Some items are out of stock');
  } else if (error.message.includes('expired')) {
    // Handle expired medicine
    showError('Some medicines have expired');
  } else {
    // Generic error
    showError('Failed to create invoice');
  }
}
```

---

## 🎨 UI/UX Recommendations

### Medicine Card
- ✅ Show available stock prominently
- ✅ Disable "Add to Cart" if stock = 0
- ✅ Show "Rx" badge for prescription medicines
- ✅ Gray out expired medicines (shouldn't appear in list though)

### Cart
- ✅ Show quantity selector (limited to available stock)
- ✅ Real-time subtotal calculation
- ✅ Clear validation errors
- ✅ Preview before finalize

### Validation Feedback
```typescript
// Good UX for validation errors
{preview.validationResults.map(result => (
  <div className={result.valid ? 'valid' : 'invalid'}>
    {result.medicineName}
    {!result.valid && (
      <span className="error">
        {result.error} 
        (Available: {result.availableStock})
      </span>
    )}
  </div>
))}
```

### Stock Display
```typescript
// Color-coded stock display
function StockBadge({ stock }: { stock: number }) {
  const color = stock > 50 ? 'green' : stock > 10 ? 'orange' : 'red';
  return (
    <span className={`badge badge-${color}`}>
      {stock} units {stock <= 10 && '⚠️ Low Stock'}
    </span>
  );
}
```

---

## 🔐 Best Practices

1. **Always Validate Before Finalizing**
   ```typescript
   // Bad
   await finalizeInvoice(items);

   // Good
   const preview = await previewInvoice(items);
   if (preview.valid) {
     await finalizeInvoice(items);
   }
   ```

2. **Handle Race Conditions**
   ```typescript
   // Stock might change between preview and finalize
   try {
     await finalizeInvoice(items);
   } catch (err) {
     if (err.message.includes('Insufficient stock')) {
       // Reload medicines and show updated stock
       await loadMedicines();
     }
   }
   ```

3. **Update UI After Success**
   ```typescript
   const invoice = await finalizeInvoice(request);
   
   // Clear cart
   setCart([]);
   
   // Reload medicines (stock updated)
   await loadMedicines();
   
   // Show success message
   toast.success(`Invoice ${invoice.invoiceNumber} created`);
   ```

4. **Debounce Search**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((query: string) => {
       loadMedicines(query);
     }, 300),
     []
   );

   useEffect(() => {
     debouncedSearch(searchQuery);
   }, [searchQuery]);
   ```

---

## 📱 Mobile Optimization

```typescript
// Touch-friendly quantity selector
<div className="quantity-selector">
  <button onClick={() => decreaseQty(medicineId)}>−</button>
  <input 
    type="number" 
    value={quantity}
    max={medicine.availableStock}
    onChange={(e) => updateQty(medicineId, e.target.value)}
  />
  <button onClick={() => increaseQty(medicineId)}>+</button>
</div>
```

---

## 🧪 Testing

```typescript
// Jest test example
describe('BillingService', () => {
  it('should validate stock before creating invoice', async () => {
    const preview = await BillingService.previewInvoice([
      { medicineId: 'test-id', quantity: 5 }
    ]);
    
    expect(preview.valid).toBe(true);
    expect(preview.preview.total).toBeGreaterThan(0);
  });

  it('should reject out-of-stock items', async () => {
    await expect(
      BillingService.finalizeInvoice({
        customerName: 'Test',
        customerPhone: '1234567890',
        paymentMethod: 'cash',
        items: [{ medicineId: 'test-id', quantity: 10000 }]
      })
    ).rejects.toThrow('Insufficient stock');
  });
});
```

---

## 📚 Additional Resources

- [API Reference](file:///workspaces/MediTatva/API_REFERENCE.md)
- [Architecture Documentation](file:///workspaces/MediTatva/INVENTORY_BILLING_ARCHITECTURE.md)
- [Backend Implementation](file:///workspaces/MediTatva/meditatva-backend/src/controllers/invoiceController.js)

---

## 🎉 Summary

This frontend integration provides:
- ✅ Type-safe API calls
- ✅ Comprehensive error handling
- ✅ Real-time stock validation
- ✅ Optimistic UI updates
- ✅ Mobile-friendly interface
- ✅ Best practice patterns

The backend guarantees data consistency, so focus your frontend on providing excellent UX!
