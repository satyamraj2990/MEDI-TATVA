# Google Maps API Setup Guide

## Current API Key
```
YOUR_GOOGLE_MAPS_API_KEY_HERE
```

> ⚠️ **Security Warning**: Never commit actual API keys to version control. Store them in `.env` files which are gitignored.

## Required APIs to Enable

To fix the "This page didn't load Google Maps correctly" error, you need to enable these APIs in your Google Cloud Console:

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Enable the following APIs:

1. **Maps JavaScript API** ⭐ (Required)
   - Used for displaying interactive maps
   - https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

2. **Geocoding API** ⭐ (Required)
   - Used for converting addresses to coordinates
   - https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

3. **Places API** ⭐ (Required)
   - Used for finding nearby pharmacies
   - https://console.cloud.google.com/apis/library/places-backend.googleapis.com

4. **Geolocation API** (Optional but recommended)
   - Used for accurate location detection
   - https://console.cloud.google.com/apis/library/geolocation.googleapis.com

### 3. Enable Billing

⚠️ **Important**: Google Maps requires billing to be enabled, even for free tier usage.

- Go to: https://console.cloud.google.com/billing
- Set up a billing account
- You get $200 free credit per month

### 4. Remove API Restrictions (for development)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "None" for development
   - Or add your domain/localhost for production

### 5. Check API Key Restrictions

Make sure your API key allows:
- HTTP referrers (web sites)
- Or has no referrer restrictions for testing

## Testing the Setup

Once configured, open the browser console and you should see:
```
✅ Google Maps already loaded
🗺️ Initializing map...
✅ Map initialized successfully with X stores
```

If you still see errors, check:
1. ✅ Billing is enabled
2. ✅ All 3 APIs are enabled (Maps JavaScript, Geocoding, Places)
3. ✅ API key has no referrer restrictions blocking your domain
4. ✅ Wait 2-5 minutes after enabling APIs (propagation delay)

## Free Tier Limits

- Maps JavaScript API: 28,000 loads/month free
- Geocoding API: $200 credit/month = ~40,000 requests
- Places API: $200 credit/month = ~10,000 requests

## Current Implementation

The API key is configured in:
- `/meditatva-frontend/.env` - `VITE_GOOGLE_MAPS_API_KEY`
- `/meditatva-frontend/src/pages/NearbyMedicalStoresPage.tsx`
- `/meditatva-frontend/src/hooks/useGeolocation.tsx`
- `/meditatva-frontend/src/components/NearbyPharmacies.tsx`
- `/meditatva-frontend/src/components/GoogleMapComponent.tsx`
