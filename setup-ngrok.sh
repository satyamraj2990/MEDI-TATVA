#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Medi Call Sarthi - Ngrok Setup for Development      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install ngrok:"
    echo "  curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
    echo "  echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
    echo "  sudo apt update && sudo apt install ngrok -y"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo "⚠️  ngrok is not authenticated"
    echo ""
    echo "Steps to authenticate:"
    echo "  1. Sign up at https://ngrok.com/"
    echo "  2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "  3. Run: ngrok authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ ngrok is authenticated"
echo ""

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 3000"
    echo "   Start it with: cd meditatva-backend && npm start"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Start ngrok
echo "🚀 Starting ngrok tunnel..."
ngrok http 3000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

sleep 5

# Get public URL
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "   Check /tmp/ngrok.log for details"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok tunnel created!"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                   Public URL                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  $PUBLIC_URL"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║               Next Steps                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "1️⃣  Update backend .env file:"
echo "   BACKEND_URL=$PUBLIC_URL"
echo ""
echo "2️⃣  Restart backend:"
echo "   pkill -f 'node.*app.js'"
echo "   cd meditatva-backend && npm start"
echo ""
echo "3️⃣  Test the call feature from:"
echo "   http://localhost:8080"
echo ""
echo "4️⃣  Keep this terminal open while testing"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            Ngrok Web Interface                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok when done"
echo ""

# Keep running
wait $NGROK_PID
