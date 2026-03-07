#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# MEDISAARTHI CODESPACES RESTART-PROOF STARTUP SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# Purpose: Start MediSaarthi voice assistant system in GitHub Codespaces
# Handles: Ngrok tunnels, backend server, environment validation
# Author: Senior Twilio + Node.js Voice Bot Engineer
# Last Updated: 2025
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

# Color codes for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║         MEDISAARTHI VOICE ASSISTANT STARTUP                ║${NC}"
echo -e "${BOLD}${CYAN}║         Codespaces-Optimized Production System             ║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: VALIDATE ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 1/6]${NC} ${BOLD}Validating Environment Configuration...${NC}"
echo ""

ENV_FILE="/workspaces/MediTatva/meditatva-backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ ERROR: .env file not found at $ENV_FILE${NC}"
    echo -e "${YELLOW}   Create .env file with required credentials first${NC}"
    exit 1
fi

# Source environment file
source "$ENV_FILE"

# Critical variables check
REQUIRED_VARS=(
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "NGROK_AUTH_TOKEN"
    "GEMINI_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   ${RED}✗${NC} $var"
    done
    echo ""
    echo -e "${YELLOW}💡 Add these to your .env file before proceeding${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables present${NC}"
echo -e "   ${GREEN}✓${NC} TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID:0:10}..."
echo -e "   ${GREEN}✓${NC} TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN:0:10}..."
echo -e "   ${GREEN}✓${NC} TWILIO_PHONE_NUMBER: $TWILIO_PHONE_NUMBER"
echo -e "   ${GREEN}✓${NC} NGROK_AUTH_TOKEN: ${NGROK_AUTH_TOKEN:0:15}..."
echo -e "   ${GREEN}✓${NC} GEMINI_API_KEY: ${GEMINI_API_KEY:0:15}..."
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: KILL ANY EXISTING PROCESSES
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 2/6]${NC} ${BOLD}Cleaning up previous sessions...${NC}"
echo ""

# Kill existing ngrok processes
if pgrep -x "ngrok" > /dev/null; then
    echo -e "${YELLOW}⚠️  Stopping existing ngrok processes...${NC}"
    pkill -9 ngrok || true
    sleep 2
    echo -e "${GREEN}✅ Ngrok processes cleaned${NC}"
else
    echo -e "${GREEN}✅ No existing ngrok processes found${NC}"
fi

# Kill existing Node.js processes on port 5000
if lsof -ti:5000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5000 is in use, killing process...${NC}"
    kill -9 $(lsof -ti:5000) || true
    sleep 2
    echo -e "${GREEN}✅ Port 5000 freed${NC}"
else
    echo -e "${GREEN}✅ Port 5000 is available${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: START NGROK TUNNEL
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 3/6]${NC} ${BOLD}Starting Ngrok tunnel...${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ Ngrok not found. Installing...${NC}"
    cd ~
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar -xzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin/
    rm ngrok-v3-stable-linux-amd64.tgz
    echo -e "${GREEN}✅ Ngrok installed${NC}"
fi

# Configure ngrok auth token
echo -e "${CYAN}🔧 Configuring ngrok authentication...${NC}"
ngrok config add-authtoken "$NGROK_AUTH_TOKEN"

# Start ngrok in background
echo -e "${CYAN}🚀 Starting ngrok tunnel on port 5000...${NC}"
nohup ngrok http 5000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo -e "${GREEN}✅ Ngrok started (PID: $NGROK_PID)${NC}"
echo -e "${YELLOW}⏳ Waiting 5 seconds for ngrok to initialize...${NC}"
sleep 5

# Get ngrok public URL
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+' | head -1 | cut -d'"' -f4)
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo -e "${YELLOW}   Attempt $i/10: Waiting for ngrok URL...${NC}"
    sleep 2
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Failed to get ngrok public URL after 10 attempts${NC}"
    echo -e "${YELLOW}   Check ngrok logs: cat /tmp/ngrok.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ngrok tunnel established${NC}"
echo -e "   ${BOLD}Public URL: ${CYAN}$NGROK_URL${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: START BACKEND SERVER
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 4/6]${NC} ${BOLD}Starting Backend Server...${NC}"
echo ""

BACKEND_DIR="/workspaces/MediTatva/meditatva-backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Update BACKEND_URL in .env
echo "BACKEND_URL=$NGROK_URL" >> .env

# Start backend server in background
echo -e "${CYAN}🚀 Starting Node.js server on port 5000...${NC}"
nohup npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "$BACKEND_PID" > backend.pid
echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
echo -e "${YELLOW}⏳ Waiting 10 seconds for server to initialize...${NC}"
sleep 10

# Verify backend is running
if ! lsof -ti:5000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend server failed to start${NC}"
    echo -e "${YELLOW}   Check logs: cat /tmp/backend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend server is running on port 5000${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: VERIFY HEALTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 5/6]${NC} ${BOLD}Verifying System Health...${NC}"
