# 📋 API Quick Reference

## Base URL
```
http://localhost:3000/api
```

---

## 🏥 Billing APIs

### 1. Get Available Medicines for Billing
**Only returns in-stock, non-expired, active medicines**

```http
GET /invoices/available-medicines?search=<searchTerm>
```

**Example:**
```bash
curl "http://localhost:3000/api/invoices/available-medicines?search=para"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "medicineId": "690fcaa12d85f609552594a2",
      "name": "Paracetamol 500mg",
      "price": 25,
      "availableStock": 500,
      "requiresPrescription": false
    }
  ]
}
```

---

### 2. Preview Invoice (Validate Before Creating)
**Validates stock without creating invoice**

```http
POST /invoices/preview
Content-Type: application/json

{
  "items": [
    {
      "medicineId": "690fcaa12d85f609552594a2",
      "quantity": 5
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/invoices/preview \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"medicineId": "690fcaa12d85f609552594a2", "quantity": 5}
    ]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "valid": true,
  "validationResults": [
    {
      "medicineId": "690fcaa12d85f609552594a2",
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
    "subtotal": 125,
    "tax": 0,
    "total": 125
  }
}
```

**Error Response (Out of Stock):**
```json
{
  "success": false,
  "valid": false,
  "validationResults": [
    {
      "valid": false,
      "error": "Insufficient stock",
      "requestedQuantity": 600,
      "availableStock": 500
    }
  ]
}
```

---

### 3. Finalize Invoice (Create & Deduct Stock)
**Atomically creates invoice and deducts stock**

```http
POST /invoices/finalize
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "paymentMethod": "cash",
  "items": [
    {
      "medicineId": "690fcaa12d85f609552594a2",
      "quantity": 5,
      "unitPrice": 25
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "paymentMethod": "cash",
    "items": [
      {
        "medicineId": "690fcaa12d85f609552594a2",
        "quantity": 5,
        "unitPrice": 25
      }
    ]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Invoice created and inventory updated successfully",
  "data": {
    "_id": "...",
    "invoiceNumber": "INV-2024-00001",
    "customerName": "John Doe",
    "items": [...],
    "total": 125,
    "paymentStatus": "paid"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Out of stock",
  "message": "Insufficient stock for Paracetamol 500mg. Available: 3, Requested: 5"
}
```

---

### 4. Get All Invoices
```http
GET /invoices?page=1&limit=20
```

**Example:**
```bash
curl "http://localhost:3000/api/invoices?page=1&limit=20"
```

---

### 5. Get Single Invoice
```http
GET /invoices/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/invoices/507f1f77bcf86cd799439011"
```

---

### 6. Get Invoice Statistics
```http
GET /invoices/stats?startDate=2024-01-01&endDate=2024-12-31
```

**Example:**
```bash
curl "http://localhost:3000/api/invoices/stats?startDate=2024-01-01"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalRevenue": 125000,
    "avgInvoiceValue": 833.33
  }
}
```

---

## 📦 Inventory APIs

### 1. Get All Inventory
```http
GET /inventory?page=1&limit=50&lowStock=true
```

**Example:**
```bash
# All inventory
curl "http://localhost:3000/api/inventory"

# Low stock only
curl "http://localhost:3000/api/inventory?lowStock=true"
```

---

### 2. Get Inventory by Medicine
```http
GET /inventory/medicine/:medicineId
```

**Example:**
```bash
curl "http://localhost:3000/api/inventory/medicine/690fcaa12d85f609552594a2"
```

---

### 3. Restock Inventory
```http
PUT /inventory/:inventoryId/restock
Content-Type: application/json

{
  "quantity": 100,
  "notes": "New shipment"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100, "notes": "New shipment received"}'
```

---

### 4. Adjust Inventory (Manual Correction)
```http
PUT /inventory/:inventoryId/adjust
Content-Type: application/json

{
  "newStock": 450,
  "reason": "Physical count correction"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/adjust \
  -H "Content-Type: application/json" \
  -d '{"newStock": 450, "reason": "Damaged items removed"}'
```

