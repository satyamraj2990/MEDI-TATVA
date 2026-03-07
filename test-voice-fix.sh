#!/bin/bash

###############################################################################
# MediTatva Voice Call System - Comprehensive Test Script
# Tests all critical components after fix implementation
###############################################################################

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🎤 MEDISAARTHI VOICE CALL SYSTEM - COMPREHENSIVE TEST       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL=${BACKEND_URL:-"http://localhost:5000"}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo ""
    echo -e "${BLUE}Testing:${NC} $name"
    echo -e "${YELLOW}URL:${NC} $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" -m 10)
    
    if [ "$response" -eq "$expected_code" ]; then
        print_result 0 "$name (HTTP $response)"
        return 0
    else
        print_result 1 "$name (Expected HTTP $expected_code, got $response)"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 1: BASIC CONNECTIVITY TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Backend health check
test_endpoint "Backend Health Check" "${BACKEND_URL}/health" 200

# Test 2: Voice call test endpoint
test_endpoint "Voice Call System Status" "${BACKEND_URL}/api/voice-call/test" 200

# Test 3: API connectivity
test_endpoint "API Test Endpoint" "${BACKEND_URL}/api/test" 200

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 2: ENVIRONMENT CONFIGURATION CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Read .env file
ENV_FILE="./meditatva-backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅${NC} .env file found"
    
    # Check critical variables
    echo ""
    echo "Checking environment variables..."
    
    # BACKEND_URL
    if grep -q "^BACKEND_URL=" "$ENV_FILE"; then
        BACKEND_URL_VALUE=$(grep "^BACKEND_URL=" "$ENV_FILE" | cut -d '=' -f2)
        if [[ "$BACKEND_URL_VALUE" == *"localhost"* ]] || [[ "$BACKEND_URL_VALUE" == *"127.0.0.1"* ]]; then
            echo -e "${RED}❌${NC} BACKEND_URL is localhost: $BACKEND_URL_VALUE"
            echo -e "${YELLOW}⚠️  WARNING:${NC} Twilio webhooks will NOT work with localhost!"
            echo -e "${YELLOW}   Action:${NC} Set BACKEND_URL to your ngrok URL"
            ((TESTS_FAILED++))
        else
            echo -e "${GREEN}✅${NC} BACKEND_URL is public: $BACKEND_URL_VALUE"
            ((TESTS_PASSED++))
        fi
    else
        echo -e "${RED}❌${NC} BACKEND_URL not set in .env"
        ((TESTS_FAILED++))
    fi
    
    # TWILIO_ACCOUNT_SID
    if grep -q "^TWILIO_ACCOUNT_SID=" "$ENV_FILE"; then
        TWILIO_SID=$(grep "^TWILIO_ACCOUNT_SID=" "$ENV_FILE" | cut -d '=' -f2)
        if [[ "$TWILIO_SID" == AC* ]]; then
            echo -e "${GREEN}✅${NC} TWILIO_ACCOUNT_SID configured (${TWILIO_SID:0:10}...)"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌${NC} TWILIO_ACCOUNT_SID invalid format"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌${NC} TWILIO_ACCOUNT_SID not set"
        ((TESTS_FAILED++))
    fi
    
    # TWILIO_AUTH_TOKEN
    if grep -q "^TWILIO_AUTH_TOKEN=" "$ENV_FILE"; then
        TOKEN=$(grep "^TWILIO_AUTH_TOKEN=" "$ENV_FILE" | cut -d '=' -f2)
        if [ ${#TOKEN} -gt 20 ]; then
            echo -e "${GREEN}✅${NC} TWILIO_AUTH_TOKEN configured"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌${NC} TWILIO_AUTH_TOKEN too short or invalid"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌${NC} TWILIO_AUTH_TOKEN not set"
        ((TESTS_FAILED++))
    fi
    
    # TWILIO_PHONE_NUMBER
    if grep -q "^TWILIO_PHONE_NUMBER=" "$ENV_FILE"; then
        PHONE=$(grep "^TWILIO_PHONE_NUMBER=" "$ENV_FILE" | cut -d '=' -f2)
        if [[ "$PHONE" == +* ]]; then
            echo -e "${GREEN}✅${NC} TWILIO_PHONE_NUMBER configured: $PHONE"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌${NC} TWILIO_PHONE_NUMBER invalid format (needs + prefix)"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌${NC} TWILIO_PHONE_NUMBER not set"
        ((TESTS_FAILED++))
    fi
    
    # GEMINI_API_KEY
    if grep -q "^GEMINI_API_KEY=" "$ENV_FILE"; then
        API_KEY=$(grep "^GEMINI_API_KEY=" "$ENV_FILE" | cut -d '=' -f2)
        if [[ "$API_KEY" == AIza* ]] && [ ${#API_KEY} -gt 30 ]; then
            echo -e "${GREEN}✅${NC} GEMINI_API_KEY configured (${API_KEY:0:15}...)"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌${NC} GEMINI_API_KEY invalid or placeholder"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌${NC} GEMINI_API_KEY not set"
        ((TESTS_FAILED++))
    fi
    
else
    echo -e "${RED}❌ .env file not found at $ENV_FILE${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 3: VOICE CALL SYSTEM DETAILED CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get detailed voice call status
echo "Fetching voice call system status..."
VOICE_STATUS=$(curl -s "${BACKEND_URL}/api/voice-call/test")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅${NC} Voice call API responding"
    echo ""
    echo "Voice Call System Details:"
    echo "$VOICE_STATUS" | jq '.' 2>/dev/null || echo "$VOICE_STATUS"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌${NC} Voice call API not responding"
    ((TESTS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 4: FILE INTEGRITY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if critical files exist
VOICE_CALL_ROUTE="./meditatva-backend/src/routes/voiceCall.js"
APP_FILE="./meditatva-backend/src/app.js"

if [ -f "$VOICE_CALL_ROUTE" ]; then
    echo -e "${GREEN}✅${NC} voiceCall.js route found"
    
    # Check for critical functions
    if grep -q "router.post('/handle-call'" "$VOICE_CALL_ROUTE"; then
        echo -e "${GREEN}✅${NC} handle-call endpoint defined"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} handle-call endpoint missing"
        ((TESTS_FAILED++))
    fi
    
    if grep -q "router.post('/process-speech'" "$VOICE_CALL_ROUTE"; then
        echo -e "${GREEN}✅${NC} process-speech endpoint defined"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} process-speech endpoint missing"
        ((TESTS_FAILED++))
    fi
    
    if grep -q "getGeminiMedicalResponse" "$VOICE_CALL_ROUTE"; then
        echo -e "${GREEN}✅${NC} Gemini AI integration found"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} Gemini AI integration missing"
        ((TESTS_FAILED++))
    fi
    
else
    echo -e "${RED}❌${NC} voiceCall.js route NOT found"
    ((TESTS_FAILED++))
fi

if [ -f "$APP_FILE" ]; then
    echo -e "${GREEN}✅${NC} app.js found"
    
    # Check if voice call routes are registered
    if grep -q "voiceCallRoutes" "$APP_FILE"; then
        echo -e "${GREEN}✅${NC} Voice call routes registered in app.js"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌${NC} Voice call routes NOT registered"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌${NC} app.js NOT found"
    ((TESTS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 5: NGROK STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ngrok is running
if pgrep -x "ngrok" > /dev/null; then
    echo -e "${GREEN}✅${NC} Ngrok is running"
    
    # Try to get ngrok status
    NGROK_STATUS=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null)
    if [ $? -eq 0 ]; then
        NGROK_URL=$(echo "$NGROK_STATUS" | jq -r '.tunnels[0].public_url' 2>/dev/null)
        if [ "$NGROK_URL" != "null" ] && [ -n "$NGROK_URL" ]; then
            echo -e "${GREEN}✅${NC} Ngrok tunnel active: $NGROK_URL"
            echo ""
            echo -e "${YELLOW}⚠️  IMPORTANT:${NC} Update BACKEND_URL in .env to: $NGROK_URL"
            ((TESTS_PASSED++))
        else
            echo -e "${YELLOW}⚠️${NC} Ngrok running but no tunnel found"
        fi
    else
        echo -e "${YELLOW}⚠️${NC} Ngrok API not accessible (may need to start with --log=stdout)"
    fi
else
    echo -e "${YELLOW}⚠️${NC} Ngrok is NOT running"
    echo ""
    echo "To start ngrok:"
    echo "  ngrok http 5000"
    echo ""
    echo "Then update BACKEND_URL in .env with the ngrok URL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED / $TOTAL_TESTS) * 100}")

echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "Success Rate: ${SUCCESS_RATE}%"

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ALL TESTS PASSED - SYSTEM READY FOR VOICE CALLS      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  SOME TESTS FAILED - REVIEW ISSUES ABOVE             ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Ensure backend is running: cd meditatva-backend && npm start"
    echo "2. Start ngrok: ngrok http 5000"
    echo "3. Update BACKEND_URL in .env with ngrok URL"
    echo "4. Check Twilio credentials are correct"
    echo "5. Verify Gemini API key is valid"
    exit 1
fi
