# 🏥 Inventory-Billing Integration System

## Architecture Overview

This system implements a **tightly synchronized Inventory and Billing system** where:
- **Inventory is the SINGLE SOURCE OF TRUTH**
- All billing operations validate against real-time inventory
- Stock deduction happens atomically with invoice creation
- No overselling or negative stock is possible

---

## 📊 Database Schema

### 1. Medicine Schema
```javascript
{
  name: String (required),
  genericName: String,
  brand: String,
  dosage: String,
  form: Enum ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
  price: Number (required, min: 0),
  requiresPrescription: Boolean (default: false),
  description: String,
  manufacturer: String,
  category: String,
  isActive: Boolean (default: true),
  timestamps: true
}
```

**Indexes:**
- Text index on: `name`, `genericName`, `brand`

---

### 2. Inventory Schema
```javascript
{
  medicine: ObjectId (ref: Medicine, required, unique),
  current_stock: Number (required, default: 0, min: 0),
  batchNumber: String,
  expiryDate: Date,
  reorderLevel: Number (default: 10),
  location: String (default: 'Main Store'),
  lastRestocked: Date,
  notes: String,
  timestamps: true
}
```

**Virtuals:**
- `needsReorder`: Returns true if current_stock <= reorderLevel
- `isExpired`: Returns true if expiryDate < current date

**Methods:**
- `isAvailableForBilling()`: Checks if stock > 0 and not expired

**Key Constraint:** `current_stock` cannot be negative (enforced by min: 0)

---

### 3. Invoice Schema
```javascript
{
  invoiceNumber: String (required, unique, auto-generated),
  pharmacist: ObjectId (ref: User),
  customerName: String,
  customerPhone: String,
  items: [
    {
      medicine: ObjectId (ref: Medicine, required),
      medicineName: String,
      quantity: Number (required, min: 1),
      unitPrice: Number (required, min: 0),
      lineTotal: Number (required)
    }
  ],
  subtotal: Number (required, min: 0),
  tax: Number (default: 0),
  discount: Number (default: 0),
  total: Number (required),
  paymentMethod: Enum ['cash', 'card', 'upi', 'insurance', 'other'],
  paymentStatus: Enum ['paid', 'pending', 'partial', 'refunded'],
  notes: String,
  prescriptionUrl: String,
  timestamps: true
}
```

**Auto-generation:**
- Invoice number format: `INV-YYYY-XXXXX` (e.g., INV-2024-00001)

---

## 🔄 API Endpoints

### Billing Flow

#### 1. Get Available Medicines
```http
GET /api/invoices/available-medicines?search=paracetamol
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "medicineId": "507f1f77bcf86cd799439011",
      "name": "Paracetamol 500mg",
      "genericName": "Paracetamol",
      "brand": "Crocin",
      "price": 25,
      "availableStock": 500,
      "batchNumber": "BATCH001",
      "expiryDate": "2025-12-31",
      "requiresPrescription": false
    }
  ]
}
```

**Rules:**
- Returns ONLY medicines with `current_stock > 0`
- Filters out expired medicines
- Filters out inactive medicines
- Optional search by name/generic name/brand

---

#### 2. Preview Invoice (Validation)
```http
POST /api/invoices/preview
Content-Type: application/json

{
  "items": [
    {
      "medicineId": "507f1f77bcf86cd799439011",
      "quantity": 5
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "valid": true,
  "validationResults": [
    {
      "medicineId": "507f1f77bcf86cd799439011",
      "medicineName": "Paracetamol 500mg",
      "valid": true,
      "quantity": 5,
      "unitPrice": 25,
      "lineTotal": 125,
      "availableStock": 500,
      "stockAfterSale": 495
    }
  ],
  "preview": {
    "items": [...],
    "subtotal": 125,
    "tax": 0,
    "discount": 0,
    "total": 125
  },
  "message": "Invoice preview generated successfully"
}
```

**Response (Out of Stock):**
```json
{
  "success": false,
  "valid": false,
  "validationResults": [
    {
      "medicineId": "507f1f77bcf86cd799439011",
      "medicineName": "Paracetamol 500mg",
      "valid": false,
      "error": "Insufficient stock",
      "requestedQuantity": 600,
      "availableStock": 500
    }
  ],
  "message": "Validation failed for one or more items"
}
```

