# 🚀 Quick Start Guide - Inventory-Billing Integration

## System URLs

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Pharmacy Dashboard:** http://localhost:8080 (Navigate to Pharmacy → Billing)

## Current Status ✅

| Component | Status | Port | Details |
|-----------|--------|------|---------|
| Frontend | 🟢 Running | 8080 | React + Vite Dev Server |
| Backend | 🟢 Running | 3000 | Express + Node.js (PID: 107256) |
| MongoDB | 🟢 Running | 27017 | Docker (mongodb-meditatva) |
| Database | 🟢 Seeded | - | 10 medicines, 2,480 units |

## Quick Test Commands

### Check Backend Health
```bash
curl http://localhost:3000/health
```

### Search Medicine
```bash
curl "http://localhost:3000/api/medicines/search?q=paracetamol"
```

### View All Inventory
```bash
curl http://localhost:3000/api/inventory | python3 -m json.tool
```

### Create Test Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"medicine": "690fcaa12d85f609552594a2", "quantity": 5, "unitPrice": 25}
    ],
    "patientName": "Test User",
    "contactNumber": "1234567890",
    "email": "test@test.com",
    "paymentMethod": "cash"
  }'
```

### Check Stock After Invoice
```bash
curl "http://localhost:3000/api/medicines/search?q=paracetamol" | grep current_stock
```

## Browser Testing Flow

1. **Open Application**
   ```
   http://localhost:8080
   ```

2. **Navigate**
   - Click on "Pharmacy Dashboard" (if not already there)
   - Click "Billing" tab

3. **Search Medicine**
   - Type in search box: "Para"
   - See: "Paracetamol 500mg - In Stock: 500" (green)

4. **Add to Cart**
   - Click "Add to Cart"
   - See success message
   - Cart updates with item

5. **Generate Invoice**
   - Click "Generate Invoice" button
   - Fill in:
     - Patient Name: "John Doe"
     - Contact: "9876543210"
     - Email: "john@test.com"
     - Payment: Cash
   - Click "Confirm & Print"
   - PDF downloads
   - Cart clears

6. **Verify Stock Decreased**
   - Search "Para" again
   - Stock should be less (e.g., 495 if you ordered 5)

## Available Medicines (Seeded Data)

| ID (Last 4) | Medicine | Stock | Price | Prescription? |
|-------------|----------|-------|-------|---------------|
| 94a2 | Paracetamol 500mg | 500 | ₹25 | No |
| 94a3 | Amoxicillin 250mg | 200 | ₹45 | Yes |
| 94a4 | Metformin 500mg | 300 | ₹12 | Yes |
| 94a5 | Vitamin D3 60K | 150 | ₹80 | No |
| 94a6 | Azithromycin 500mg | 100 | ₹120 | Yes |
| 94a7 | Omeprazole 20mg | 250 | ₹18 | Yes |
| 94a8 | Cetirizine 10mg | 400 | ₹8 | No |
| 94a9 | Ibuprofen 400mg | 350 | ₹15 | No |
| 94aa | Atorvastatin 10mg | 180 | ₹90 | Yes |
| 94ab | Insulin Glargine | 50 | ₹1,500 | Yes |

## Common Issues & Fixes

### Backend Not Responding
```bash
# Check if running
ps aux | grep "node.*app.js"

# Restart if needed
cd /workspaces/meditatva-connect-ai/meditatva-backend
npm start &
```

### MongoDB Not Connected
```bash
# Check container
docker ps | grep mongodb

# Restart if needed
docker start mongodb-meditatva
```

### Frontend Not Loading
```bash
# Check if Vite dev server running
lsof -i :8080

# Restart if needed
cd /workspaces/meditatva-connect-ai/meditatva-frontend
npm run dev
```

### Reset Database
```bash
cd /workspaces/meditatva-connect-ai/meditatva-backend
npm run seed
```

## Stopping All Services

```bash
# Stop backend
pkill -f "node.*app.js"

# Stop MongoDB
docker stop mongodb-meditatva

# Stop frontend (Ctrl+C in terminal where it's running)
```

## Starting All Services

```bash
# 1. Start MongoDB
docker start mongodb-meditatva

# 2. Start Backend
cd /workspaces/meditatva-connect-ai/meditatva-backend
nohup npm start > /tmp/backend.log 2>&1 &

# 3. Start Frontend (in separate terminal)
cd /workspaces/meditatva-connect-ai/meditatva-frontend
npm run dev
```

## Key Features to Test

- ✅ Medicine search with stock levels
- ✅ Stock color indicators (green/orange/red)
- ✅ Add to cart with stock validation
- ✅ Invoice generation
- ✅ PDF download
- ✅ Stock decrease after billing
- ✅ Out-of-stock error handling
- ✅ Invoice history display
- ✅ Low stock warnings

## API Endpoints Reference

### Medicines
- `GET /api/medicines/search?q=<term>` - Search medicines
- `GET /api/medicines` - List all
- `GET /api/medicines/:id` - Get one
- `POST /api/medicines` - Create
- `PUT /api/medicines/:id` - Update
- `DELETE /api/medicines/:id` - Delete

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get one invoice
- `POST /api/invoices/finalize` - Create invoice + update stock

### Inventory
- `GET /api/inventory` - List all stock
- `POST /api/inventory/restock` - Add stock
- `POST /api/inventory/adjust` - Adjust stock
- `GET /api/inventory/low-stock` - Low stock alerts

## Documentation Files

- `INVENTORY_BILLING_INTEGRATION_TEST.md` - Full testing guide with 10 test scenarios
- `INVENTORY_BILLING_INTEGRATION_SUMMARY.md` - Complete implementation summary
- `QUICK_START.md` - This file

## Need Help?

1. Check server logs: `tail -f /tmp/backend.log`
2. Check MongoDB: `docker logs mongodb-meditatva`
3. Check browser console (F12)
4. Verify all services running (see Status Check above)

---

**Last Updated:** 2025-11-08  
**Status:** 🟢 All systems operational  
**Ready for Testing:** ✅ YES
