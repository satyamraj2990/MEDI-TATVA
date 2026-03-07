#!/bin/bash

# MediSaarthi Voice Assistant - Quick Test & Verification Script
# This script checks if everything is configured correctly

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   MediSaarthi Voice Assistant - System Check              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Change to backend directory
cd /workspaces/MediTatva/meditatva-backend

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: .env file exists
echo -n "1. Checking .env file... "
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ Found${NC}"
else
  echo -e "${RED}✗ Missing${NC}"
  ERRORS=$((ERRORS+1))
fi

# Check 2: BACKEND_URL configured
echo -n "2. Checking BACKEND_URL... "
BACKEND_URL=$(grep "^BACKEND_URL=" .env 2>/dev/null | cut -d '=' -f2)
if [ -z "$BACKEND_URL" ]; then
  echo -e "${RED}✗ Not set${NC}"
  ERRORS=$((ERRORS+1))
elif [[ "$BACKEND_URL" == *"localhost"* ]] || [[ "$BACKEND_URL" == *"127.0.0.1"* ]]; then
  echo -e "${YELLOW}⚠ Set to localhost (Twilio won't work!)${NC}"
  echo "   Current: $BACKEND_URL"
  echo "   Need: https://your-ngrok-url.ngrok-free.app"
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}✓ Configured${NC}"
  echo "   URL: $BACKEND_URL"
fi

# Check 3: Twilio credentials
echo -n "3. Checking Twilio Account SID... "
TWILIO_SID=$(grep "^TWILIO_ACCOUNT_SID=" .env 2>/dev/null | cut -d '=' -f2)
if [ -z "$TWILIO_SID" ]; then
  echo -e "${RED}✗ Not set${NC}"
  ERRORS=$((ERRORS+1))
elif [[ "$TWILIO_SID" == AC* ]]; then
  echo -e "${GREEN}✓ Valid format${NC}"
else
  echo -e "${YELLOW}⚠ Invalid format (should start with AC)${NC}"
  ERRORS=$((ERRORS+1))
fi

echo -n "4. Checking Twilio Auth Token... "
TWILIO_AUTH=$(grep "^TWILIO_AUTH_TOKEN=" .env 2>/dev/null | cut -d '=' -f2)
if [ -z "$TWILIO_AUTH" ]; then
  echo -e "${RED}✗ Not set${NC}"
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}✓ Configured${NC}"
fi

echo -n "5. Checking Twilio Phone Number... "
TWILIO_PHONE=$(grep "^TWILIO_PHONE_NUMBER=" .env 2>/dev/null | cut -d '=' -f2)
if [ -z "$TWILIO_PHONE" ]; then
  echo -e "${RED}✗ Not set${NC}"
  ERRORS=$((ERRORS+1))
elif [[ "$TWILIO_PHONE" == +* ]]; then
  echo -e "${GREEN}✓ Valid format${NC}"
  echo "   Number: $TWILIO_PHONE"
else
  echo -e "${YELLOW}⚠ Should start with +${NC}"
  ERRORS=$((ERRORS+1))
fi

# Check 4: Gemini API Key
echo -n "6. Checking Gemini API Key... "
GEMINI_KEY=$(grep "^GEMINI_API_KEY=" .env 2>/dev/null | cut -d '=' -f2)
if [ -z "$GEMINI_KEY" ]; then
  echo -e "${RED}✗ Not set${NC}"
  ERRORS=$((ERRORS+1))
elif [ "$GEMINI_KEY" = "your_key_here" ]; then
  echo -e "${RED}✗ Default placeholder (not real key)${NC}"
  ERRORS=$((ERRORS+1))
elif [[ "$GEMINI_KEY" == AIza* ]]; then
  echo -e "${GREEN}✓ Valid format${NC}"
else
  echo -e "${YELLOW}⚠ Unusual format (should start with AIza)${NC}"
fi

