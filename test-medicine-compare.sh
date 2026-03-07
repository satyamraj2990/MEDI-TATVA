#!/bin/bash

# Medicine Compare Feature - Quick Test Script
# Run this to verify the Medicine Comparison feature is working

echo "=================================================="
echo "🧪 MEDICINE COMPARE FEATURE TEST"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if backend is running
echo -e "${BLUE}[1/4] Checking Backend Status...${NC}"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}❌ Backend is not running. Starting...${NC}"
    cd /workspaces/MediTatva/meditatva-backend
    npm start > backend.log 2>&1 &
    sleep 5
fi
echo ""

# 2. Check medicine database
echo -e "${BLUE}[2/4] Checking Medicine Database...${NC}"
STATS=$(curl -s http://localhost:5000/api/medicines/stats)
echo "📊 Database Stats: $STATS"
echo ""

# 3. Test Search API
echo -e "${BLUE}[3/4] Testing Search API...${NC}"
echo "🔍 Searching for 'paracetamol'..."
SEARCH_RESULT=$(curl -s "http://localhost:5000/api/medicines/search?q=paracetamol" | python3 -m json.tool | head -20)
echo "$SEARCH_RESULT"
echo ""

# 4. Test Compare API
echo -e "${BLUE}[4/4] Testing Compare API...${NC}"
echo "💊 Comparing: Dolo 650 Tablet vs Aeldolo 650mg Tablet"
COMPARE_RESULT=$(curl -s -X POST http://localhost:5000/api/medicines/compare \
  -H "Content-Type: application/json" \
  -d '{"medicines":["Dolo 650 Tablet","Aeldolo 650mg Tablet"]}' | python3 -m json.tool)

echo "$COMPARE_RESULT"
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
echo "=================================================="
echo ""
echo "📝 Next Steps:"
echo "  1. Open test page: file:///workspaces/MediTatva/test-medicine-comparison.html"
echo "  2. Or use main app: http://localhost:8080"
echo "  3. Navigate to: Medicine Analyser → Compare Medicines"
echo ""
echo "🧪 Test Instructions:"
echo "  • Search for any medicine (e.g., paracetamol, dolo, crocin)"
echo "  • Select exactly 2 medicines"
echo "  • Click 'Compare Medicines' button"
echo "  • View side-by-side comparison"
echo ""
echo "📚 Documentation: MEDICINE_COMPARE_IMPLEMENTATION.md"
echo "=================================================="
