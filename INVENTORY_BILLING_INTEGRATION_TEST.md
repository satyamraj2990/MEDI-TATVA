# Inventory-Billing Integration Testing Guide

## System Status ✅

### Backend (Port 3000)
- ✅ MongoDB running in Docker with replica set (rs0)
- ✅ Database seeded with 10 medicines and inventory
- ✅ Backend API server running
- ✅ All endpoints operational

### Frontend (Port 8080)
- ✅ Vite dev server running
- ✅ BillingTab integrated with backend API
- ✅ TypeScript compilation successful

## Pre-Test Setup Verification

### 1. Check MongoDB Container
```bash
docker ps | grep mongodb-meditatva
# Should show: mongodb-meditatva running on 0.0.0.0:27017
```

### 2. Verify Backend Server
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","message":"MediTatva API is running","database":"connected"}
```

### 3. Check Medicine Search
```bash
curl "http://localhost:3000/api/medicines/search?q=paracetamol"
# Expected: JSON with current_stock: 500, inStock: true
```

### 4. Check Frontend
```bash
curl -I http://localhost:8080
# Expected: HTTP/1.1 200 OK
```

## Database Initial State

### Medicines in Stock (Total: 2480 units, Value: ₹236,700)

| Medicine | Stock | Price | Requires Rx |
|----------|-------|-------|-------------|
| Paracetamol 500mg | 500 | ₹25 | No |
| Amoxicillin 250mg | 200 | ₹45 | Yes |
| Metformin 500mg | 300 | ₹12 | Yes |
| Vitamin D3 60K | 150 | ₹80 | No |
| Azithromycin 500mg | 100 | ₹120 | Yes |
| Omeprazole 20mg | 250 | ₹18 | Yes |
| Cetirizine 10mg | 400 | ₹8 | No |
| Ibuprofen 400mg | 350 | ₹15 | No |
| Atorvastatin 10mg | 180 | ₹90 | Yes |
| Insulin Glargine 100 Units | 50 | ₹1,500 | Yes |

## Test Scenarios

### Test 1: Medicine Search with Stock Display

**Steps:**
1. Open `http://localhost:8080` in browser
2. Navigate to Pharmacy Dashboard → Billing tab
3. In the search box, type "Para"
4. Observe search results

**Expected Results:**
- ✅ "Paracetamol 500mg" appears in dropdown
- ✅ Shows "In Stock: 500" in green color
- ✅ Price displays as "₹25.00"
- ✅ Add to cart button is enabled

**Validation:**
- Stock count matches database (500 units)
- Color coding: Green for stock > 10

### Test 2: Add Medicine to Cart with Stock Validation

**Steps:**
1. Search for "Paracetamol"
2. Click "Add to Cart"
3. Observe cart section
4. Click quantity increase (+) button multiple times

**Expected Results:**
- ✅ First add: Quantity = 1, cart total updates
- ✅ Success toast: "Paracetamol 500mg added to cart"
- ✅ Clicking + increases quantity
- ✅ Max quantity button disabled when quantity = 500 (stock limit)
- ✅ Toast error if trying to exceed stock: "Only 500 units available in stock"

**Validation:**
```javascript
// Cart item should show:
{
  _id: "690fcaa12d85f609552594a2",
  name: "Paracetamol 500mg",
  price: 25,
  quantity: <selected>,
  current_stock: 500
}
```

### Test 3: Out of Stock Medicine Handling

**Steps:**
1. Use MongoDB to set a medicine to 0 stock:
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.inventories.updateOne(
    { medicine: ObjectId("690fcaa12d85f609552594a7") },
    { $set: { current_stock: 0 } }
  )
'
```
2. Search for "Azithromycin" in frontend
3. Try to add to cart

**Expected Results:**
- ✅ Search shows "In Stock: 0" in red color
- ✅ Add to cart button is disabled
- ✅ If clicked, shows error toast: "Azithromycin 500mg is out of stock"

### Test 4: Low Stock Warning

**Steps:**
1. Set Vitamin D3 stock to 5:
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.inventories.updateOne(
    { medicine: ObjectId("690fcaa12d85f609552594a5") },
    { $set: { current_stock: 5 } }
  )
'
```
2. Search and add "Vitamin D3" to cart

**Expected Results:**
- ✅ Search shows "In Stock: 5" in orange color (≤ 10)
- ✅ Can add to cart
- ✅ In cart, shows "Low stock: 5" warning

### Test 5: Complete Billing Flow - Success Case

