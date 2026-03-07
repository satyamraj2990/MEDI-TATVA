#!/bin/bash
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║           🎤 VOICE CALL SYSTEM DIAGNOSTIC                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check environment variables
echo "📋 Configuration Check:"
echo ""
cd /workspaces/MediTatva/meditatva-backend
source .env

if [ -z "$TWILIO_ACCOUNT_SID" ] || [ "$TWILIO_ACCOUNT_SID" = "your_twilio_account_sid" ]; then
  echo "❌ TWILIO_ACCOUNT_SID not configured"
else
  echo "✅ TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID:0:10}..."
fi

if [ -z "$TWILIO_AUTH_TOKEN" ] || [ "$TWILIO_AUTH_TOKEN" = "your_twilio_auth_token" ]; then
  echo "❌ TWILIO_AUTH_TOKEN not configured"
else
  echo "✅ TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN:0:10}..."
fi

if [ -z "$TWILIO_PHONE_NUMBER" ] || [ "$TWILIO_PHONE_NUMBER" = "your_twilio_phone_number" ]; then
  echo "❌ TWILIO_PHONE_NUMBER not configured"
else
  echo "✅ TWILIO_PHONE_NUMBER: $TWILIO_PHONE_NUMBER"
fi

if [ -z "$BACKEND_URL" ] || [[ "$BACKEND_URL" == *"localhost"* ]]; then
  echo "❌ BACKEND_URL not set to public ngrok URL"
  echo "   Current: $BACKEND_URL"
else
  echo "✅ BACKEND_URL: $BACKEND_URL"
fi

echo ""
echo "🌐 Ngrok Tunnel:"
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)
if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
  echo "✅ Active: $NGROK_URL"
else
  echo "❌ Ngrok not running"
fi

echo ""
echo "🔧 Backend Status:"
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is not responding"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📞 TO INITIATE A TEST CALL:"
echo ""
echo "curl -X POST http://localhost:3000/api/voice-call/initiate-call \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"phoneNumber\": \"YOUR_PHONE_NUMBER\", \"patientName\": \"Test User\"}'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
