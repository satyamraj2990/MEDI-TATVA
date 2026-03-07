#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# MediSaarthi Voice Call Debugging - Production-Level Diagnostics
# ═══════════════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 MEDISAARTHI VOICE SYSTEM - PRODUCTION DEBUGGER          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f "./meditatva-backend/.env" ]; then
    export $(grep -v '^#' ./meditatva-backend/.env | xargs)
fi

BACKEND_URL=${BACKEND_URL:-"http://localhost:5000"}

echo "🔍 System Diagnostic Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Backend Process Check
echo "1️⃣  Backend Process Status"
if pgrep -f "node.*app.js" > /dev/null; then
    PID=$(pgrep -f "node.*app.js")
    echo "   ✅ Backend running (PID: $PID)"
    echo "   📊 Memory: $(ps -p $PID -o rss= | awk '{print int($1/1024)"MB"}')"
    echo "   ⏱️  Uptime: $(ps -p $PID -o etime=)"
else
    echo "   ❌ Backend NOT running!"
    echo "   💡 Start with: cd meditatva-backend && npm start"
fi
echo ""

# 2. Network Connectivity
echo "2️⃣  Network & URL Configuration"
echo "   Backend URL: $BACKEND_URL"

if [[ "$BACKEND_URL" =~ "localhost" ]] || [[ "$BACKEND_URL" =~ "127.0.0.1" ]]; then
    echo "   ⚠️  WARNING: Using localhost - Twilio webhooks will FAIL!"
    echo "   💡 Set BACKEND_URL to your Ngrok URL in .env"
else
    echo "   ✅ Using public URL (Twilio compatible)"
    
    # Test URL accessibility
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${BACKEND_URL}/health")
    if [ "$HTTP_CODE" == "200" ]; then
        echo "   ✅ URL is accessible (HTTP $HTTP_CODE)"
    else
        echo "   ❌ URL not accessible (HTTP $HTTP_CODE)"
        echo "   💡 Check if Ngrok is running"
    fi
fi
echo ""

# 3. Twilio Webhooks
echo "3️⃣  Twilio Webhook Endpoints"
HANDLE_CALL="$BACKEND_URL/api/voice-call/handle-call"
PROCESS_SPEECH="$BACKEND_URL/api/voice-call/process-speech"

echo "   📍 Handle Call:    $HANDLE_CALL"
echo "   📍 Process Speech: $PROCESS_SPEECH"
echo ""

# Test handle-call webhook
echo "   🧪 Testing handle-call webhook..."
RESPONSE=$(curl -s -X POST "$HANDLE_CALL" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "CallSid=TEST_$(date +%s)" \
    -d "From=+1234567890" \
    -d "To=$TWILIO_PHONE_NUMBER" \
    -d "CallStatus=ringing" \
    -w "\n__HTTP_CODE__%{http_code}__")

HTTP_CODE=$(echo "$RESPONSE" | grep -o '__HTTP_CODE__[0-9]*__' | grep -o '[0-9]*')
TWIML=$(echo "$RESPONSE" | sed 's/__HTTP_CODE__[0-9]*__//')

if [ "$HTTP_CODE" == "200" ] && echo "$TWIML" | grep -q "<Response>"; then
    echo "   ✅ Webhook returns valid TwiML"
    if echo "$TWIML" | grep -q "<Gather"; then
        echo "   ✅ <Gather> verb present (speech input enabled)"
    fi
    if echo "$TWIML" | grep -q "Namaste"; then
        echo "   ✅ Greeting message found"
    fi
else
    echo "   ❌ Webhook failed (HTTP $HTTP_CODE)"
    echo "   Response: $TWIML"
fi
echo ""

# 4. Gemini AI Configuration
echo "4️⃣  Gemini AI Service"
if [ -z "$GEMINI_API_KEY" ]; then
    echo "   ❌ GEMINI_API_KEY not configured"
else
    echo "   ✅ API Key configured: ${GEMINI_API_KEY:0:20}...${GEMINI_API_KEY: -8}"
    
    # Quick API test
    echo "   🧪 Testing Gemini API..."
    AI_RESPONSE=$(curl -s -X POST \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
        -H 'Content-Type: application/json' \
        -d '{"contents":[{"parts":[{"text":"Respond with just: OK"}]}]}' \
        --max-time 5)
    
    if echo "$AI_RESPONSE" | grep -q "OK"; then
        echo "   ✅ Gemini API responding correctly"
    elif echo "$AI_RESPONSE" | grep -q "error"; then
        echo "   ❌ Gemini API error: $(echo "$AI_RESPONSE" | grep -o '"message":"[^"]*"')"
    else
        echo "   ⚠️  Unexpected Gemini response"
    fi
fi
echo ""

# 5. Twilio Configuration
echo "5️⃣  Twilio Configuration"
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ]; then
    echo "   ❌ Twilio credentials missing"
else
    echo "   ✅ Account SID: ${TWILIO_ACCOUNT_SID:0:15}..."
    echo "   ✅ Auth Token: ${TWILIO_AUTH_TOKEN:0:10}...${TWILIO_AUTH_TOKEN: -5}"
    echo "   ✅ Phone: $TWILIO_PHONE_NUMBER"
fi
echo ""

# 6. Recent Logs Analysis
echo "6️⃣  Recent Activity Logs"
if [ -f "./meditatva-backend/backend.log" ]; then
    echo "   📄 Last 10 log entries:"
    tail -10 ./meditatva-backend/backend.log | sed 's/^/      /'
else
    echo "   ⚠️  No log file found"
fi
echo ""

# 7. Common Issues Detection
echo "7️⃣  Common Issues Check"
ISSUES_FOUND=0

if [[ "$BACKEND_URL" =~ "localhost" ]]; then
    echo "   ❌ Issue: Backend URL is localhost"
    echo "      Fix: Set BACKEND_URL=https://your-ngrok-url.ngrok-free.app in .env"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "   ❌ Issue: Gemini API key missing"
    echo "      Fix: Add GEMINI_API_KEY to .env file"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! pgrep -f "node.*app.js" > /dev/null; then
    echo "   ❌ Issue: Backend not running"
    echo "      Fix: cd meditatva-backend && npm start"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "   ✅ No critical issues detected"
fi
echo ""

# 8. Action Items
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📋 RECOMMENDED ACTIONS                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
if [ $ISSUES_FOUND -gt 0 ]; then
    echo "⚠️  $ISSUES_FOUND issue(s) found - fix them before making calls"
else
    echo "✅ System is ready for voice calls!"
    echo ""
    echo "📞 To make a test call:"
    echo "   curl -X POST $BACKEND_URL/api/voice-call/initiate-call \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"phoneNumber\": \"+91XXXXXXXXXX\", \"patientName\": \"Test\"}'"
fi
echo ""
echo "📊 Monitor logs: tail -f ./meditatva-backend/backend.log"
echo "🔄 Restart backend: pkill -f 'node.*app.js' && cd meditatva-backend && nohup npm start &"
echo ""
