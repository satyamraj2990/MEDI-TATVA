# 🚨 QUICK FIX: No Medicines Found on Vercel

## The Problem
**Vercel only hosts the frontend. Your backend is NOT deployed.**

When you search for medicines on Vercel, there's no API server to respond.

---

## ⚡ Quick Solution (3 Steps)

### Step 1: Deploy Backend (10 minutes)

1. **Go to**: https://render.com (sign up free)

2. **Click**: New + → Web Service

3. **Configure**:
   ```
   Repository:     satyamraj2990/MediTatva
   Root Directory: meditatva-backend
   Build Command:  npm install
   Start Command:  npm start
   ```

4. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditatva
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Get MongoDB Atlas** (free): https://mongodb.com/cloud/atlas
   - Create M0 cluster → Get connection string

6. **Click Deploy** → Copy your URL:
   ```
   https://meditatva-backend.onrender.com
   ```

7. **Seed Database** (in Render Shell):
   ```bash
   node seed.js
   ```

---

### Step 2: Configure Vercel (2 minutes)

1. **Go to**: Vercel Dashboard → Your Project → Settings

2. **Environment Variables** → Add New:
   ```
   Name:  VITE_API_URL
   Value: https://meditatva-backend.onrender.com/api
   ```

3. **Save**

---

### Step 3: Redeploy (1 minute)

**Option A** - From Codespace:
```bash
git commit --allow-empty -m "Configure backend"
git push
```

**Option B** - From Vercel Dashboard:
- Go to Deployments → Click "Redeploy"

---

## ✅ Verification

### Test Backend:
```bash
curl https://meditatva-backend.onrender.com/health
```

Should return:
```json
{"status":"ok","database":"connected","ready":true}
```

### Test Frontend:
1. Open your Vercel URL
2. Go to: Pharmacy → Billing  
3. Search: "paracetamol"
4. Should show medicines! ✅

---

## 🔧 Troubleshooting

### Still showing "No medicines found"?

**Check Environment Variable**:
- Go to Vercel → Settings → Environment Variables
- Verify `VITE_API_URL` is set correctly
- Redeploy after adding/changing

**Check Browser Console** (F12):
```javascript
// Run in console to verify:
console.log(import.meta.env.VITE_API_URL)
```

**Check Network Tab**:
- Open DevTools → Network tab
- Search for medicine
- Check which URL the request goes to
- Should be: `https://meditatva-backend.onrender.com/api/medicines/search`

**Check Backend is Running**:
```bash
curl "https://meditatva-backend.onrender.com/api/medicines/search?q=para"
```

### CORS Error?

In Render dashboard, verify `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

### Database Empty?

Re-run seed script in Render Shell:
```bash
node seed.js
```

---

## 📋 Complete Checklist

- [ ] Backend deployed to Render.com
- [ ] MongoDB Atlas cluster created
- [ ] Database seeded with medicines
- [ ] VITE_API_URL set in Vercel
- [ ] Frontend redeployed
- [ ] Backend health check passes
- [ ] Medicines search works

---

## 💰 Cost

Everything is **FREE**:
- ✅ Render.com: Free tier (with cold starts)
- ✅ MongoDB Atlas: M0 cluster (512MB free)
- ✅ Vercel: Hobby plan

---

## 📚 Detailed Guide

For complete step-by-step instructions, see:
- **VERCEL_BACKEND_FIX.md** - Full deployment guide
- **BACKEND_DEPLOYMENT_GUIDE.md** - Backend deployment details

---

## Need Help?

Common issues:
1. **Cold starts**: Render free tier sleeps after 15 min → first request slow
2. **Wrong URL**: Make sure VITE_API_URL ends with `/api`
3. **Not redeployed**: Must redeploy Vercel after adding env var
4. **Empty database**: Run `node seed.js` in Render Shell

---

**Quick Support**: Check browser console and Render logs for specific errors.
