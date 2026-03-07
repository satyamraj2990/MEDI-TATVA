#!/bin/bash

# Deploy MediTatva Backend to Render.com
# This script helps you prepare for backend deployment

echo "╔════════════════════════════════════════════╗"
echo "║   MediTatva Backend Deployment Setup      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if .env exists in backend
if [ ! -f "meditatva-backend/.env.example" ]; then
    echo "❌ Error: meditatva-backend/.env.example not found"
    exit 1
fi

echo "✅ Configuration files ready"
echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo ""
echo "1️⃣  Create MongoDB Atlas Account (FREE)"
echo "   → Visit: https://www.mongodb.com/cloud/atlas/register"
echo "   → Create a free cluster"
echo "   → Get connection string"
echo ""
echo "2️⃣  Create Render.com Account (FREE)"
echo "   → Visit: https://render.com/register"
echo "   → Connect your GitHub account"
echo ""
echo "3️⃣  Deploy Backend on Render"
echo "   → Go to: https://render.com/new"
echo "   → Select 'Web Service'"
echo "   → Connect this repository: satyamraj2990/MediTatva"
echo "   → Configure:"
echo "      - Root Directory: meditatva-backend"
echo "      - Build Command: npm install"
echo "      - Start Command: npm start"
echo "      - Instance Type: Free"
echo ""
echo "4️⃣  Set Environment Variables in Render"
echo "   → NODE_ENV=production"
echo "   → PORT=3000"
echo "   → MONGODB_URI=<your-mongodb-connection-string>"
echo "   → FRONTEND_URL=<your-vercel-url>"
echo ""
echo "5️⃣  Update Vercel Environment Variables"
echo "   → Go to: https://vercel.com/<your-project>/settings/environment-variables"
echo "   → Add: VITE_API_URL=<your-render-backend-url>/api"
echo "   → Redeploy frontend"
echo ""
echo "6️⃣  Test Deployment"
echo "   → curl https://your-backend.onrender.com/health"
echo "   → Should return: {\"status\":\"ok\"}"
echo ""
echo "════════════════════════════════════════════════"
echo "📖 Full guide: BACKEND_DEPLOYMENT_GUIDE.md"
echo "════════════════════════════════════════════════"
echo ""

# Commit the changes
read -p "Do you want to commit deployment configs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add meditatva-backend/.env.example meditatva-backend/render.yaml BACKEND_DEPLOYMENT_GUIDE.md
    git commit -m "Add backend deployment configuration for Render.com"
    echo "✅ Changes committed"
    echo ""
    read -p "Push to GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        echo "✅ Pushed to GitHub"
        echo "🎉 Now go to Render.com to deploy!"
    fi
fi