# Check 5: Backend running
echo -n "7. Checking if backend is running... "
if pgrep -f "node.*app.js" > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
  PID=$(pgrep -f "node.*app.js")
  echo "   PID: $PID"
else
  echo -e "${YELLOW}⚠ Not running${NC}"
  echo "   Start with: npm start"
fi

# Check 6: Port availability
echo -n "8. Checking port 5000... "
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${GREEN}✓ In use (backend listening)${NC}"
else
  echo -e "${YELLOW}⚠ Not in use (backend not started?)${NC}"
fi

# Check 7: Ngrok check
echo -n "9. Checking ngrok... "
if pgrep -f "ngrok" > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
  # Try to get ngrok URL
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
  if [ -n "$NGROK_URL" ]; then
    echo "   Public URL: $NGROK_URL"
    
    # Check if BACKEND_URL matches ngrok URL
    if [ "$BACKEND_URL" = "$NGROK_URL" ]; then
      echo -e "   ${GREEN}✓ BACKEND_URL matches ngrok URL${NC}"
    else
      echo -e "   ${YELLOW}⚠ BACKEND_URL doesn't match ngrok URL${NC}"
      echo "   Update .env: BACKEND_URL=$NGROK_URL"
      ERRORS=$((ERRORS+1))
    fi
  fi
else
  echo -e "${YELLOW}⚠ Not running${NC}"
  echo "   Start with: ngrok http 5000"
fi

# Check 8: Voice call route file
echo -n "10. Checking voiceCall.js file... "
if [ -f "src/routes/voiceCall.js" ]; then
  echo -e "${GREEN}✓ Found${NC}"
else
  echo -e "${RED}✗ Missing${NC}"
  ERRORS=$((ERRORS+1))
fi

# Check 9: Test endpoint (if backend running)
if pgrep -f "node.*app.js" > /dev/null; then
  echo -n "11. Testing voice-call endpoint... "
  RESPONSE=$(curl -s http://localhost:5000/api/voice-call/test 2>/dev/null)
  if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Responding${NC}"
    
    # Check if Twilio is configured in the test response
    if echo "$RESPONSE" | grep -q '"twilioConfigured":true'; then
      echo -e "    ${GREEN}✓ Twilio initialized${NC}"
    else
      echo -e "    ${YELLOW}⚠ Twilio not initialized${NC}"
      ERRORS=$((ERRORS+1))
    fi
    
    # Check if Gemini is configured
    if echo "$RESPONSE" | grep -q '"geminiConfigured":true'; then
      echo -e "    ${GREEN}✓ Gemini initialized${NC}"
    else
      echo -e "    ${YELLOW}⚠ Gemini not initialized${NC}"
      ERRORS=$((ERRORS+1))
    fi
  else
    echo -e "${RED}✗ Not responding correctly${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo "11. Testing voice-call endpoint... ${YELLOW}Skipped (backend not running)${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! System ready for testing.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Call your Twilio number: $TWILIO_PHONE"
  echo "2. You should hear: 'Namaste, main MediSaarthi hoon...'"
  echo "3. Speak your medical query in Hindi/English"
  echo "4. AI should respond within 3-5 seconds"
  echo ""
  echo "📖 For detailed testing guide, see:"
  echo "   /workspaces/MediTatva/MEDISAARTHI_VOICE_FIX_COMPLETE.md"
else
  echo -e "${RED}⚠️  Found $ERRORS issue(s) - please fix before testing${NC}"
  echo ""
  echo "Common fixes:"
  echo "1. Set BACKEND_URL in .env to your ngrok URL"
  echo "2. Start ngrok: ngrok http 5000"
  echo "3. Start backend: npm start"
  echo "4. Update Twilio webhook to: \$BACKEND_URL/api/voice-call/handle-call"
  echo ""
  echo "📖 See troubleshooting guide:"
  echo "   /workspaces/MediTatva/MEDISAARTHI_VOICE_FIX_COMPLETE.md"
fi

echo "════════════════════════════════════════════════════════════"
