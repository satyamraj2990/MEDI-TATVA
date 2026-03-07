# 🏗️ Architecture: Why "No Medicines Found" on Vercel

## Current Problem Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CODESPACE (Working)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Frontend   │  /api   │   Backend    │                 │
│  │ Port: 8080   │────────▶│ Port: 3000   │─────┐          │
│  │ (Vite Proxy) │         │ (Express)    │     │          │
│  └──────────────┘         └──────────────┘     │          │
│                                                 ▼          │
│                           ┌─────────────────────────┐      │
│                           │  MongoDB (Docker)       │      │
│                           │  Port: 27017            │      │
│                           │  ✅ Has 10+ medicines   │      │
│                           └─────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ✅ Works: Frontend → Backend → Database
```

```
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL DEPLOYMENT (Broken)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │   Frontend   │  /api/medicines                           │
│  │   (Static)   │────────▶  ❌ No Backend!                  │
│  │   HTML/CSS/JS│            404 Not Found                  │
│  └──────────────┘                                           │
│                                                              │
│  Result: "No medicines found" 😞                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ❌ Fails: Frontend → ❌ Nothing
```

---

## Solution Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     PRODUCTION (Fixed)                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐                                              │
│  │  Vercel.app     │                                              │
│  │  (Frontend)     │                                              │
│  │  ┌───────────┐  │                                              │
│  │  │ React App │  │  HTTPS                                       │
│  │  │ Static    │  │──────────────────────┐                      │
│  │  └───────────┘  │                      │                      │
│  │                 │                      │                      │
│  │  VITE_API_URL:  │                      ▼                      │
│  │  meditatva-     │         ┌────────────────────────┐          │
│  │  backend.       │         │   Render.com           │          │
│  │  onrender.com   │         │   (Backend API)        │          │
│  └─────────────────┘         │   ┌──────────────┐    │          │
│                               │   │  Node.js     │    │          │
│  User searches medicine       │   │  Express API │    │          │
│         ↓                     │   └──────────────┘    │          │
│  API call to Render.com       │          │            │          │
│         ↓                     │          │ Queries    │          │
│  Returns medicine data        │          ▼            │          │
│         ↓                     │   ┌──────────────┐    │          │
│  Display results ✅           │   │  MongoDB     │    │          │
│                               │   │  Atlas       │    │          │
│                               │   │  (Cloud DB)  │    │          │
│                               │   └──────────────┘    │          │
│                               └────────────────────────┘          │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

Flow:
1. User visits: https://meditatva.vercel.app
2. Searches for "paracetamol"
3. Frontend calls: https://meditatva-backend.onrender.com/api/medicines/search?q=paracetamol
4. Backend queries MongoDB Atlas
5. Returns medicine data
6. Frontend displays results ✅
```

---

## Configuration Flow

### 1. Environment Variables

#### Vercel (Frontend)
```env
VITE_API_URL=https://meditatva-backend.onrender.com/api
```
↓ Used by frontend to know where backend is

#### Render (Backend)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/meditatva
FRONTEND_URL=https://meditatva.vercel.app
NODE_ENV=production
PORT=3000
```
↓ Used by backend to connect to database and allow CORS

---

## Data Flow

### Search Medicine Request

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. User types "paracetamol" in search box                     │
│     └─→ Frontend: BillingTab.tsx                               │
│                                                                  │
│  2. Frontend calls API                                          │
│     api.medicines.search("paracetamol")                        │
│     └─→ GET https://meditatva-backend.onrender.com/            │
│         api/medicines/search?q=paracetamol                     │
│                                                                  │
│  3. Backend receives request                                    │
│     └─→ medicineController.js → searchMedicines()             │
│                                                                  │
│  4. Backend queries MongoDB                                     │
│     Medicine.find({ name: /paracetamol/i })                    │
│     └─→ MongoDB Atlas Cloud Database                           │
│                                                                  │
│  5. MongoDB returns matching medicines                          │
│     [{ name: "Paracetamol 500mg", price: 25, ... }]           │
│     └─→ Backend                                                 │
│                                                                  │
│  6. Backend sends response to frontend                          │
│     { success: true, data: [...], count: 5 }                   │
│     └─→ Frontend                                                │
│                                                                  │
│  7. Frontend displays results                                   │
│     └─→ User sees medicine list with prices ✅                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Vite Proxy Doesn't Work on Vercel

### In Codespace (Development)

```javascript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // ✅ Works locally
    changeOrigin: true
  }
}
```

Request: `/api/medicines` → Vite Dev Server → `http://localhost:3000/api/medicines`

