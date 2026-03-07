# 🚀 Backend Deployment Guide for MediTatva

## Problem: 405 Error on Public Site

**Root Cause**: Your Vercel deployment only hosts the frontend. The backend API is NOT deployed, causing all API requests to fail with 405 errors.

## Solution Options

### Option 1: Deploy Backend to Render.com (FREE & RECOMMENDED) ⭐

Render.com offers free hosting for Node.js apps and MongoDB.

#### Steps:

1. **Sign up at https://render.com**

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `satyamraj2990/MediTatva`
   - Configure:
     - **Name**: `meditatva-backend`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Root Directory**: `meditatva-backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`

3. **Set Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-connection-string>
   PORT=3000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

4. **Get MongoDB Connection String**:
   - Option A: Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas
   - Option B: Use Render's built-in MongoDB (paid)
   
   For MongoDB Atlas:
   - Create free cluster
   - Get connection string like: `mongodb+srv://username:password@cluster.mongodb.net/meditatva`

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Get your backend URL: `https://meditatva-backend.onrender.com`

6. **Update Frontend Environment Variable**
   - Go to your Vercel project settings
   - Add environment variable:
     ```
     VITE_API_URL=https://meditatva-backend.onrender.com/api
     ```
   - Redeploy frontend

---

### Option 2: Deploy Backend to Railway.app (FREE with Credit)

Railway offers $5 free credit monthly.

1. **Sign up at https://railway.app**
2. **New Project** → **Deploy from GitHub repo**
3. **Select** `satyamraj2990/MediTatva`
4. **Configure**:
   - Root directory: `meditatva-backend`
   - Start command: `npm start`
5. **Add MongoDB**:
   - Click "+ New" → "Database" → "Add MongoDB"
   - Copy connection string to environment variables
6. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=${{MongoDB.DATABASE_URL}}
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. **Deploy** and get URL like: `https://meditatva-backend.up.railway.app`

---

### Option 3: Vercel Serverless Functions (Complex but Integrated)

Convert your Express backend to Vercel serverless functions.

**Note**: This requires significant refactoring and has limitations with MongoDB connections.

---

## Quick Setup Script (Option 1 - Render)

Once you have your Render backend URL, run this:

```bash
# Update frontend .env for local development
cd /workspaces/MediTatva/meditatva-frontend
echo "VITE_API_URL=https://meditatva-backend.onrender.com/api" >> .env

# Commit and push
cd /workspaces/MediTatva
git add .
git commit -m "Add backend API URL for production"
git push
```

Then in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://meditatva-backend.onrender.com/api`
3. Redeploy

---

## Files Needed for Render Deployment

### Create `meditatva-backend/.env.example`

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditatva
FRONTEND_URL=https://your-app.vercel.app
```

### Update `meditatva-backend/src/app.js` CORS

The current CORS configuration needs to allow your Vercel frontend URL.

---

## Testing Deployment

1. **Test Backend Health**:
   ```bash
   curl https://meditatva-backend.onrender.com/health
   ```

2. **Test API Endpoint**:
   ```bash
   curl https://meditatva-backend.onrender.com/api/medicines
   ```

3. **Test from Frontend**:
   - Open browser console on your Vercel site
   - Check API calls in Network tab
   - Should see successful 200 responses

---

## Important Notes

⚠️ **Free Tier Limitations**:
- Render free tier spins down after 15 mins of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier ($7/month) for production use

🔒 **Security**:
- Never commit `.env` files
- Use environment variables for all secrets
- Add your Vercel URL to CORS whitelist

📊 **Database**:
- MongoDB Atlas free tier: 512MB storage
- Sufficient for development and small production use
- Backup your data regularly

---

## Need Help?

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Railway Docs: https://docs.railway.app

