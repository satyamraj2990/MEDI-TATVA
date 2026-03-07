# 🔥 URGENT: Fix 405 Error on Public Deployment

## The Problem

Your **public Vercel site shows 405 errors** when trying to add medicines or use any backend features. This is because:

❌ **Vercel only deploys your FRONTEND**  
❌ **Your BACKEND is NOT deployed anywhere**  
❌ **API calls have nowhere to go**

In Codespaces, it works because both frontend and backend run together.

---

## The Solution (3 Steps - Takes 20 minutes)

### Step 1: Deploy Backend (Choose ONE option)

#### 🎯 EASIEST: Use Render.com (FREE)

1. **Go to**: https://render.com/register
2. **Sign in** with GitHub
3. **Click** "New +" → "Web Service"
4. **Select** your repository: `satyamraj2990/MediTatva`
5. **Configure**:
   ```
   Name: meditatva-backend
   Root Directory: meditatva-backend
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditatva
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. **Click** "Create Web Service"
8. **Wait** 5-10 minutes for deployment
9. **Copy** your backend URL: `https://meditatva-backend-xxxx.onrender.com`

#### 🗄️ Get MongoDB Connection String

**Option A: MongoDB Atlas (FREE - Recommended)**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (512MB)
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meditatva
   ```

**Option B: Use existing MongoDB** if you have one

---

### Step 2: Connect Frontend to Backend

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Open** your project
3. **Settings** → **Environment Variables**
4. **Add new variable**:
   ```
   Name: VITE_API_URL
   Value: https://meditatva-backend-xxxx.onrender.com/api
   ```
5. **Click** "Save"
6. **Deployments** tab → **Redeploy** latest deployment

---

### Step 3: Test

1. **Test Backend**:
   ```bash
   curl https://meditatva-backend-xxxx.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend**:
   - Open your Vercel site
   - Try adding a medicine
   - Should work! ✅

---

## Alternative: Railway.app

If Render doesn't work, try Railway:

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select** `meditatva-backend` folder
4. **Add MongoDB**: Click "+ New" → "Database" → "MongoDB"
5. **Add variables**: Same as Render
6. **Deploy** and get URL

---

## Quick Deploy Command

```bash
# Run this to prepare files and commit
cd /workspaces/MediTatva
./setup-backend-deployment.sh
```

---

## After Deployment

### ⚠️ Free Tier Notes

- **Render Free**: Spins down after 15 mins of inactivity
- **First request**: Takes ~30 seconds to wake up
- **Upgrade**: $7/month for always-on service

### 🎯 Production Checklist

- [ ] Backend deployed to Render/Railway
- [ ] MongoDB Atlas cluster created
- [ ] VITE_API_URL set in Vercel
- [ ] Frontend redeployed
- [ ] Tested adding medicine
- [ ] Tested all features

---

## Need Help?

See full guide: [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md)

## Common Issues

**Q: Still getting 405?**  
A: Check Vercel environment variables and redeploy

**Q: Backend is slow?**  
A: Free tier sleeps. Upgrade or keep it awake with uptime monitors

**Q: CORS errors?**  
A: Make sure FRONTEND_URL matches your Vercel URL exactly

---

**TL;DR**: Your backend needs to be deployed separately. Use Render.com (free), set up MongoDB Atlas (free), connect them, and your site will work! 🚀
