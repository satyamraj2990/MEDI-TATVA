# Google Vision API Setup Guide 🔧

## Current Status
Your Prescription Scanner is configured with fallback **Demo Mode**. When the Vision API isn't properly set up, it will show sample prescription data so you can test the UI functionality.

## API Key
✅ **Already configured**: `your_vision_api_key_here`

## To Enable Full Vision API Functionality

### Step 1: Enable Cloud Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Library**
4. Search for "Cloud Vision API"
5. Click **Enable**

### Step 2: Set Up Billing (Required)
⚠️ **Important**: Vision API requires a billing account even for free tier usage.

1. Go to **Billing** in Google Cloud Console
2. Click **Link a billing account**
3. Follow the prompts to add payment information
4. Google provides $300 free credits for new users
5. Vision API offers 1,000 free requests per month

### Step 3: Verify API Key Settings
1. Go to **APIs & Services** → **Credentials**
2. Find your API key in Google Cloud Console
3. Click **Edit API key** (pencil icon)
4. Check **API restrictions**:
   - If restricted, ensure "Cloud Vision API" is in the allowed list
5. Check **Application restrictions**:
   - For development, you can leave it as "None"
   - For production, restrict to your domains

### Step 4: Test the API

#### Option A: Test in the App
1. Open http://localhost:8080/patient/modern
2. Click the **Scan Prescription** button
3. Upload an image of a prescription
4. Check for warnings:
   - ⚠️ Yellow toast = Demo Mode (API not working)
   - ✅ Green toast = Real API success!

#### Option B: Use Test Page
1. Open http://localhost:8080/test-vision-api.html
2. Upload a prescription image
3. Click "Test Vision API"
4. View detailed error messages or success response

### Step 5: Check Console Logs
Press **F12** to open Developer Tools and check the Console tab for detailed logs:

```javascript
🔍 Vision API: Analyzing image...
🔍 Vision API: API Key: AIzaSyCI...
📡 Vision API: Response status: 200
✅ Vision API: Full text extracted (123 characters)
💊 Vision API: Found 2 medications
```

## Common Errors & Solutions

### Error: "PERMISSION_DENIED"
**Solution**: Enable the Cloud Vision API (Step 1 above)

### Error: "API key not valid"
**Solutions**:
- Verify the API key is correct in `.env` file
- Check API restrictions allow Vision API
- Regenerate the API key if needed

### Error: "Billing account required"
**Solution**: Set up billing (Step 2 above)

### Error: "Daily quota exceeded"
**Solution**: 
- Check your quota usage in Google Cloud Console
- Upgrade to paid tier if needed
- Free tier: 1,000 requests/month

### Error: "Referrer not allowed"
**Solution**:
- Go to API Key settings
- Under "Application restrictions", choose "None" for development
- Or add your domain to the allowed referrers list

## Demo Mode Information

When Vision API isn't working, the scanner automatically shows:

### Demo Medications
- **Amoxicillin** - 500mg, 1 capsule 3 times daily
- **Ibuprofen** - 400mg, 1 tablet every 6 hours

### Demo Warnings
- "WARNING: Do not take on empty stomach"
- "CAUTION: May cause drowsiness"
- The actual API error message for debugging

### Benefits
✅ Test UI functionality without API setup
✅ See exact error messages for troubleshooting
✅ No breaking errors, smooth user experience

## Pricing

### Free Tier
- 1,000 requests per month
- Perfect for development and testing
- No charge if you stay under the limit

### Paid Tier
- $1.50 per 1,000 requests (after free tier)
- Minimal cost for small applications
- Detailed pricing at: https://cloud.google.com/vision/pricing

## Security Best Practices

### For Development
✅ Keep API key in `.env` file (already done)
✅ `.env` is in `.gitignore` (already done)
✅ Use "None" for application restrictions

### For Production
1. **Use API Key restrictions**:
   - Restrict to specific APIs (Cloud Vision only)
   - Restrict to specific domains/IP addresses
   
2. **Consider Backend Proxy**:
   - Move API calls to your backend server
   - Use server-to-server authentication
   - Hide API key from client-side code

3. **Monitor Usage**:
   - Set up billing alerts
   - Monitor quota usage
   - Review API access logs

## Testing Checklist

- [ ] Vision API enabled in Google Cloud Console
- [ ] Billing account linked to project
- [ ] API key has no restrictive settings (for dev)
- [ ] `.env` file contains correct API key
- [ ] Dev server restarted after `.env` changes
- [ ] Test page shows successful API response
- [ ] App shows green success toast (not yellow warning)
- [ ] Console logs show "✅ Vision API: Full text extracted"
- [ ] Real prescription data extracted (not demo data)

## Support

### Official Documentation
- [Vision API Docs](https://cloud.google.com/vision/docs)
- [Text Detection Guide](https://cloud.google.com/vision/docs/ocr)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

### Troubleshooting Resources
- Check `SCANNER_DEBUG_GUIDE.md` for detailed debugging steps
- View browser console (F12) for detailed error messages
- Test with `test-vision-api.html` for isolated testing

### Quick Links
- [Google Cloud Console](https://console.cloud.google.com/)
- [Enable Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)
- [Billing Setup](https://console.cloud.google.com/billing)
- [API Credentials](https://console.cloud.google.com/apis/credentials)

---

**Current Status**: Demo Mode Active ⚠️  
**Goal**: Enable full Vision API for real prescription scanning ✅

Once you complete Steps 1-3 above, the scanner will automatically switch from demo mode to real Vision API calls!
