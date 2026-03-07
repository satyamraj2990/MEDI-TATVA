# Medicine Cabinet Refill Notification Feature

## 📋 Overview

A comprehensive refill notification system that alerts pharmacy staff when medicines are running low and need to be reordered. This feature integrates seamlessly into the medicine search and billing workflow.

## ✨ Features

### 1. **Real-Time Refill Alerts** 
- 🔔 Animated notification banner showing medicines that need attention
- 📊 Categorizes alerts:
  - **Out of Stock** (0 units) - Red badges
  - **Low Stock** (below reorder level) - Amber badges
- 🔄 Auto-refreshes when inventory changes via SSE
- ✅ Expandable details with full medicine list

### 2. **Visual Indicators on Medicine Cards**
- 💊 "Needs Refill" badge on low-stock medicines
- ⚠️ Animated pulsing badge for attention
- 📍 Appears in medicine search results

### 3. **Backend API Support**
- Endpoint: `GET /api/inventory/alerts/low-stock`
- Returns medicines where `current_stock <= reorderLevel`
- Includes full medicine details

## 🏗️ Architecture

### Backend Components

#### 1. **Low Stock Endpoint** (`inventoryController.js`)
```javascript
exports.getLowStockAlerts = async (req, res) => {
  // Fetches all inventory items
  // Filters where current_stock <= reorderLevel
  // Returns categorized list
}
```

**Route:** `/api/inventory/alerts/low-stock`

**Response Format:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "inventory_id",
      "medicine": {
        "_id": "medicine_id",
        "name": "Paracetamol 500mg",
        "genericName": "Acetaminophen",
        "category": "Pain Relief"
      },
      "current_stock": 8,
      "reorderLevel": 10
    }
  ]
}
```

#### 2. **Reorder Level Logic** (`Inventory.js Model`)
```javascript
{
  current_stock: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, default: 10 }
}

// Virtual field
InventorySchema.virtual('needsReorder').get(function() {
  return this.current_stock <= this.reorderLevel;
});
```

### Frontend Components

#### 1. **RefillNotification Component** 
**Location:** `/components/RefillNotification.tsx`

**Features:**
- Animated bell icon with pulsing effect
- Collapsible details panel
- Categorized medicine lists (Out of Stock vs Low Stock)
- Refresh button
- Dismissible

**Props:**
```typescript
interface RefillNotificationProps {
  lowStockMedicines: LowStockMedicine[];
  onRefreshAlerts?: () => void;
}
```

#### 2. **BillingTab Integration**
**Location:** `/pages/pharmacy-tabs/BillingTab.tsx`

**Changes Made:**
1. Added state: `lowStockMedicines`
2. Added function: `fetchLowStockAlerts()`
3. Integrated component in UI  
4. Added "Needs Refill" badge to medicine cards
5. Auto-refresh on real-time updates

#### 3. **API Client Extension**
**Location:** `/lib/apiClient.ts`

**New Functions:**
```typescript
inventory: {
  async getLowStockAlerts() { ... },
  async restock(id, data) { ... },
  async adjust(id, data) { ... }
}
```

## 🎨 UI/UX Design

### Notification Banner
- **Color Scheme:** Amber/Orange gradient background
- **Icons:** 
  - 🔔 Bell (animated)
  - ⚠️ Alert triangle
  - 📦 Package
- **Layout:** 
  - Header with count and badges
  - Expandable details panel
  - Scrollable list (max 260px height)

### Medicine Card Badges
- **"Needs Refill"** - Amber badge with alert icon
- **Animated pulsing effect** for visibility
- **Positioned next to medicine name**

## 📊 Data Flow

```
1. Component Mount
   ↓
2. fetchLowStockAlerts()
   ↓
3. API Call: /api/inventory/alerts/low-stock
   ↓
4. Backend filters inventory (stock <= reorder level)
   ↓
5. Return low stock medicines
   ↓
6. Update state: setLowStockMedicines()
   ↓
7. RefillNotification renders with data
   ↓
8. Medicine cards check lowStockMedicines array
   ↓
9. Display "Needs Refill" badge if matched
```

### Real-Time Updates

```
SSE Event (inventory change)
   ↓
useRealtimeInventory hook
   ↓
onUpdate callback
   ↓