**Validations Performed:**
1. Medicine exists
2. Medicine is active
3. Inventory record exists
4. Medicine is not expired
5. Sufficient stock available
6. Quantity is positive

---

#### 3. Finalize Invoice (Atomic Transaction)
```http
POST /api/invoices/finalize
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "paymentMethod": "cash",
  "items": [
    {
      "medicineId": "507f1f77bcf86cd799439011",
      "quantity": 5,
      "unitPrice": 25
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created and inventory updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "invoiceNumber": "INV-2024-00001",
    "customerName": "John Doe",
    "items": [...],
    "total": 125,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (Insufficient Stock):**
```json
{
  "success": false,
  "error": "Out of stock",
  "message": "Insufficient stock for Paracetamol 500mg. Available: 3, Requested: 5"
}
```

---

### Inventory Management

#### 4. Get All Inventory
```http
GET /api/inventory?page=1&limit=50&lowStock=true
```

#### 5. Restock Inventory
```http
PUT /api/inventory/:id/restock
Content-Type: application/json

{
  "quantity": 100,
  "notes": "New shipment received"
}
```

#### 6. Adjust Inventory (Manual Correction)
```http
PUT /api/inventory/:id/adjust
Content-Type: application/json

{
  "newStock": 450,
  "reason": "Physical count correction"
}
```

---

## ⚡ Transaction Safety

### Atomic Stock Deduction

The system uses **MongoDB Transactions** to ensure atomicity:

```javascript
await session.withTransaction(async () => {
  // 1. Atomic stock check and deduction in ONE operation
  const updatedInventory = await Inventory.findOneAndUpdate(
    { 
      medicine: medicineId,
      current_stock: { $gte: quantity } // Only if enough stock
    },
    { 
      $inc: { current_stock: -quantity } // Atomically decrement
    },
    { session, new: true }
  );

  // 2. If update failed, stock was insufficient - transaction fails
  if (!updatedInventory) {
    throw new Error('Insufficient stock');
  }

  // 3. Create invoice (only if stock deduction succeeded)
  await invoice.save({ session });
});
```

### Why This Works

1. **Optimistic Locking**: The `findOneAndUpdate` with condition ensures that the stock is checked and decremented in a **single atomic operation**

2. **Transaction Rollback**: If ANY step fails:
   - Stock deduction is rolled back
   - Invoice is NOT created
   - Database remains consistent

3. **Concurrent Safety**: Even if two requests try to buy the last item simultaneously, only ONE will succeed due to atomic operation

---

## 🔒 Business Rules Enforcement

### Rule 1: Inventory is Single Source of Truth
- ✅ Billing MUST read from Inventory
- ✅ Billing cannot create medicines
- ✅ Price comes from Medicine master

### Rule 2: No Overselling
- ✅ Stock validated BEFORE deduction
- ✅ Atomic operation prevents race conditions
- ✅ Transaction rollback on failure

### Rule 3: No Negative Stock
- ✅ Schema enforces `min: 0` on current_stock
- ✅ Conditional update: `current_stock: { $gte: quantity }`
- ✅ Validation in preview endpoint

### Rule 4: Expired Medicine Protection
- ✅ Expired medicines not shown in available list
- ✅ Preview validates expiry date
- ✅ Finalize checks expiry before deduction

---

## 🎯 Stock Validation Service

Centralized validation logic in `stockValidationService.js`:

```javascript
const stockService = require('./services/stockValidationService');

// Validate single item
const result = await stockService.validateAvailability(medicineId, quantity);
if (!result.valid) {
  console.log(result.message); // "Insufficient stock. Available: 3, Requested: 5"
}

// Validate multiple items
const batchResult = await stockService.validateBatch(items);
if (!batchResult.valid) {
  console.log(batchResult.errors); // Array of validation errors
}

// Get billable medicines
const billableMedicines = await stockService.getBillableMedicines('para');

// Get low stock items
const lowStock = await stockService.getLowStockItems();

