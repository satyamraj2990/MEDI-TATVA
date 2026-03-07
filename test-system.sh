#!/bin/bash

# Quick test script for MediTatva API and Frontend

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        MediTatva - Quick System Test                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Backend Health
echo "1️⃣  Testing Backend Health..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health --max-time 5)
if [ "$health_response" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $health_response)${NC}"
    echo "   Run: ./start-all.sh to start services"
    exit 1
fi
echo ""

# Test 2: Database Connection
echo "2️⃣  Testing Database Connection..."
db_status=$(curl -s http://localhost:3000/health | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
if [ "$db_status" = "connected" ]; then
    echo -e "${GREEN}✅ Database is connected${NC}"
else
    echo -e "${RED}❌ Database not connected: $db_status${NC}"
    exit 1
fi
echo ""

# Test 3: Medicine API
echo "3️⃣  Testing Medicine Search API..."
medicine_count=$(curl -s "http://localhost:3000/api/medicines" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$medicine_count" -gt 0 ]; then
    echo -e "${GREEN}✅ Medicine API working ($medicine_count medicines found)${NC}"
else
    echo -e "${YELLOW}⚠️  No medicines in database${NC}"
    echo "   Run: cd meditatva-backend && node seed.js"
fi
echo ""

# Test 4: Inventory API
echo "4️⃣  Testing Inventory API..."
inventory_count=$(curl -s "http://localhost:3000/api/inventory" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$inventory_count" -gt 0 ]; then
    echo -e "${GREEN}✅ Inventory API working ($inventory_count items found)${NC}"
else
    echo -e "${YELLOW}⚠️  No inventory data${NC}"
    echo "   Run: cd meditatva-backend && node seed.js"
fi
echo ""

# Test 5: Frontend
echo "5️⃣  Testing Frontend..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 --max-time 5)
if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is running (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $frontend_response)${NC}"
    echo "   Run: ./start-all.sh to start services"
fi
echo ""

# Test 6: Search functionality
echo "6️⃣  Testing Medicine Search..."
search_result=$(curl -s "http://localhost:3000/api/medicines/search?q=paracetamol")
search_count=$(echo "$search_result" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$search_count" -gt 0 ]; then
    echo -e "${GREEN}✅ Search working ($search_count results for 'paracetamol')${NC}"
    
    # Show sample result
    medicine_name=$(echo "$search_result" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    medicine_price=$(echo "$search_result" | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
    medicine_stock=$(echo "$search_result" | grep -o '"current_stock":[0-9]*' | head -1 | cut -d':' -f2)
    
    echo "   Sample: $medicine_name - ₹$medicine_price (Stock: $medicine_stock)"
else
    echo -e "${YELLOW}⚠️  Search returned no results${NC}"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                   Test Summary                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if [ "$health_response" = "200" ] && [ "$db_status" = "connected" ] && [ "$medicine_count" -gt 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "📊 Statistics:"
    echo "   • Medicines: $medicine_count"
    echo "   • Inventory Items: $inventory_count"
    echo "   • Backend: http://localhost:3000"
    echo "   • Frontend: http://localhost:8080"
    echo ""
    echo "🎯 Quick Actions:"
    echo "   • Open frontend: open http://localhost:8080 (or click link)"
    echo "   • View API docs: http://localhost:3000"
    echo "   • Pharmacy Billing: http://localhost:8080/pharmacy/billing"
    echo "   • Inventory: http://localhost:8080/pharmacy/inventory"
else
    echo -e "${YELLOW}⚠️  Some issues detected${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    if [ "$health_response" != "200" ]; then
        echo "   • Start backend: cd meditatva-backend && npm start"
    fi
    if [ "$db_status" != "connected" ]; then
        echo "   • Start MongoDB: docker start meditatva-mongodb"
    fi
    if [ "$medicine_count" -eq 0 ]; then
        echo "   • Seed database: cd meditatva-backend && node seed.js"
    fi
    if [ "$frontend_response" != "200" ]; then
        echo "   • Start frontend: cd meditatva-frontend && npm run dev"
    fi
    echo ""
    echo "   Or run all: ./start-all.sh"
fi
echo ""
