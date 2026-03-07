#!/bin/bash
# Test script for Medicine Substitute Finder feature
echo "🧪 Testing Medicine Substitute Finder Feature"
echo "=============================================="
echo ""

# Test 1: Backend Status
echo "[1/4] Checking backend status..."
STATUS=$(curl -s http://localhost:5000/api/medicines/stats)
if [[ $STATUS == *"loaded"* ]]; then
    echo "✅ Backend is running"
    echo "   Database: $STATUS"
else
    echo "❌ Backend not responding"
    exit 1
fi
echo ""

# Test 2: Search through Vite proxy
echo "[2/4] Testing search through Vite proxy..."
SEARCH=$(curl -s "http://localhost:8080/api/medicines/search?q=dolo" | head -c 200)
if [[ $SEARCH == *"name"* ]]; then
    echo "✅ Search working through proxy"
    echo "   Sample: $SEARCH..."
else
    echo "❌ Search failed"
    exit 1
fi
echo ""

# Test 3: Substitutes API through proxy
echo "[3/4] Testing substitutes API through proxy..."
SUBS=$(curl -s "http://localhost:8080/api/medicines/substitutes?name=Dolo%20650%20Tablet" | head -c 300)
if [[ $SUBS == *"Paracetamol"* ]]; then
    echo "✅ Substitutes API working"
    echo "   Found alternatives with same composition"
else
    echo "❌ Substitutes API failed"
    exit 1
fi
echo ""

# Test 4: Direct backend test (for comparison)
echo "[4/4] Testing direct backend access..."
DIRECT=$(curl -s "http://localhost:5000/api/medicines/search?q=paracetamol" | head -c 200)
if [[ $DIRECT == *"name"* ]]; then
    echo "✅ Backend API accessible directly"
else
    echo "❌ Direct backend access failed"
    exit 1
fi
echo ""

echo "=============================================="
echo "✅ ALL TESTS PASSED!"
echo ""
echo "💡 Fix Applied:"
echo "   Changed API_BASE from 'http://localhost:5000' to ''"
echo "   Now uses Vite proxy at http://localhost:8080/api/*"
echo "   This prevents CORS issues and follows best practices"
echo ""
echo "📝 Next Steps:"
echo "   1. Refresh your browser (Ctrl+R or Cmd+R)"
echo "   2. Go to Medicine Analyser → Find Substitutes tab"
echo "   3. Search for 'Paracetamol' or 'Dolo'"
echo "   4. Select a medicine and click 'Find Substitutes'"
echo ""
