#!/bin/bash
# Quick script to show MediTatva access URLs in Codespaces

echo ""
echo "🏥 MediTatva - Healthcare Platform"
echo "=================================="
echo ""
echo "✅ Services Running:"
echo ""

# Check backend
if curl -s http://localhost:5000/api/medicines/stats > /dev/null 2>&1; then
    echo "   ✓ Backend API (Port 5000)"
    curl -s http://localhost:5000/api/medicines/stats | jq -r '"     → \(.totalMedicines) medicines loaded"' 2>/dev/null || echo "     → Running"
else
    echo "   ✗ Backend API (Port 5000) - Not responding"
fi

# Check frontend
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "   ✓ Frontend (Port 8080)"
else
    echo "   ✗ Frontend (Port 8080) - Not running"
fi

echo ""
echo "🌐 Access URLs:"
echo ""

if [ -n "$CODESPACE_NAME" ]; then
    # Running in GitHub Codespaces
    DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
    echo "   📱 Frontend (Main App):"
    echo "      https://${CODESPACE_NAME}-8080.${DOMAIN}"
    echo ""
    echo "   ⚙️  Backend API:"
    echo "      https://${CODESPACE_NAME}-5000.${DOMAIN}"
    echo ""
    echo "   💡 Tip: Click the 🌐 icon next to port 8080 in the PORTS tab"
else
    # Running locally
    echo "   📱 Frontend: http://localhost:8080"
    echo "   ⚙️  Backend:  http://localhost:5000"
fi

echo ""
echo "📋 Quick Test:"
echo "   After opening the frontend, try:"
echo "   → Medicine Analyser → Find Substitutes"
echo "   → Search 'Paracetamol' and find cheaper alternatives!"
echo ""
