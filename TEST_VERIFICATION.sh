#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "   🔍 MEDITATVA SYSTEM VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

echo "1️⃣  CHECKING MONGODB..."
docker ps | grep -q "meditatva-mongodb"
test_result $? "MongoDB container is running"
echo ""

echo "2️⃣  CHECKING BACKEND SERVER..."
lsof -i :3000 2>/dev/null | grep -q "LISTEN"
test_result $? "Backend listening on port 3000"
echo ""

echo "3️⃣  CHECKING FRONTEND SERVER..."
lsof -i :8080 2>/dev/null | grep -q "LISTEN"
test_result $? "Frontend listening on port 8080"
echo ""

echo "4️⃣  TESTING BACKEND HEALTH ENDPOINT..."
HEALTH=$(curl -s http://localhost:3000/health)
echo "$HEALTH" | grep -q '"ready":true'
test_result $? "Health endpoint returns ready:true"
echo "   Response: $HEALTH"
echo ""

echo "5️⃣  TESTING INVENTORY API..."
INVENTORY=$(curl -s http://localhost:3000/api/inventory)
echo "$INVENTORY" | grep -q '"success":true'
test_result $? "Inventory API returns success"
COUNT=$(echo "$INVENTORY" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null)
echo "   Found $COUNT medicines in inventory"
test_result $([ ! -z "$COUNT" ] && [ "$COUNT" -gt 0 ]; echo $?) "Inventory has medicines (count > 0)"
echo ""

echo "6️⃣  TESTING MEDICINE SEARCH API..."
SEARCH=$(curl -s "http://localhost:3000/api/medicines/search?q=test")
echo "$SEARCH" | grep -q '"success":true'
test_result $? "Search API returns success"
echo ""

echo "7️⃣  TESTING MEDICINE CREATION..."
CREATE=$(curl -s -X POST http://localhost:3000/api/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto Test Medicine",
    "price": 25,
    "initialStock": 50
  }')
echo "$CREATE" | grep -q '"success":true'
test_result $? "Medicine creation works"
echo ""

echo "8️⃣  VERIFYING DATA PERSISTENCE..."
sleep 1
NEW_COUNT=$(curl -s http://localhost:3000/api/inventory | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null)
test_result $([ "$NEW_COUNT" -gt "$COUNT" ]; echo $?) "Inventory count increased after creation (${COUNT} -> ${NEW_COUNT})"
echo ""

echo "9️⃣  TESTING AVAILABLE MEDICINES FOR BILLING..."
AVAILABLE=$(curl -s http://localhost:3000/api/invoices/available-medicines)
echo "$AVAILABLE" | grep -q '"success":true'
test_result $? "Available medicines API works"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "   📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}PASSED: $PASS${NC}"
echo -e "${RED}FAILED: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! SYSTEM IS FULLY OPERATIONAL!${NC}"
    echo ""
    echo "✅ You can now:"
    echo "   - Open http://localhost:8080 in your browser"
    echo "   - Navigate to Inventory tab"
    echo "   - Add medicines (they will persist to MongoDB)"
    echo "   - Search medicines"
    echo "   - Navigate back and forth (data persists)"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE${NC}"
    exit 1
fi