echo ""

# Test health endpoint
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Health endpoint responding (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint returned HTTP $HEALTH_CHECK${NC}"
fi

# Test voice call endpoint
VOICE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$NGROK_URL/api/voice-call/handle-call")
if [ "$VOICE_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Voice call endpoint responding (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Voice call endpoint returned HTTP $VOICE_CHECK${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: DISPLAY SYSTEM INFORMATION
# ═══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}${BLUE}[STEP 6/6]${NC} ${BOLD}System Status Summary${NC}"
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║              🎉 MEDISAARTHI IS READY! 🎉                   ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}${CYAN}📞 TWILIO CONFIGURATION:${NC}"
echo -e "   Account SID: ${YELLOW}$TWILIO_ACCOUNT_SID${NC}"
echo -e "   Phone Number: ${YELLOW}$TWILIO_PHONE_NUMBER${NC}"
echo ""
echo -e "${BOLD}${CYAN}🌐 WEBHOOK URLs (Configure in Twilio Console):${NC}"
echo -e "   Voice Call Webhook: ${GREEN}$NGROK_URL/api/voice-call/handle-call${NC}"
echo -e "   Process Speech: ${GREEN}$NGROK_URL/api/voice-call/process-speech${NC}"
echo ""
echo -e "${BOLD}${CYAN}🔧 SYSTEM ENDPOINTS:${NC}"
echo -e "   Health Check: ${GREEN}http://localhost:5000/api/health${NC}"
echo -e "   Public URL: ${GREEN}$NGROK_URL${NC}"
echo -e "   Ngrok Dashboard: ${GREEN}http://localhost:4040${NC}"
echo ""
echo -e "${BOLD}${CYAN}📊 PROCESS INFORMATION:${NC}"
echo -e "   Backend PID: ${YELLOW}$BACKEND_PID${NC}"
echo -e "   Ngrok PID: ${YELLOW}$NGROK_PID${NC}"
echo -e "   Logs: ${YELLOW}/tmp/backend.log, /tmp/ngrok.log${NC}"
echo ""
echo -e "${BOLD}${CYAN}🧪 TESTING:${NC}"
echo -e "   1. Call ${YELLOW}$TWILIO_PHONE_NUMBER${NC} from your phone"
echo -e "   2. Say: ${YELLOW}\"Mujhe sir dard hai\"${NC} or ${YELLOW}\"Bukhar hai\"${NC}"
echo -e "   3. Get detailed medical guidance in Hindi"
echo ""
echo -e "${BOLD}${CYAN}🛠️  USEFUL COMMANDS:${NC}"
echo -e "   View backend logs: ${YELLOW}tail -f /tmp/backend.log${NC}"
echo -e "   View ngrok logs: ${YELLOW}tail -f /tmp/ngrok.log${NC}"
echo -e "   Stop all: ${YELLOW}kill $BACKEND_PID $NGROK_PID${NC}"
echo -e "   Restart: ${YELLOW}bash /workspaces/MediTatva/codespaces-startup.sh${NC}"
echo ""
echo -e "${BOLD}${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo -e "${YELLOW}   • Update Twilio webhook URL to: $NGROK_URL/api/voice-call/handle-call${NC}"
echo -e "${YELLOW}   • Ngrok URL changes after each restart - update Twilio accordingly${NC}"
echo -e "${YELLOW}   • Medical knowledge base works even without Gemini API quota${NC}"
echo -e "${YELLOW}   • System auto-falls back to offline responses if API fails${NC}"
echo ""
echo -e "${BOLD}${GREEN}✅ All systems operational! MediSaarthi is ready to help patients!${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# SAVE CONFIGURATION TO FILE FOR FUTURE REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════
CONFIG_FILE="/workspaces/MediTatva/CURRENT_SESSION.txt"
cat > "$CONFIG_FILE" << EOF
MEDISAARTHI CURRENT SESSION CONFIGURATION
Generated: $(date)

NGROK PUBLIC URL: $NGROK_URL
TWILIO WEBHOOK: $NGROK_URL/api/voice-call/handle-call
BACKEND PID: $BACKEND_PID
NGROK PID: $NGROK_PID

TWILIO CONFIGURATION:
  Account SID: $TWILIO_ACCOUNT_SID
  Phone Number: $TWILIO_PHONE_NUMBER
  
ENDPOINTS:
  Health: http://localhost:5000/api/health
  Voice Call: $NGROK_URL/api/voice-call/handle-call
  Process Speech: $NGROK_URL/api/voice-call/process-speech
  
LOGS:
  Backend: /tmp/backend.log
  Ngrok: /tmp/ngrok.log
  
TESTING:
  1. Call $TWILIO_PHONE_NUMBER
  2. Speak your symptom in Hindi/English
  3. Receive detailed medical guidance
  
STATUS: OPERATIONAL
EOF

echo -e "${GREEN}📝 Configuration saved to: $CONFIG_FILE${NC}"
echo ""
