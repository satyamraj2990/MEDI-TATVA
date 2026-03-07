#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  🚀 MediTatva - Starting All Services"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Start MongoDB
echo "📦 Starting MongoDB Docker container..."
if docker ps -a | grep -q meditatva-mongodb; then
  docker start meditatva-mongodb > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "   ✅ MongoDB started"
  else
    echo "   ⚠️  MongoDB already running"
  fi
else
  echo "   ❌ MongoDB container not found!"
  echo "   Create it with: docker run -d --name meditatva-mongodb -p 27017:27017 mongo:7"
  exit 1
fi
sleep 3

# Start Backend
echo ""
echo "⚙️  Starting Backend API server..."
cd /workspaces/MediTatva/meditatva-backend

# Check if already running
if pgrep -f "node.*app.js" > /dev/null; then
  echo "   ⚠️  Backend already running"
else
  nohup npm start > backend.log 2>&1 &
  BACKEND_PID=$!
  echo "   ✅ Backend started (PID: $BACKEND_PID)"
fi
sleep 5

# Start Frontend
echo ""
echo "🎨 Starting Frontend dev server..."
cd /workspaces/MediTatva/meditatva-frontend

# Check if already running
if pgrep -f "vite" > /dev/null; then
  echo "   ⚠️  Frontend already running"
else
  nohup npm run dev > frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
fi
sleep 5

# Verify all services
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ Verification"
echo "═══════════════════════════════════════════════════════════"

# Check MongoDB
if docker ps | grep -q meditatva-mongodb; then
  echo "✅ MongoDB:  Running on port 27017"
else
  echo "❌ MongoDB:  Not running"
fi

# Check Backend
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "✅ Backend:  http://localhost:3000 (API ready)"
else
  echo "⏳ Backend:  Starting... (check logs: tail -f meditatva-backend/backend.log)"
fi

# Check Frontend
if curl -s http://localhost:8080 > /dev/null 2>&1; then
  echo "✅ Frontend: http://localhost:8080 (Open in browser)"
else
  echo "⏳ Frontend: Starting... (check logs: tail -f meditatva-frontend/frontend.log)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 MediTatva is ready!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Open in browser: http://localhost:8080"
echo "📊 Backend API:     http://localhost:3000/api"
echo "🏥 Health check:    http://localhost:3000/health"
echo ""
echo "To stop services:"
echo "  • MongoDB:  docker stop meditatva-mongodb"
echo "  • Backend:  pkill -f 'node.*app.js'"
echo "  • Frontend: pkill -f 'vite'"
echo ""
