# 🔧 AI Saarthi Setup Guide - Fix "Request failed with status code 500"

## Problem
You're seeing: **"Request failed with status code 500"** when trying to start AI Saarthi voice call.

## Root Cause
The Gemini AI API key is either missing or invalid in your environment configuration.

## ✅ Solution (3 Steps)

### Step 1: Get Your Free Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Configure the API Key

1. Open the file: `meditatva-frontend/.env`
2. Find the line: `VITE_GEMINI_API_KEY=your_placeholder_here`
3. Replace with your actual key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyD_XHd1xi20Y-IgccbT8SpdxxYfFf2CaUc
   ```
4. Save the file

### Step 3: Restart Development Server

**Stop the current server** (Ctrl+C in terminal)

Then restart:
```bash
cd meditatva-frontend
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

## ✅ Verification

After restarting, check browser console for:
```
✅ Gemini AI initialized successfully
✅ Chat session initialized successfully
✅ AI Saarthi is ready to answer medical queries
```

## 🎤 Using AI Saarthi

1. Click on **"Call Saarthi"** or **"Saarthi"** section
2. Click the **microphone button**
3. Allow microphone permissions
4. Ask medical questions in Hindi or English:
   - "मुझे सिरदर्द है" (I have a headache)
   - "I have fever"
   - "बुखार है 101 degree"

Saarthi will respond with:
- Medicine suggestions
- Dosage recommendations
- Home remedies
- When to see a doctor

## 🚨 Still Having Issues?

### Error: "API key not found"
- Make sure `.env` file exists in `meditatva-frontend/` folder
- Verify the file is named exactly `.env` (with the dot)
- Check the variable name is exactly: `VITE_GEMINI_API_KEY`

### Error: "Invalid API key"
- Your key should start with `AIza`
- Don't include quotes around the key
- No spaces before or after the key

### Error: Still 500 after adding key
- Restart the dev server completely
- Clear browser cache and reload
- Check if Gemini API is accessible in your region
- Verify your Google Cloud project has Gemini API enabled

### Browser Console Checks
Open Developer Tools (F12) → Console tab

Look for:
- ❌ Red errors = Problem exists
- ✅ Green checkmarks = Working correctly

## 📝 Current API Key

Your `.env` file currently has:
```
VITE_GEMINI_API_KEY=AIzaSyD_XHd1xi20Y-IgccbT8SpdxxYfFf2CaUc
```

If this is still a placeholder, replace it with your own key from Google.

## 🎯 Expected Behavior After Fix

1. **On opening Saarthi**: Greeting plays automatically
2. **Click microphone**: Listens to your voice
3. **After speaking**: AI processes and responds with medical advice
4. **Automatic listening**: Continues listening after response

## 💡 Pro Tips

- Use **Chrome or Edge** browser for best compatibility
- Allow microphone permissions when prompted
- Speak clearly and wait for response
- Switch language with the language toggle button
- Use the **Retry Connection** button if initialization fails

---

**Need More Help?**
- Check browser console for detailed error logs
- Verify `.env` file is in the correct directory
- Ensure you have an active internet connection
- Make sure Gemini API is not blocked by firewall
