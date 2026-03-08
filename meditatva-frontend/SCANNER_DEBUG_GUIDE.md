# Testing the Prescription Scanner - Debug Guide

## 🔍 How to Test & Debug

### Step 1: Open the App
Navigate to: **http://localhost:8080/patient/modern**

### Step 2: Open Browser Console
Press **F12** (or right-click → Inspect) to open Developer Tools
Go to the **Console** tab - this will show all debug messages

### Step 3: Click the Scan Button
Click the **"Scan"** button (camera icon) in the dashboard header

### Step 4: Choose Upload Method
1. Click **"Upload Image"**
2. Select any image file (prescription, text document, or even a test image with text)

### Step 5: Watch Console Logs
You should see these messages in the console:

```
🔍 Starting Vision API analysis...
API Key exists: true
API Key value: AIzaSyCI...
Image size (base64): XXXXX characters
📡 API Response status: 200 OK
✅ API Response received: {responses: [...]}
📝 Extracted text: [your image text]
💊 Analysis complete: {medications: X, dosages: X, warnings: X}
```

## 🐛 Troubleshooting

### If you see "Analysis failed":

1. **Check Console for Error Messages**
   - Look for `❌` emoji in console
   - Read the error message

2. **Common Errors:**

   **"API Key exists: false"**
   - Solution: Restart the dev server with `npm run dev`
   - .env file wasn't loaded

   **"API Response status: 400 Bad Request"**
   - API key might be invalid or expired
   - Check Google Cloud Console

   **"API Response status: 403 Forbidden"**
   - API might not be enabled
   - Enable Vision API in Google Cloud Console

   **"API Response status: 429 Too Many Requests"**
   - Rate limit exceeded
   - Wait a minute and try again

   **"No text detected in image"**
   - Image quality too low
   - Try a clearer image with visible text

3. **Check API Key**
   ```bash
   cat /workspaces/meditatva-connect-ai/meditatva-frontend/.env
   ```
   Should show: `VITE_GOOGLE_VISION_API_KEY=YOUR_ACTUAL_API_KEY`

4. **Verify Vision API is Enabled**
   - Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com
   - Make sure it's enabled for your project

## 📸 Test Images

### Good Test Image Options:

1. **Typed Prescription**
   ```
   Dr. John Smith, MD
   Prescription

   Patient: Jane Doe
   Date: Nov 12, 2025

   Rx:
   Amoxicillin 500mg
   Take 1 capsule 3 times daily
   Duration: 7 days

   WARNING: Do not take on empty stomach
   ```
   
2. **Screenshot of text** - Any screenshot with clear text
3. **Photo of a book page** - Clear, well-lit text
4. **Printed document** - Invoice, receipt, label

### What Makes a Good Test Image:
- ✅ Clear, high-contrast text
- ✅ Good lighting (no shadows)
- ✅ Text is horizontal (not rotated)
- ✅ Focus is sharp (not blurry)
- ✅ File size < 10MB

## 🔧 Quick Fixes

### Force Reload .env Variables:
```bash
# Stop server
pkill -f vite

# Start server (loads .env)
cd /workspaces/meditatva-connect-ai/meditatva-frontend
npm run dev
```

### Test API Key Manually:
```bash
curl -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {"content": "BASE64_STRING_HERE"},
      "features": [{"type": "TEXT_DETECTION"}]
    }]
  }'
```

## ✅ Success Indicators

When working correctly, you should see:

1. **Console logs**: All green ✅ checkmarks
2. **UI**: 
   - Success animation (green checkmark)
   - Confidence score displayed
   - Medications shown in blue badges
   - Dosages in purple cards
   - Warnings in orange cards
   - Full text in gray card

3. **No errors** in console

## 📊 Expected API Response Structure

```json
{
  "responses": [{
    "textAnnotations": [
      {
        "description": "Full text here",
        "boundingPoly": {...}
      }
    ],
    "fullTextAnnotation": {
      "text": "Full text here",
      "pages": [{
        "confidence": 0.95
      }]
    }
  }]
}
```

## 🎯 What to Test

- [ ] Upload image feature works
- [ ] Camera feature works (if camera available)
- [ ] Text is extracted from image
- [ ] Medications are detected
- [ ] Dosages are extracted
- [ ] Warnings are shown
- [ ] Confidence score is displayed
- [ ] "Scan Another" button resets scanner
- [ ] "Done" button closes modal

## 📝 Report Issues

If still not working after following this guide:

1. Copy ALL console logs
2. Note the exact error message
3. Check if API key shows in console as `undefined` or the actual key
4. Verify .env file exists and has correct format
5. Restart dev server to load .env changes

---

**Current Status**: Fixed syntax errors, added comprehensive logging, .env configured
**API Key**: Configured via environment variable (refer to .env.example)