### On Vercel (Production)

```
Request: /api/medicines
         ↓
Vercel tries to find: /api/medicines.html
         ↓
❌ Not found! (Only static files exist)
```

**Solution**: Set `VITE_API_URL` to point to actual deployed backend!

---

## File Structure

### Frontend (Vercel)
```
meditatva-frontend/dist/
├── index.html                    ← Entry point
├── assets/
│   ├── index-abc123.js          ← React app (includes API calls)
│   └── index-xyz789.css
└── ...

When code runs:
- import.meta.env.VITE_API_URL = "https://meditatva-backend.onrender.com/api"
- All API calls go to this URL
```

### Backend (Render)
```
meditatva-backend/
├── src/
│   ├── app.js                   ← Express server
│   ├── controllers/
│   │   └── medicineController.js ← Search logic
│   └── models/
│       └── Medicine.js          ← MongoDB schema
└── seed.js                      ← Populate database
```

---

## Common Mistakes

### ❌ Wrong: Relative API URLs on Vercel
```javascript
// This doesn't work on Vercel:
fetch('/api/medicines')  // Looks for static file
```

### ✅ Correct: Absolute URL from Environment
```javascript
// This works:
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/medicines`)
// → https://meditatva-backend.onrender.com/api/medicines
```

---

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database seeded with medicines
- [ ] Backend deployed to Render.com
- [ ] Backend health check passes: `curl https://backend.onrender.com/health`
- [ ] Medicines API works: `curl https://backend.onrender.com/api/medicines`
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] Environment variable `FRONTEND_URL` set in Render
- [ ] Frontend redeployed on Vercel
- [ ] CORS allows Vercel domain
- [ ] Test search works on live site ✅

---

## Testing

### Local Testing (Codespace)
```bash
# Terminal 1: Start backend
cd meditatva-backend && npm start

# Terminal 2: Start frontend  
cd meditatva-frontend && npm run dev

# Test: http://localhost:8080
```

### Production Testing
```bash
# 1. Test Backend
curl https://meditatva-backend.onrender.com/health

# 2. Test API
curl "https://meditatva-backend.onrender.com/api/medicines/search?q=para"

# 3. Test Frontend
# Open: https://your-app.vercel.app
# Navigate to: Pharmacy → Billing
# Search for: paracetamol
# Should see results! ✅
```

---

## Cost Breakdown

| Service | Plan | Cost | What it does |
|---------|------|------|--------------|
| **Vercel** | Hobby | $0 | Hosts frontend static files |
| **Render** | Free | $0 | Runs backend API server |
| **MongoDB Atlas** | M0 | $0 | Stores medicine data |
| **Total** | | **$0/month** | Full production app! |

**Note**: Render free tier sleeps after 15 minutes of inactivity.
First request after sleep takes ~30-60 seconds to wake up.

---

## Upgrade Path (Optional)

To avoid cold starts and improve performance:

| Service | Upgrade | Cost | Benefit |
|---------|---------|------|---------|
| Render | Starter | $7/mo | Always-on, no cold starts |
| MongoDB | M2 | $9/mo | More storage & performance |
| Vercel | Pro | $20/mo | More bandwidth, analytics |

Most users: Free tier is sufficient! 🎉