**Steps:**
1. Clear cart (remove all items)
2. Search "Paracetamol", add 10 units to cart
3. Search "Ibuprofen", add 5 units to cart
4. Click "Generate Invoice"
5. Fill patient details:
   - Name: "John Doe"
   - Contact: "9876543210"
   - Email: "john@example.com"
   - Payment: "Cash"
6. Click "Confirm & Print"

**Expected Results:**
- ✅ Invoice modal shows correct totals:
  - Paracetamol: 10 × ₹25 = ₹250
  - Ibuprofen: 5 × ₹15 = ₹75
  - Subtotal: ₹325
  - GST (18%): ₹58.50
  - **Total: ₹383.50**
- ✅ Success toast: "Invoice generated successfully"
- ✅ PDF downloads with invoice number (e.g., "INV-000001")
- ✅ Cart clears after confirmation
- ✅ Invoice appears in "Billing History" table

**Backend Validation:**
```bash
# Check invoice was created
curl http://localhost:3000/api/invoices | python3 -m json.tool

# Verify inventory decreased
curl "http://localhost:3000/api/medicines/search?q=paracetamol" | grep current_stock
# Expected: "current_stock": 490 (500 - 10)

curl "http://localhost:3000/api/medicines/search?q=ibuprofen" | grep current_stock
# Expected: "current_stock": 345 (350 - 5)
```

**Database Verification:**
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.inventories.find({}, {_id:0, current_stock:1}).pretty()
'
# Paracetamol should show 490
# Ibuprofen should show 345
```

### Test 6: Transaction Rollback - Out of Stock Error

**Steps:**
1. Search "Insulin", note current stock (50 units)
2. Add 60 units to cart (exceeds stock)
3. Click "Generate Invoice"
4. Fill patient details and confirm

**Expected Results:**
- ✅ Error toast: "Insufficient stock for Insulin Glargine 100 Units"
- ✅ HTTP 409 Conflict response from backend
- ✅ NO invoice created
- ✅ Inventory NOT decreased (still 50 units)
- ✅ Modal remains open, cart intact

**Backend Verification:**
```bash
# Stock should remain unchanged
curl "http://localhost:3000/api/medicines/search?q=insulin" | grep current_stock
# Expected: "current_stock": 50 (no change)

# No new invoice created
curl http://localhost:3000/api/invoices
# Check count hasn't increased
```

### Test 7: Multiple Items - Partial Stock Failure

**Purpose:** Verify atomic transaction - either all items succeed or all fail

**Steps:**
1. Clear cart
2. Add Metformin: 50 units (stock: 300 - should succeed)
3. Add Azithromycin: 150 units (stock: 100 - should fail)
4. Click "Generate Invoice" and confirm

**Expected Results:**
- ✅ Error toast: "Insufficient stock for Azithromycin 500mg"
- ✅ NO invoice created
- ✅ Metformin stock UNCHANGED at 300 (rollback)
- ✅ Azithromycin stock UNCHANGED at 100
- ✅ Database transaction rolled back completely

**Critical Validation:**
```bash
# Both should be unchanged
curl "http://localhost:3000/api/medicines/search?q=metformin" | grep current_stock
# Expected: "current_stock": 300 (no change due to rollback)

curl "http://localhost:3000/api/medicines/search?q=azithromycin" | grep current_stock
# Expected: "current_stock": 100 (no change)
```

### Test 8: Invoice History Display

**Steps:**
1. After creating 2-3 successful invoices (Test 5)
2. Scroll to "Billing History" section in BillingTab
3. Observe table

**Expected Results:**
- ✅ All invoices displayed with:
  - Invoice Number (INV-000001, INV-000002, etc.)
  - Patient Name
  - Date (formatted)
  - Total Amount (₹XXX.XX)
  - Status: "Paid" (green badge)
- ✅ Download button functional (PDF re-download)
- ✅ Sorted by creation date (newest first)

### Test 9: Real-Time Stock Updates Across Tabs

**Purpose:** Verify inventory changes reflect immediately

**Steps:**
1. Open pharmacy dashboard
2. Note Paracetamol stock in Billing tab (e.g., 490)
3. Create an invoice with 10 Paracetamol
4. Switch to Inventory tab (if exists)
5. Return to Billing tab
6. Search Paracetamol again

**Expected Results:**
- ✅ Stock updates to 480 (490 - 10)
- ✅ Search results show updated stock without page refresh

### Test 10: Concurrent Order Prevention

**Purpose:** Ensure MongoDB transactions prevent race conditions

**Steps:**
1. Set Cetirizine stock to 10
2. Open two browser tabs side by side
3. In both tabs, add 10 Cetirizine to cart
4. Click "Generate Invoice" in BOTH tabs simultaneously
5. Confirm invoices in both

**Expected Results:**
- ✅ First invoice: Success (stock → 0)
- ✅ Second invoice: Error "Insufficient stock"
- ✅ Final stock: 0 (not negative)
- ✅ Only 1 invoice created

## API Testing with cURL

### Search Medicines
```bash
curl "http://localhost:3000/api/medicines/search?q=vitamin"
```

### Create Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "medicine": "690fcaa12d85f609552594a2",
        "quantity": 10,
        "unitPrice": 25
      }
    ],
    "patientName": "Test Patient",
    "contactNumber": "1234567890",
    "email": "test@example.com",
    "paymentMethod": "cash"
  }'
```

