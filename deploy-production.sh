#!/bin/bash

# Quick deployment script for MediTatva
# This script helps you deploy backend and configure frontend for Vercel

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     MediTatva - Production Deployment Helper            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
print_step "Deployment Checklist"
echo "══════════════════════════════════════════════════════════"
echo ""

# Check 1: Backend deployment
echo "1️⃣  Backend Deployment (Render.com)"
echo "   Have you deployed the backend to Render.com?"
echo "   📖 Guide: See VERCEL_BACKEND_FIX.md"
echo ""
read -p "   Is backend deployed? (y/n): " backend_deployed

if [ "$backend_deployed" != "y" ]; then
    print_warning "Backend needs to be deployed first!"
    echo ""
    echo "Quick steps:"
    echo "1. Sign up at https://render.com"
    echo "2. Create new Web Service from GitHub repo"
    echo "3. Configure root directory: meditatva-backend"
    echo "4. Set environment variables (MONGODB_URI, etc.)"
    echo "5. Deploy and copy the URL"
    echo ""
    exit 1
fi

print_success "Backend is deployed"
echo ""

# Get backend URL
echo "2️⃣  Backend URL"
read -p "   Enter your Render backend URL (e.g., https://meditatva-backend.onrender.com): " backend_url

if [ -z "$backend_url" ]; then
    print_error "Backend URL is required!"
    exit 1
fi

# Remove trailing slash
backend_url="${backend_url%/}"
print_success "Backend URL: $backend_url"
echo ""

# Test backend
echo "3️⃣  Testing Backend Connection"
print_step "Checking health endpoint..."

health_response=$(curl -s -o /dev/null -w "%{http_code}" "$backend_url/health" --max-time 10)

if [ "$health_response" = "200" ]; then
    print_success "Backend is responding (HTTP 200)"
    
    # Test medicines API
    print_step "Testing medicines API..."
    medicines_response=$(curl -s "$backend_url/api/medicines/search?q=para" --max-time 10)
    
    if [ ! -z "$medicines_response" ]; then
        print_success "Medicines API is working"
    else
        print_warning "Medicines API returned empty response"
        echo "   Make sure you've seeded the database with: node seed.js"
    fi
else
    print_error "Backend health check failed (HTTP $health_response)"
    echo "   Please check your Render deployment logs"
    exit 1
fi
echo ""

# Check 4: Vercel configuration
echo "4️⃣  Vercel Configuration"
print_step "Setting up environment variable for Vercel..."
echo ""
echo "   In your Vercel Dashboard:"
echo "   1. Go to your project → Settings → Environment Variables"
echo "   2. Add new variable:"
echo "      Name:  VITE_API_URL"
echo "      Value: ${backend_url}/api"
echo "   3. Click Save"
echo ""
read -p "   Have you set VITE_API_URL in Vercel? (y/n): " vercel_env

if [ "$vercel_env" != "y" ]; then
    print_warning "Please add the environment variable in Vercel"
    echo ""
    echo "Quick link: https://vercel.com/dashboard"
    exit 1
fi

print_success "Vercel environment variable configured"
echo ""

# Check 5: CORS configuration
echo "5️⃣  CORS Configuration"
echo "   Your Vercel URL is needed for CORS"
read -p "   Enter your Vercel URL (e.g., https://meditatva.vercel.app): " vercel_url

if [ ! -z "$vercel_url" ]; then
    # Update backend .env
    if [ -f "meditatva-backend/.env" ]; then
        if grep -q "FRONTEND_URL=" meditatva-backend/.env; then
            sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$vercel_url|g" meditatva-backend/.env
            print_success "Updated FRONTEND_URL in backend/.env"
        else
            echo "FRONTEND_URL=$vercel_url" >> meditatva-backend/.env
            print_success "Added FRONTEND_URL to backend/.env"
        fi
        
        echo ""
        print_warning "Remember to update FRONTEND_URL in Render dashboard too!"
        echo "   Render → Your Service → Environment → FRONTEND_URL = $vercel_url"
    fi
fi
echo ""

# Check 6: Database seeded
echo "6️⃣  Database Status"
echo "   Have you seeded the MongoDB database?"
read -p "   Is database seeded with medicines? (y/n): " db_seeded

if [ "$db_seeded" != "y" ]; then
    print_warning "Database needs to be seeded!"
    echo ""
    echo "Run this in Render Shell (Dashboard → Shell):"
    echo "  node seed.js"
    echo ""
    echo "Or from Codespace:"
    echo "  MONGODB_URI='your-mongodb-uri' node meditatva-backend/seed.js"
    echo ""
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 1
    fi
else
    print_success "Database is seeded"
fi
echo ""

# Final step: Redeploy
echo "7️⃣  Trigger Vercel Redeploy"
print_step "Do you want to trigger a Vercel redeploy now?"
read -p "   Trigger redeploy? (y/n): " trigger_deploy

if [ "$trigger_deploy" = "y" ]; then
    print_step "Committing empty commit to trigger deploy..."
    git commit --allow-empty -m "chore: trigger Vercel redeploy with backend URL"
    
    print_step "Pushing to GitHub..."
    git push origin main
    
    print_success "Deployment triggered!"
    echo ""
    echo "   Monitor progress at: https://vercel.com/dashboard"
else
    print_warning "Manual redeploy needed"
    echo "   Run: git commit --allow-empty -m 'redeploy' && git push"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  Deployment Summary                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📡 Backend API:  $backend_url"
echo "🌐 Frontend:     $vercel_url"
echo "🔗 API Endpoint: ${backend_url}/api"
echo ""
echo "Next steps:"
echo "1. Wait for Vercel deployment to complete (~2 minutes)"
echo "2. Open your Vercel URL: $vercel_url"
echo "3. Navigate to Pharmacy → Billing"
echo "4. Search for medicines - should now work! ✅"
echo ""
echo "If issues persist:"
echo "• Check browser console (F12) for errors"
echo "• Check Render logs for backend issues"
echo "• Verify environment variable in Vercel"
echo "• See VERCEL_BACKEND_FIX.md for troubleshooting"
echo ""
print_success "Deployment configuration complete!"