fetchAvailableMedicines() + fetchLowStockAlerts()
   ↓
UI auto-refreshes
```

## 🧪 Testing

### Test Script
**Location:** `/tmp/set-low-stock.js`

Sets medicines to low stock for testing:
```javascript
const medicines = [
  { name: "Paracetamol 500mg", newStock: 8 },
  { name: "Amoxicillin 250mg", newStock: 5 },
  { name: "Ibuprofen 400mg", newStock: 0 }
];
```

**Run:** `node /tmp/set-low-stock.js`

### Manual Testing Steps

1. **Set Low Stock:**
   ```bash
   node /tmp/set-low-stock.js
   ```

2. **Verify Endpoint:**
   ```bash
   curl http://localhost:5000/api/inventory/alerts/low-stock | jq
   ```

3. **Open Billing Tab:**
   - Navigate to Pharmacy Portal → Billing
   - Check for refill notification banner
   - Expand details to see categorized medicines

4. **Check Badge Indicators:**
   - Search for "Paracetamol" 
   - Verify "Needs Refill" badge appears
   - Badge should pulse/animate

5. **Test Real-Time Updates:**
   - Adjust stock via Inventory tab
   - Watch notification auto-refresh
   - Badges update automatically

## 🔧 Configuration

### Reorder Levels
Set in seed data or when creating inventory:
```javascript
{
  medicineId: "...",
  initialStock: 100,
  reorderLevel: 20  // Alert when stock ≤ 20
}
```

### Notification Thresholds
**Critical (Red):** `stock === 0`
**Low (Amber):** `0 < stock <= reorderLevel`
**Normal (Green):** `stock > reorderLevel`

## 📁 Files Modified/Created

### Created:
- ✅ `/meditatva-frontend/src/components/RefillNotification.tsx` - Notification component
- ✅ `/tmp/set-low-stock.js` - Test script

### Modified:
- ✅ `/meditatva-backend/src/controllers/inventoryController.js` - Already had endpoint
- ✅ `/meditatva-backend/src/routes/inventory.js` - Route already existed
- ✅ `/meditatva-frontend/src/lib/apiClient.ts` - Added API functions
- ✅ `/meditatva-frontend/src/pages/pharmacy-tabs/BillingTab.tsx` - Integrated notifications

## 🎯 Usage Examples

### For Pharmacists

**Scenario 1: Daily Stock Check**
1. Open Billing Tab
2. Check notification banner at top
3. Click "View Details" to see full list
4. Note medicines needing reorder

**Scenario 2: While Billing**
1. Search for medicine
2. See "Needs Refill" badge
3. Add to cart (if available)
4. Make note to restock soon

**Scenario 3: Restocking**
1. Check notification for list
2. Go to Inventory Tab
3. Click "Restock" on low items
4. Notification auto-updates

## 🚀 Next Steps / Enhancements

### Immediate:
- ✅ Notification system - DONE
- ✅ Visual badges - DONE
- ✅ Real-time updates - DONE

### Future Enhancements:
1. **Email Alerts** - Send daily summary of low stock
2. **Auto-Reorder** - Generate purchase orders automatically
3. **Supplier Integration** - Direct reorder from suppliers
4. **Stock Predictions** - AI-based reorder suggestions
5. **Expiry Alerts** - Combined with refill alerts
6. **Priority Levels** - Categorize by criticality (emergency medicines first)
7. **Notification Center** - Dedicated alerts page
8. **Sound Alerts** - Audio notification for critical stock-outs

## 📈 Benefits

1. **Proactive Management** - Never run out of critical medicines
2. **Time Savings** - No manual stock checking needed
3. **Better Patient Care** - Medicines always available
4. **Cost Optimization** - Timely reorders prevent emergency orders
5. **Real-Time Awareness** - Instant visibility of stock status

## 🔐 Security Considerations

- No authentication required (internal pharmacy tool)
- Future: Add role-based access (only pharmacy staff see alerts)
- Future: Audit log for stock adjustments

## 📊 Metrics Tracked

- Total medicines needing refill
- Out of stock count
- Low stock count
- Real-time update responsiveness

## Status: ✅ FULLY IMPLEMENTED

The medicine cabinet refill notification feature is now live and operational!

**Last Updated:** February 19, 2026
