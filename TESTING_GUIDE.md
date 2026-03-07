# 🧪 Location Fix - Testing Guide

## Quick Test Instructions

### 🌐 Application URLs
- **Frontend:** http://localhost:8080/
- **Patient Dashboard:** http://localhost:8080/patient/modern
- **Pharmacy Dashboard:** http://localhost:8080/pharmacy/dashboard

---

## ✅ Test Scenarios

### 1️⃣ Test Independent Dashboard Locations

**Steps:**
1. Open Patient Dashboard in **Tab 1**: http://localhost:8080/patient/modern
2. Open Pharmacy Dashboard in **Tab 2**: http://localhost:8080/pharmacy/dashboard
3. Allow location access when prompted
4. Observe both dashboards display location independently

**Verify:**
- ✅ Patient tab shows location with "Live" indicator
- ✅ Pharmacy tab shows location with "Live" indicator  
- ✅ Both can have different locations if using different sessions

**Check Session Storage:**
```javascript
// In Patient Dashboard tab (DevTools Console):
sessionStorage.getItem("patientLocation")

// In Pharmacy Dashboard tab (DevTools Console):
sessionStorage.getItem("pharmacyLocation")
```

Expected: Each tab has its own session key with location data.

---

### 2️⃣ Test Auto-Refresh (60 seconds)

**Steps:**
1. Open any dashboard
2. Note the current time
3. Wait 60 seconds (or check console logs)
4. Observe automatic location update

**Verify:**
- ✅ Console shows: `🔄 Refreshing location (session cache will be updated)`
- ✅ Location display briefly shows loading state
- ✅ Location updates automatically every minute

**Console Check:**
```bash
# Open DevTools → Console
# Look for logs every ~60 seconds:
# "🔄 Refreshing location (session cache will be updated)"
```

---

### 3️⃣ Test Visibility Change Refresh

**Steps:**
1. Open any dashboard
2. Switch to another browser tab/application
3. Wait a few seconds
4. Return to the dashboard tab

**Verify:**
- ✅ Location refreshes automatically upon return
- ✅ Console shows location fetch logs
- ✅ "Live" indicator animates during refresh

---

### 4️⃣ Test Manual Refresh Button

**Steps:**
1. Open any dashboard
2. Click the **Refresh button** (🔄) next to location display
3. Observe the UI feedback

**Verify:**
- ✅ Spinner appears in refresh button
- ✅ Toast notification: "Updating your location..."
- ✅ Location updates successfully
- ✅ Spinner disappears after update

---

### 5️⃣ Test Find Nearby Medical Stores

**Steps:**
1. Open Patient Dashboard
2. Click **"Find Nearby Stores"** button in navbar
3. Click **"Search Medical Stores Near Me"** button in modal

**Verify:**
- ✅ Uses session-scoped location automatically
- ✅ Shows toast: "Searching all nearby pharmacies..."
- ✅ Displays list of pharmacies sorted by distance
- ✅ Shows distance in km/meters for each pharmacy
- ✅ "View on Map" button opens Google Maps with correct coordinates

**If Location Not Available:**
- ✅ Shows error: "Please allow location access or refresh your location to search nearby stores."
- ✅ Clicking "Search" again triggers location refresh

---

### 6️⃣ Test Logout Session Cleanup

**Steps:**
1. Login to Patient Dashboard
2. Open DevTools → Application → Session Storage
3. Verify `patientLocation` exists
4. Click Logout button
5. Check Session Storage again

**Verify:**
- ✅ `patientLocation` is removed from session storage
- ✅ No location data persists after logout
- ✅ Login page loads successfully

**Repeat for Pharmacy Dashboard:**
- ✅ `pharmacyLocation` is cleared on logout

---

### 7️⃣ Test Permission Denied Handling

**Steps:**
1. Open a new Incognito/Private browser window
2. Navigate to dashboard
3. **Block** location permission when prompted
4. Observe error handling

**Verify:**
- ✅ Shows error badge with alert icon
- ✅ Message: "Location Access Denied"
- ✅ Sub-message: "Please enable location access to use nearby services"
- ✅ Refresh button still available to retry

**To Re-enable:**
- Click browser address bar lock icon → Site Settings → Location → Allow

---

### 8️⃣ Test Location Display Variants

**Patient Dashboard:**
- ✅ Shows location with cyan/blue theme
- ✅ Badge: "Live" with green pulsing dot
- ✅ Format: `City, State ZIP`

**Pharmacy Dashboard:**
- ✅ Shows location with white theme on dark background
- ✅ Badge: "Live" with green pulsing dot
- ✅ Format: `City, State ZIP`

---

## 🐛 Debugging Tips

### Check Console Logs

Open DevTools → Console and look for:

```
=== GPS Coordinates Obtained ===
Latitude: 28.xxxx, Longitude: 77.xxxx
Calling Geocoding API...
=== Location Data Received ===
Location: {...}
Location saved to sessionStorage key=patientLocation
```

### Check Session Storage

Open DevTools → Application → Session Storage → http://localhost:8080

Expected keys:
- `patientLocation` (when on Patient Dashboard)
- `pharmacyLocation` (when on Pharmacy Dashboard)

Sample data:
```json
{
  "latitude": 28.xxxx,
  "longitude": 77.xxxx,
  "city": "New Delhi",
  "state": "Delhi",
  "country": "India",
  "postalCode": "110001",
  "formattedAddress": "New Delhi, Delhi 110001",
  "lastFetchedAt": 1731094800000
}
```

### Check Network Requests

Open DevTools → Network tab and filter by:
- `nominatim.openstreetmap.org` - Geocoding API
- `maps.googleapis.com` - Google Maps API (fallback)

---

## ⚠️ Common Issues & Solutions

### Issue: Location not updating
**Solution:** 
- Click refresh button manually
- Check browser location permission
- Check console for errors

### Issue: "Geolocation is not supported"
**Solution:**
- Use HTTPS or localhost (HTTP works on localhost only)
- Try a modern browser (Chrome, Firefox, Edge, Safari)

### Issue: "Permission Denied"
**Solution:**
- Click browser address bar → Site Settings → Location → Allow
- Refresh the page

### Issue: Inaccurate location
**Solution:**
- Enable device GPS/location services
- Move to a window with better GPS signal
- Wait for location to refresh (60s)

### Issue: Cross-dashboard location mixing
**Solution:**
- Verify you applied all logout cleanup changes
- Clear all browser data and test again
- Check session storage has separate keys

---

## 📊 Success Metrics

After testing, verify:

✅ Patient and Pharmacy dashboards maintain independent locations  
✅ Location auto-refreshes every 60 seconds  
✅ Location refreshes on tab visibility change  
✅ Manual refresh works with UI feedback  
✅ "Find Nearby Stores" uses correct session location  
✅ Logout clears session location data  
✅ Error handling shows user-friendly messages  
✅ Live indicator animates (green pulsing dot)  
✅ Performance is smooth (no lag during refreshes)  
✅ Console logs are clean (no errors)  

---

## 🎉 Expected Results

All tests should pass with:
- ✅ Accurate real-time location detection
- ✅ Independent session-scoped storage per role
- ✅ Auto-refresh every 60 seconds
- ✅ Visibility change refresh
- ✅ Clean logout (no data leaks)
- ✅ Smooth UI/UX with animations
- ✅ Graceful error handling

---

**Testing Date:** November 8, 2025  
**Status:** Ready for Testing ✅  
**Test Environment:** http://localhost:8080/  