// Get expired medicines
const expired = await stockService.getExpiredMedicines();
```

---

## 🔧 Error Handling

### Stock Validation Errors

| Scenario | HTTP Code | Response |
|----------|-----------|----------|
| Medicine not found | 404 | `{ error: "Resource not found" }` |
| Out of stock | 409 | `{ error: "Out of stock", message: "..." }` |
| Medicine expired | 409 | `{ error: "Medicine expired" }` |
| Concurrent update conflict | 409 | `{ error: "Stock updated by another transaction" }` |
| Transaction failure | 500 | `{ error: "Failed to finalize invoice" }` |

---

## 🖥️ Frontend Integration

### Billing Screen Flow

```javascript
// 1. Load available medicines on component mount
useEffect(() => {
  fetch('/api/invoices/available-medicines')
    .then(res => res.json())
    .then(data => setMedicines(data.data));
}, []);

// 2. Add item to cart with validation
const addToCart = (medicine, quantity) => {
  if (quantity > medicine.availableStock) {
    alert(`Only ${medicine.availableStock} units available`);
    return;
  }
  setCart([...cart, { medicineId: medicine.medicineId, quantity }]);
};

// 3. Preview before final submission
const handlePreview = async () => {
  const response = await fetch('/api/invoices/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  });
  const result = await response.json();
  
  if (!result.valid) {
    // Show validation errors
    alert(result.validationResults.map(r => r.error).join('\n'));
  } else {
    // Show preview modal
    setPreview(result.preview);
  }
};

// 4. Finalize invoice
const handleFinalize = async () => {
  const response = await fetch('/api/invoices/finalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName,
      customerPhone,
      paymentMethod,
      items: cart
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Clear cart, show success
    setCart([]);
    downloadInvoicePDF(result.data);
  } else {
    // Show error
    alert(result.message);
  }
};
```

---

## 📈 Stock Consistency Guarantees

### Database Level
1. **Schema Validation**: `min: 0` on current_stock
2. **Unique Constraint**: One inventory record per medicine
3. **Transactions**: ACID properties maintained

### Application Level
1. **Atomic Operations**: Stock check + deduction in single query
2. **Validation Service**: Centralized validation logic
3. **Preview Endpoint**: Pre-flight validation before commit

### Process Level
1. **Error Handling**: Proper rollback on any failure
2. **Logging**: All stock changes logged
3. **Concurrent Safety**: Optimistic locking prevents race conditions

---

## 🚀 Testing

### Unit Tests
```bash
# Test stock validation
npm test -- stockValidationService.test.js

# Test invoice controller
npm test -- invoiceController.test.js
```

### Integration Tests
```bash
# Test full billing flow
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{"items":[{"medicineId":"...","quantity":5}],"customerName":"Test"}'
```

### Concurrent Load Test
```bash
# Simulate 100 concurrent purchases of last item
ab -n 100 -c 10 -p invoice.json \
  http://localhost:3000/api/invoices/finalize
```

---

## 📝 Summary

### ✅ Implemented Features
- [x] Inventory as single source of truth
- [x] Atomic stock deduction with transactions
- [x] Concurrent safety (optimistic locking)
- [x] Expiry date validation
- [x] Preview/validation endpoint
- [x] Available medicines endpoint
- [x] Comprehensive error handling
- [x] Stock validation service
- [x] No negative stock enforcement
- [x] Low stock alerts
- [x] Invoice generation
- [x] Automatic invoice numbering

### 🎯 Key Achievements
1. **Zero Overselling**: Atomic operations prevent race conditions
2. **Zero Negative Stock**: Schema + validation + atomic operations
3. **100% Stock Accuracy**: Every invoice = exact stock deduction
4. **Fail-Safe**: Transaction rollback on ANY error
5. **Developer-Friendly**: Centralized validation service

---

## 🔐 Security Considerations

1. **Input Validation**: All inputs validated before processing
2. **SQL Injection Protection**: MongoDB prevents injection (using ObjectIds)
3. **Rate Limiting**: Recommended for production (not implemented)
4. **Authentication**: Add JWT/session auth in production
5. **Authorization**: Role-based access control recommended

---

## 📚 Additional Resources

- MongoDB Transactions: https://docs.mongodb.com/manual/core/transactions/
- Optimistic Locking: https://en.wikipedia.org/wiki/Optimistic_concurrency_control
- ACID Properties: https://en.wikipedia.org/wiki/ACID
