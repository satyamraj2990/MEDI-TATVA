#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     MediSaarthi - Comprehensive Response Format Test                ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

NGROK_URL="https://simperingly-unconniving-derek.ngrok-free.dev"

echo "🎯 Testing comprehensive medical guidance response..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Scenario: Patient says 'Mujhe bukhar hai'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Simulate the call flow
echo "Step 1: Incoming Call - Hindi Greeting"
echo "---------------------------------------"
curl -s "$NGROK_URL/api/voice-call/handle-call" \
  -X POST \
  -d "CallSid=TEST_CALL_001&From=+919876543210&To=+18136869485&CallStatus=ringing" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  | grep -o '<Say[^>]*>Namaste[^<]*</Say>' \
  | sed 's/<[^>]*>//g'

echo ""
echo ""
echo "Step 2: User speaks - 'Mujhe bukhar hai'"
echo "----------------------------------------"
echo "Sending speech input to AI..."
echo ""

# Test with actual Gemini API call (this will show the comprehensive response)
curl -s "$NGROK_URL/api/voice-call/process-speech" \
  -X POST \
  -d "CallSid=TEST_CALL_001&SpeechResult=Mujhe bukhar hai&Confidence=0.95" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  > /tmp/response.xml

echo "✅ AI Response (Hindi TTS Output):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -o '<Say[^>]*>[^<]*</Say>' /tmp/response.xml | head -1 | sed 's/<[^>]*>//g' | fold -w 70 -s
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Expected Response Structure:"
echo "  ✓ Understanding of problem"
echo "  ✓ Possible causes"
echo "  ✓ Prevention tips (diet, lifestyle)"
echo "  ✓ Home care suggestions"
echo "  ✓ Medicine recommendations (OTC if safe)"
echo "  ✓ Dosage guidance (with disclaimer)"
echo "  ✓ Prescription requirement (India)"
echo "  ✓ When to see doctor"
echo "  ✓ Safety disclaimer"
echo ""

echo "Full TwiML Response saved to: /tmp/response.xml"
echo ""
echo "Monitor live backend logs:"
echo "  tail -f meditatva-backend/backend.log"
echo ""
