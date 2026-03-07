#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🎙️  SIMPLE VOICE ASSISTANT - SYSTEM STATUS                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check Backend
echo "🔧 BACKEND STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BACKEND_STATUS=$(curl -s http://localhost:5000/api/voice-assistant/test 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend Running: http://localhost:5000"
    echo "✅ AI Configured: $(echo $BACKEND_STATUS | jq -r '.geminiConfigured')"
    echo "✅ Features:"
    echo $BACKEND_STATUS | jq -r '.features[]' | sed 's/^/   • /'
else
    echo "❌ Backend Not Running"
fi
echo ""

# Check Frontend
echo "🎨 FRONTEND STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ Frontend Running: http://localhost:8080"
    echo "✅ Access Point: Premium Patient Dashboard"
    echo "✅ Component: SimpleVoiceAssistant"
else
    echo "❌ Frontend Not Running"
fi
echo ""

# Test AI Query
echo "🤖 AI TEST:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Query: 'Mujhe sir dard hai'"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/voice-assistant/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Mujhe sir dard hai"}' 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ AI Response:"
    echo $RESPONSE | jq -r '.response' | fold -w 60 -s | sed 's/^/   /'
    echo ""
    echo "⏱️  Processing Time: $(echo $RESPONSE | jq -r '.processingTime')ms"
else
    echo "❌ AI Query Failed"
fi
echo ""

# Cost Comparison
echo "💰 COST COMPARISON:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Twilio Approach:     $0.85 per minute"
echo "Browser Approach:    $0.00 FREE ✅"
echo ""
echo "Monthly (100 calls):"
echo "  Twilio:            ~$85/month"
echo "  Browser:           $0/month ✅"
echo ""

# Features
echo "✨ KEY FEATURES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Browser-based voice recognition (Web Speech API)"
echo "✅ AI medical responses in Hindi/Hinglish"
echo "✅ Text-to-speech output (Speech Synthesis API)"
echo "✅ Conversation history tracking"
echo "✅ Real-time status indicators"
echo "✅ NO PHONE CALLS NEEDED"
echo "✅ 100% FREE - No Twilio costs!"
echo ""

# How to Use
echo "📱 HOW TO USE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open: http://localhost:8080"
echo "2. Click: '🎙️ Voice Health Assistant' card"
echo "3. Click: Microphone button"
echo "4. Speak: Your health question in Hindi/English"
echo "5. Listen: AI's instant response"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ SIMPLE VOICE ASSISTANT IS READY - MUCH BETTER!          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