---

### 5. Get Low Stock Alerts
```http
GET /inventory/alerts/low-stock
```

**Example:**
```bash
curl "http://localhost:3000/api/inventory/alerts/low-stock"
```

---

## 💊 Medicine APIs

### 1. Search Medicines (with Stock Info)
```http
GET /medicines/search?q=<searchTerm>&limit=50
```

**Example:**
```bash
curl "http://localhost:3000/api/medicines/search?q=paracetamol"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "690fcaa12d85f609552594a2",
      "name": "Paracetamol 500mg",
      "genericName": "Paracetamol",
      "price": 25,
      "current_stock": 500,
      "inStock": true,
      "requiresPrescription": false
    }
  ]
}
```

---

### 2. Get Single Medicine
```http
GET /medicines/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/medicines/690fcaa12d85f609552594a2"
```

---

### 3. Create Medicine
```http
POST /medicines
Content-Type: application/json

{
  "name": "Paracetamol 500mg",
  "genericName": "Paracetamol",
  "brand": "Crocin",
  "dosage": "500mg",
  "form": "tablet",
  "price": 25,
  "requiresPrescription": false,
  "initialStock": 100
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin 75mg",
    "price": 15,
    "form": "tablet",
    "initialStock": 200
  }'
```

---

### 4. Update Medicine
```http
PUT /medicines/:id
Content-Type: application/json

{
  "price": 30,
  "isActive": true
}
```

---

### 5. Get All Medicines
```http
GET /medicines?page=1&limit=50&category=analgesic
```

---

## 🔧 Utility APIs

### Health Check
```http
GET /health
```

**Example:**
```bash
curl "http://localhost:3000/health"
```

**Response:**
```json
{
  "status": "ok",
  "message": "MediTatva API is running",
  "database": "connected"
}
```

---

## 📊 Complete Billing Flow Example

```bash
# Step 1: Get available medicines
curl "http://localhost:3000/api/invoices/available-medicines?search=para"
# Copy medicineId from response

# Step 2: Preview invoice (validate)
curl -X POST http://localhost:3000/api/invoices/preview \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"medicineId": "690fcaa12d85f609552594a2", "quantity": 5}
    ]
  }'
# Check if valid: true

# Step 3: Finalize invoice (create & deduct stock)
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "paymentMethod": "cash",
    "items": [
      {
        "medicineId": "690fcaa12d85f609552594a2",
        "quantity": 5,
        "unitPrice": 25
      }
    ]
  }'

# Step 4: Verify stock decreased
curl "http://localhost:3000/api/medicines/search?q=para" | grep current_stock
```

---

## ⚠️ Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Stock validation failed, insufficient stock |
| 500 | Server Error | Internal error, transaction failed |

---

## 🎯 Key Features

### Atomic Operations
- ✅ Stock is checked and deducted in ONE atomic operation
- ✅ If any step fails, entire transaction rolls back
- ✅ No partial updates possible

### Validation
- ✅ Preview endpoint validates before committing
- ✅ Expired medicines are filtered out
- ✅ Out-of-stock medicines blocked
- ✅ Real-time stock checks

### Safety
- ✅ No negative stock possible
- ✅ Concurrent requests handled safely
- ✅ Database constraints enforced
- ✅ Transaction rollback on errors

---

## 🚀 Quick Start Testing

```bash
# 1. Start the server
cd /workspaces/MediTatva/meditatva-backend
npm run dev

# 2. In another terminal, test the APIs
# Get available medicines
curl http://localhost:3000/api/invoices/available-medicines | python3 -m json.tool

# Create an invoice
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerPhone": "1234567890",
    "paymentMethod": "cash",
    "items": [
      {"medicineId": "YOUR_MEDICINE_ID", "quantity": 2}
    ]
  }' | python3 -m json.tool
```
