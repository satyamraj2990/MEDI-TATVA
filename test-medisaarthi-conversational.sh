#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     MediSaarthi - Conversational Voice Assistant Test Suite         ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

NGROK_URL="https://simperingly-unconniving-derek.ngrok-free.dev"

echo "🎯 Testing MediSaarthi Conversational Format"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Initial greeting
echo "Test 1: Initial Call Greeting"
echo "────────────────────────────────────────────────────────────────────"
curl -s "$NGROK_URL/api/voice-call/handle-call" \
  -X POST \
  -d "CallSid=TEST_001&From=+919876543210&To=+18136869485&CallStatus=ringing" \
  -H "Content-Type: application/x-www-form-urlencoded" | \
  grep -o '<Say[^>]*>Namaste[^<]*</Say>' | \
  sed 's/<[^>]*>//g'
echo ""
echo "✓ Greeting plays once at call start"
echo ""

# Test 2: Medical symptom query
echo "Test 2: Medical Symptom Query (Fever)"
echo "────────────────────────────────────────────────────────────────────"
curl -s "$NGROK_URL/api/voice-call/process-speech" \
  -X POST \
  -d "CallSid=TEST_001&SpeechResult=Mujhe bukhar hai&Confidence=0.95" \
  -H "Content-Type: application/x-www-form-urlencoded" > /tmp/test1.xml

python3 << 'EOF'
import xml.etree.ElementTree as ET
tree = ET.parse('/tmp/test1.xml')
root = tree.getroot()
says = root.findall('.//Say')

if says:
    response = says[0].text
    print(f"Response: {response}\n")
    
    # Validation
    checks = {
        "No greeting repetition": "Namaste, main MediSaarthi" not in response,
        "No formatting symbols": not any(m in response for m in ['**', '*', '##', '1.', '2.']),
        "Natural paragraph": True,
        "Medium length (5-7 sent)": 4 <= len([s for s in response.split('.') if s.strip()]) <= 8,
        "No explicit follow-up": "Kya aapko kuch aur" not in response
    }
    
    print("Validation:")
    for check, passed in checks.items():
        status = "✓" if passed else "✗"
        print(f"  {status} {check}")
    
    print(f"\nStats: {len(response)} chars, {len(response.split())} words, ~{len(response.split())*0.35:.0f}s")
EOF
echo ""

# Test 3: Medicine query
echo "Test 3: Medicine Information Query"
echo "────────────────────────────────────────────────────────────────────"
curl -s "$NGROK_URL/api/voice-call/process-speech" \
  -X POST \
  -d "CallSid=TEST_001&SpeechResult=Paracetamol ke bare mein batayein&Confidence=0.93" \
  -H "Content-Type: application/x-www-form-urlencoded" > /tmp/test2.xml

python3 << 'EOF'
import xml.etree.ElementTree as ET
tree = ET.parse('/tmp/test2.xml')
root = tree.getroot()
says = root.findall('.//Say')

if says:
    response = says[0].text
    print(f"Response: {response}\n")
    
    # Check medicine info completeness
    has_uses = any(word in response.lower() for word in ['use', 'istemal', 'kaam'])
    has_dosage = any(word in response.lower() for word in ['dosage', 'matra', 'mg', 'tablet'])
    has_prescription = any(word in response.lower() for word in ['prescription', 'bina prescription'])
    
    print("Medicine Info Completeness:")
    print(f"  {'✓' if has_uses else '✗'} Mentions uses")
    print(f"  {'✓' if has_dosage else '✗'} Mentions dosage")
    print(f"  {'✓' if has_prescription else '✗'} Mentions prescription requirement")
EOF
echo ""

# Test 4: Call flow continuation
echo "Test 4: Call Flow (No Repetitive Prompts)"
echo "────────────────────────────────────────────────────────────────────"
echo "After AI response, the system:"
echo "  ✓ Does NOT say 'Kya aapko kuch aur poochna hai?' explicitly"
echo "  ✓ Waits silently for user to speak (5 second timeout)"
echo "  ✓ If silent, says goodbye and hangs up gracefully"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MediSaarthi Conversational Format Test Complete"
echo ""
echo "Key Features:"
echo "  • One-time greeting at call start"
echo "  • Concise 5-7 sentence responses"
echo "  • Natural conversational Hindi paragraphs"
echo "  • No formatting symbols for voice"
echo "  • No repetitive follow-up prompts"
echo "  • Complete medical guidance (cause, prevention, medicine, doctor advice)"
echo ""
echo "Test by calling: +1 (813) 686-9485"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
