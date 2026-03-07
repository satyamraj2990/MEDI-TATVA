#!/bin/bash

# Test MediTatva Backend API Endpoints

echo "🧪 Testing MediTatva Backend API Endpoints"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}✓${NC} ($http_code)"
        echo "   Response: $(echo $body | head -c 100)..."
    else
        echo -e "${RED}✗${NC} (Expected $expected, got $http_code)"
        echo "   Response: $body"
    fi
    echo ""
}

# Wait for server
echo "⏳ Waiting for backend server..."
for i in {1..10}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is responding"
        echo ""
        break
    fi
    sleep 1
done

# Run tests
echo "Running API Tests:"
echo "==================="
echo ""

test_endpoint "Root Endpoint" "$BASE_URL/" "200"
test_endpoint "Health Check" "$BASE_URL/health" "200"
test_endpoint "API Test" "$API_URL/test" "200"
test_endpoint "Get Medicines" "$API_URL/medicines" "200"
test_endpoint "Search Medicines (empty)" "$API_URL/medicines/search?q=" "200"
test_endpoint "Search Medicines (paracetamol)" "$API_URL/medicines/search?q=para" "200"
test_endpoint "Get Inventory" "$API_URL/inventory" "200"
test_endpoint "Get Available Medicines" "$API_URL/invoices/available-medicines" "200"
test_endpoint "Get Invoices" "$API_URL/invoices" "200"

echo ""
echo "=========================================="
echo "✅ API Test Complete!"
echo ""
echo "📊 Quick Summary:"
curl -s "$BASE_URL/" | python3 -m json.tool 2>/dev/null || echo "Could not parse JSON"