### Get All Invoices
```bash
curl http://localhost:3000/api/invoices
```

### Check Inventory
```bash
curl http://localhost:3000/api/inventory
```

### Restock Medicine
```bash
curl -X POST http://localhost:3000/api/inventory/restock \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "690fcaa12d85f609552594a2",
    "quantity": 100,
    "supplierName": "Medical Supplies Co"
  }'
```

## Database Queries for Manual Verification

### Check All Stock Levels
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.inventories.aggregate([
    {
      $lookup: {
        from: "medicines",
        localField: "medicine",
        foreignField: "_id",
        as: "medicineDetails"
      }
    },
    {
      $project: {
        name: { $arrayElemAt: ["$medicineDetails.name", 0] },
        current_stock: 1,
        reorderLevel: 1
      }
    }
  ]).pretty()
'
```

### View All Invoices
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.invoices.find({}, {
    invoiceNumber: 1,
    patientName: 1,
    total: 1,
    createdAt: 1
  }).pretty()
'
```

### Check Transaction Logs
```bash
docker exec mongodb-meditatva mongosh meditatva --eval '
  db.system.transactions.find().limit(5).pretty()
'
```

## Reset Database for Fresh Testing

```bash
cd /workspaces/meditatva-connect-ai/meditatva-backend
npm run seed
```

This will:
- Drop all existing medicines, inventory, and invoices
- Recreate 10 medicines with fresh stock levels
- Reset to initial state

## Troubleshooting

### Frontend not connecting to backend
- Check CORS: Backend must allow `http://localhost:8080`
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for network errors

### MongoDB transaction errors
```bash
# Ensure replica set is initialized
docker exec mongodb-meditatva mongosh --eval "rs.status()"
```

### Stock not updating
- Check server logs: `tail -f /tmp/backend.log`
- Verify transaction succeeded: Look for "Invoice finalized successfully" in logs
- Query database directly (see queries above)

### Invoice PDF not generating
- Check browser console for jsPDF errors
- Verify invoice data structure
- Test download handler

## Success Criteria Checklist

- [ ] Search returns medicines with stock levels
- [ ] Stock color-coded (green >10, orange ≤10, red =0)
- [ ] Cart validates against current_stock
- [ ] Invoice creation decrements inventory atomically
- [ ] Out-of-stock errors prevent invoice creation
- [ ] Transaction rollback on partial failures
- [ ] Invoice history displays created invoices
- [ ] PDF generation works
- [ ] No negative stock values possible
- [ ] Concurrent orders handled safely

## Performance Benchmarks

### Expected Response Times
- Medicine search: < 200ms
- Add to cart: < 50ms (client-side)
- Create invoice: < 500ms (includes transaction)
- PDF generation: < 1s

### Database Constraints
- Stock cannot go negative (enforced by schema min: 0)
- Unique invoice numbers (auto-generated)
- Transactions ensure ACID properties

## Next Steps After Testing

1. **Add Stock Alerts**: Notify when stock falls below reorderLevel
2. **Inventory Tab Integration**: Display real-time stock with restock button
3. **Invoice Export**: Bulk export invoices to CSV/Excel
4. **Analytics Dashboard**: Sales by medicine, stock turnover rate
5. **Audit Trail**: Log all stock changes with timestamps and user info
6. **Barcode Scanner**: Quick medicine lookup via barcode
7. **Prescription Verification**: Link to uploaded prescription PDFs
8. **Payment Integration**: Stripe/Razorpay for online payments

---

**Last Updated:** 2025-11-08  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
