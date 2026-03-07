#!/bin/bash

# Voice Call System Test Script
# Tests all critical endpoints for AI Saarthi

echo "═══════════════════════════════════════════════════════"
echo "🧪 AI SAARTHI VOICE CALL SYSTEM TEST"
echo "═══════════════════════════════════════════════════════"
echo ""

BACKEND_URL="http://localhost:5000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=$3
    local data=$4
    
    echo -n "Testing: $name ... "
    
    if [ "$method" == "POST" ]; then
        response=$(curl -s -X POST \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "$data" \
            "$BACKEND_URL$endpoint")
    else
        response=$(curl -s "$BACKEND_URL$endpoint")
    fi
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Backend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s http://localhost:5000/health)
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Backend not responding${NC}"
    ((FAILED++))
fi
echo ""

# Test 2: Handle Call Endpoint (TwiML test)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Handle Call Webhook (TwiML Generation)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "CallSid=TEST123&From=+1234567890&To=+18136869485&CallStatus=ringing" \
    http://localhost:5000/api/voice-call/handle-call)

if echo "$response" | grep -q "<Response>" && echo "$response" | grep -q "<Gather>"; then
    echo -e "${GREEN}✅ Valid TwiML generated${NC}"
    echo "   Sample: $(echo "$response" | head -c 100)..."
    ((PASSED++))
else
    echo -e "${RED}❌ Invalid TwiML response${NC}"
    echo "   Response: $response"
    ((FAILED++))
fi
echo ""

# Test 3: Process Speech with Sample Input
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Process Speech Webhook (AI Integration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Testing with: 'I have a headache'"
response=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "CallSid=TEST456" \
    --data-urlencode "SpeechResult=I have a headache" \
    --data-urlencode "Confidence=0.95" \
    http://localhost:5000/api/voice-call/process-speech \
    --max-time 15)

if echo "$response" | grep -q "<Response>" && echo "$response" | grep -q "<Say>"; then
    echo -e "${GREEN}✅ AI response generated successfully${NC}"
    # Extract the Say content for display
    say_content=$(echo "$response" | grep -oP '(?<=<Say[^>]*>).*?(?=</Say>)' | head -1)
    echo "   AI Said: ${YELLOW}${say_content:0:100}...${NC}"
    
    # Check if it asks a follow-up question
    if echo "$response" | grep -q "<Gather>"; then
        echo -e "${GREEN}   ✅ Conversation loop enabled (Gather present)${NC}"
    else
        echo -e "${YELLOW}   ⚠️  No Gather tag - may not continue conversation${NC}"
    fi
    ((PASSED++))
else
    echo -e "${RED}❌ Failed to generate AI response${NC}"
    echo "   Response: $(echo "$response" | head -c 200)"
    ((FAILED++))
fi
echo ""

# Test 4: Emergency Detection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Emergency Detection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Testing with: 'I have chest pain'"
response=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "CallSid=TEST789" \
    --data-urlencode "SpeechResult=I have chest pain" \
    --data-urlencode "Confidence=0.95" \
    http://localhost:5000/api/voice-call/process-speech)

if echo "$response" | grep -q "102"; then
    echo -e "${GREEN}✅ Emergency detected - instructs to call 102${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Emergency not properly detected${NC}"
    ((FAILED++))
fi

if echo "$response" | grep -q "<Hangup/>"; then
    echo -e "${GREEN}   ✅ Call properly terminated after emergency${NC}"
else
    echo -e "${YELLOW}   ⚠️  Call may not end after emergency${NC}"
fi
echo ""

# Test 5: Low Confidence Handling
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Low Confidence Speech Handling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Testing with confidence: 0.2"
response=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "CallSid=TEST999" \
    --data-urlencode "SpeechResult=mumble" \
    --data-urlencode "Confidence=0.2" \
    http://localhost:5000/api/voice-call/process-speech)

if echo "$response" | grep -qi "repeat\|clearly\|understand"; then
    echo -e "${GREEN}✅ Low confidence handled - asks user to repeat${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Low confidence not properly handled${NC}"
    ((FAILED++))
fi
echo ""

# Test 6: Call Status Callback
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Call Status Callback (Session Cleanup)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "CallSid=TEST123&CallStatus=completed&CallDuration=45&From=+1234567890&To=+18136869485" \
    -o /dev/null -w "%{http_code}" \
    http://localhost:5000/api/voice-call/call-status)

if [ "$response" == "200" ]; then
    echo -e "${GREEN}✅ Call status webhook responding${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Call status webhook failed (HTTP $response)${NC}"
    ((FAILED++))
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo "🏁 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Make a test call to: +18136869485"
    echo "2. Monitor logs: tail -f meditatva-backend/backend.log"
    echo "3. Verify Twilio webhook URLs are configured"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - REVIEW LOGS${NC}"
    echo ""
    echo "Debug Steps:"
    echo "1. Check backend logs: tail -f meditatva-backend/backend.log"
    echo "2. Verify environment variables in .env"
    echo "3. Confirm Gemini API key is valid"
    exit 1
fi
