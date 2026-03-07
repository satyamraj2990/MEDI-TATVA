#!/bin/bash

# MediTatva Project Startup Script
echo "╔════════════════════════════════════════════════════════╗"
echo "║          MediTatva Pharmacy Management System         ║"
echo "║              Starting Backend + Frontend              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}[1/5]${NC} Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB is running"
else
    echo -e "${YELLOW}⚠${NC} MongoDB is not running. Starting MongoDB..."
    # Try to start MongoDB (adjust based on your system)
    sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log 2>/dev/null || echo -e "${YELLOW}⚠${NC} Could not start MongoDB automatically. Please start it manually."
fi
echo ""

# Navigate to backend directory
echo -e "${BLUE}[2/5]${NC} Preparing Backend..."
cd /workspaces/MediTatva/meditatva-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Installing backend dependencies..."
    npm install
fi

# Kill any process on port 3000
echo -e "${BLUE}[3/5]${NC} Checking port 3000..."
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
    echo -e "${YELLOW}⚠${NC} Port 3000 is in use. Killing process..."
    kill -9 $PORT_3000_PID 2>/dev/null
    sleep 1
fi

# Start backend in background
echo -e "${GREEN}✓${NC} Starting Backend Server..."
npm start > /tmp/meditatva-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

# Wait for backend to be ready
echo -e "${BLUE}[4/5]${NC} Waiting for backend to be ready..."
for i in {1..20}; do
    if curl -s http://localhost:3000/health | grep -q "ok\|running"; then
        echo -e "${GREEN}✓${NC} Backend is ready!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Navigate to frontend directory
echo -e "${BLUE}[5/5]${NC} Starting Frontend..."
cd /workspaces/MediTatva/meditatva-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Installing frontend dependencies..."
    npm install
fi

# Kill any process on port 8080
PORT_8080_PID=$(lsof -ti:8080)
if [ ! -z "$PORT_8080_PID" ]; then
    echo -e "${YELLOW}⚠${NC} Port 8080 is in use. Killing process..."
    kill -9 $PORT_8080_PID 2>/dev/null
    sleep 1
fi

echo -e "${GREEN}✓${NC} Starting Frontend Server..."
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║                   SERVERS STARTING                    ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║  Backend:  http://localhost:3000                      ║"
echo "║  API:      http://localhost:3000/api                  ║"
echo "║  Health:   http://localhost:3000/health               ║"
echo "║  Frontend: http://localhost:8080                      ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║  Backend logs: /tmp/meditatva-backend.log             ║"
echo "║  Backend PID:  $BACKEND_PID                               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Starting frontend in foreground...${NC}"
echo ""

# Start frontend (foreground)
npm run dev
