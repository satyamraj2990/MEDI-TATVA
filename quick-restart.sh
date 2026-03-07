#!/bin/bash

echo "🔄 Quick Restart - MediTatva"
echo "=============================="

# Fast parallel port cleanup
echo "🧹 Cleaning up..."
(fuser -k 3000/tcp 2>/dev/null &)
(fuser -k 8080/tcp 2>/dev/null &)
(pkill -9 -f "node.*meditatva" 2>/dev/null &)
wait
sleep 0.5

# Clear caches in parallel
echo "🗑️  Clearing caches..."
(rm -rf /workspaces/MediTatva/meditatva-frontend/.vite &)
(rm -rf /workspaces/MediTatva/meditatva-frontend/dist &)
(rm -rf /workspaces/MediTatva/meditatva-frontend/node_modules/.vite &)
wait
echo "✓ Cache cleared"

# Start MongoDB (async)
echo "🍃 Starting MongoDB..."
docker start meditatva-mongodb 2>/dev/null &
sleep 1

# Start Backend
echo "🚀 Starting Backend..."
cd /workspaces/MediTatva/meditatva-backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend (faster check)
echo "⏳ Waiting for backend..."
for i in {1..10}; do
    if curl -s -m 1 http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend ready!"
        break
    fi
    sleep 0.5
done

# Start Frontend
echo "🎨 Starting Frontend (with cache clear)..."
cd /workspaces/MediTatva/meditatva-frontend

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ Backend:  http://localhost:3000     ║"
echo "║  ✅ Frontend: http://localhost:8080     ║"
echo "║  📝 Backend Log: /tmp/backend.log       ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "🎯 Starting frontend with --force flag..."
echo ""

npm run dev -- --force --clearScreen false
