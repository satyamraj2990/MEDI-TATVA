#!/bin/bash
# Diagnostic script for MediTatva frontend loading issues

echo "🔍 MediTatva Frontend Diagnostic"
echo "================================="
echo ""

echo "1. Checking if frontend is running..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "   ✓ Frontend server is responding"
else
    echo "   ✗ Frontend server is not responding"
    exit 1
fi
echo ""

echo "2. Checking environment variables..."
cd /workspaces/MediTatva/meditatva-frontend
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    echo "   Gemini API Key set: $(grep VITE_GEMINI_API_KEY .env | wc -l)"
else
    echo "   ✗ .env file not found"
fi
echo ""

echo "3. Checking critical dependencies..."
npm list react react-dom framer-motion @tanstack/react-query 2>/dev/null | grep -E "^├──|^└──" | head -4
echo ""

echo "4. Testing page load..."
HTML_SIZE=$(curl -s http://localhost:8080 | wc -c)
echo "   HTML size: $HTML_SIZE bytes"
echo ""

echo "5. Checking for build errors..."
if [ -d "node_modules/.vite" ]; then
    echo "   Vite cache exists"
else
    echo "   No Vite cache (first run)"
fi
echo ""

echo "📋 Next Steps:"
echo "   1. Open browser DevTools (F12)"
echo "   2. Go to Console tab"
echo "   3. Refresh the page"
echo "   4. Look for red error messages"
echo ""
echo "   Common issues:"
echo "   • 'Failed to fetch dynamically imported module' - Try clearing cache"
echo "   • Import errors - Check if all dependencies are installed"
echo "   • API key errors - Check .env file"
echo ""
echo "   Quick fixes:"
echo "   • Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "   • Clear browser cache"
echo "   • Check browser console for specific error messages"
echo ""
