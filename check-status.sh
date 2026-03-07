#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  📊 MediTatva - Service Status Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check MongoDB
echo "🗄️  MongoDB:"
if docker ps | grep -q meditatva-mongodb; then
  UPTIME=$(docker ps --format "{{.Status}}" --filter "name=meditatva-mongodb")
  echo "   ✅ Running ($UPTIME)"
  echo "   📍 Port: 27017"
else
  echo "   ❌ Not running"
  if docker ps -a | grep -q meditatva-mongodb; then
    echo "   💡 Container exists but stopped. Run: docker start meditatva-mongodb"
  else
    echo "   💡 Container not found. Create with: docker run -d --name meditatva-mongodb -p 27017:27017 mongo:7"
  fi
fi

echo ""
echo "⚙️  Backend API:"
if pgrep -f "node.*app.js" > /dev/null; then
  PID=$(pgrep -f "node.*app.js" | head -1)
  UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
  echo "   ✅ Running (PID: $PID, Uptime: $UPTIME)"
  
  # Test health endpoint
  HEALTH=$(curl -s http://localhost:3000/health 2>&1)
  if echo "$HEALTH" | grep -q "ready"; then
    echo "   ✅ Health check: PASSED"
    echo "   📍 http://localhost:3000/api"
  else
    echo "   ⚠️  Health check: Backend starting..."
  fi
else
  echo "   ❌ Not running"
  echo "   💡 Start with: cd meditatva-backend && npm start"
fi

echo ""
echo "🎨 Frontend Dev Server:"
if pgrep -f "vite" > /dev/null; then
  PID=$(pgrep -f "vite" | head -1)
  UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
  echo "   ✅ Running (PID: $PID, Uptime: $UPTIME)"
  
  # Test frontend endpoint
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>&1)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ HTTP check: PASSED"
    echo "   📍 http://localhost:8080"
  else
    echo "   ⚠️  HTTP check: Vite compiling... (HTTP $HTTP_CODE)"
  fi
else
  echo "   ❌ Not running"
  echo "   💡 Start with: cd meditatva-frontend && npm run dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔗 Quick Actions"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Start all services:    ./start-all.sh"
echo "View backend logs:     tail -f meditatva-backend/backend.log"
echo "View frontend logs:    tail -f meditatva-frontend/frontend.log"
echo "Stop all services:     ./stop-all.sh"
echo ""
