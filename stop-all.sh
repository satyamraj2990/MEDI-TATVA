#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  🛑 MediTatva - Stopping All Services"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Stop Frontend
echo "🎨 Stopping Frontend..."
if pgrep -f "vite" > /dev/null; then
  pkill -f "vite"
  echo "   ✅ Frontend stopped"
else
  echo "   ℹ️  Frontend not running"
fi

# Stop Backend
echo ""
echo "⚙️  Stopping Backend..."
if pgrep -f "node.*app.js" > /dev/null; then
  pkill -f "node.*app.js"
  echo "   ✅ Backend stopped"
else
  echo "   ℹ️  Backend not running"
fi

# Stop MongoDB
echo ""
echo "📦 Stopping MongoDB..."
if docker ps | grep -q meditatva-mongodb; then
  docker stop meditatva-mongodb > /dev/null 2>&1
  echo "   ✅ MongoDB stopped"
else
  echo "   ℹ️  MongoDB not running"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ All services stopped"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "To start again: ./start-all.sh"
echo ""
