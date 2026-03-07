# 🔧 Fix "No Medicines Found" on Vercel

## Problem
Your Vercel deployment shows "No medicines found" because:
- ❌ Vercel only hosts the **frontend** (static files)
- ❌ The **backend API** is NOT deployed
- ❌ All API calls fail because there's no server to handle them

In Codespace it works because both frontend and backend run together.

## Solution: Deploy Backend + Configure Frontend

### Step 1: Deploy Backend to Render.com (FREE)

#### 1.1 Sign Up & Connect Repository
1. Go to **https://render.com** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub: **satyamraj2990/MediTatva**

#### 1.2 Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `meditatva-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `meditatva-backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

#### 1.3 Setup MongoDB Atlas (FREE Database)

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Sign up and create a **FREE M0 Cluster**
3. Create a database user (username & password)
4. **Allow access from anywhere**: IP `0.0.0.0/0`
5. Get connection string, looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meditatva
   ```

#### 1.4 Set Environment Variables in Render

In Render dashboard, add these environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meditatva
PORT=3000
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-random-secret-key-here
```

#### 1.5 Deploy Backend
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Copy your backend URL: `https://meditatva-backend.onrender.com`

#### 1.6 Seed Database (Important!)
After deployment, run this command in Render Shell or locally:
```bash
# In Render dashboard → Shell tab
node seed.js
```

Or from your Codespace:
```bash
MONGODB_URI="your-mongodb-atlas-uri" node meditatva-backend/seed.js
```

---

### Step 2: Configure Vercel Frontend

#### 2.1 Add Environment Variable in Vercel

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   Name: VITE_API_URL
   Value: https://meditatva-backend.onrender.com/api
   ```
5. Click **"Save"**

#### 2.2 Redeploy Frontend

Option A - Automatic:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

Option B - Manual:
1. Go to Vercel Dashboard → Deployments
2. Click **"Redeploy"** on latest deployment

---

### Step 3: Update CORS in Backend

Make sure your backend allows requests from Vercel:

File: `/workspaces/MediTatva/meditatva-backend/src/app.js`

The CORS configuration should include your Vercel URL:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'https://your-app.vercel.app',  // Add your actual Vercel URL
    'https://*.vercel.app'           // Allow all Vercel preview deployments
  ],
  credentials: true
};
```

After updating, push changes:
```bash
git add .
git commit -m "Update CORS for Vercel"
git push
```

---

## Verification

### Test Backend
```bash
curl https://meditatva-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MediTatva API is running",
  "database": "connected",
  "ready": true
}
```

### Test Medicines API
```bash
curl "https://meditatva-backend.onrender.com/api/medicines/search?q=paracetamol"
```

### Test Frontend
1. Open: `https://your-app.vercel.app`
2. Navigate to **Pharmacy** → **Billing**
3. Search for a medicine
4. Should now show results! ✅

---

## Quick Commands

### From Codespace - Push Changes
```bash
cd /workspaces/MediTatva
git add .
git commit -m "Configure backend URL for production"
git push origin main
```

### Check Render Logs
Go to Render Dashboard → Your Service → Logs

### Check Vercel Logs
Go to Vercel Dashboard → Your Project → Deployments → View Function Logs

---

## Troubleshooting

### Issue: "No medicines found" still showing

**Check 1:** Verify environment variable
```bash
# In browser console on Vercel site:
console.log(import.meta.env.VITE_API_URL)
```

**Check 2:** Check Network tab
- Open DevTools → Network
- Try searching medicine
- See if API call goes to correct backend URL

**Check 3:** Verify backend is running
```bash
curl https://meditatva-backend.onrender.com/health
```

### Issue: CORS errors in browser

Update backend CORS settings to include your Vercel URL.

### Issue: Backend database empty

Re-run seed script:
```bash
node seed.js
```

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel Frontend | FREE (Hobby plan) |
| Render Backend | FREE (spins down after 15 min inactivity) |
| MongoDB Atlas | FREE (512MB storage) |
| **Total** | **$0/month** |

**Note:** Render free tier has cold starts (first request after inactivity takes 30-60 seconds).

---

## Alternative: Keep Backend Alive

To avoid cold starts, consider:

1. **Upgrade Render** ($7/month for always-on)
2. **Use cron-job.org** (free) to ping your backend every 10 minutes
3. **Deploy to Railway.app** (also has free tier)

---

## Need Help?

If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors  
3. Check browser console for API errors
4. Verify environment variables are set correctly
