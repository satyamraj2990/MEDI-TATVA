const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const geminiApiKey = process.env.GEMINI_API_KEY;

// Initialize Twilio client with validation
let client = null;
if (accountSid && accountSid.startsWith('AC') && authToken) {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized');
} else {
  console.error('❌ Twilio credentials missing or invalid');
}
const VoiceResponse = twilio.twiml.VoiceResponse;

// Store active call sessions with conversation state
const callSessions = new Map();

// Session cleanup - remove old sessions after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [callSid, session] of callSessions.entries()) {
    if (session.startTime.getTime() < oneHourAgo) {
      console.log(`🧹 Cleaning up old session: ${callSid}`);
      callSessions.delete(callSid);
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes

// ════════════════════════════════════════════════════════════════════
// INITIATE OUTBOUND CALL
// ════════════════════════════════════════════════════════════════════
router.post('/initiate-call', async (req, res) => {
  try {
    const { phoneNumber, patientName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!client) {
      return res.status(500).json({ 
        error: 'Twilio not configured',
        message: 'Twilio client is not initialized. Check your credentials.' 
      });
    }

    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Validate public URL for Twilio
    if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
      return res.status(400).json({ 
        error: 'Public URL required', 
        message: 'Twilio requires a public URL. Please set BACKEND_URL to your ngrok URL.',
        currentUrl: backendUrl,
        instructions: 'Set BACKEND_URL=https://your-ngrok-url.ngrok-free.dev in .env file'
      });
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📞 INITIATING OUTBOUND CALL                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📱 To: ${phoneNumber}`);
    console.log(`👤 Patient: ${patientName || 'Unknown'}`);
    console.log(`🌐 Webhook: ${backendUrl}/api/voice-call/handle-call`);
    console.log(`📞 From: ${twilioPhoneNumber}\n`);

    const call = await client.calls.create({
      url: `${backendUrl}/api/voice-call/handle-call`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${backendUrl}/api/voice-call/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      timeout: 60,
      method: 'POST'
    });

    // Initialize session
    callSessions.set(call.sid, {
      patientName: patientName || 'Patient',
      conversationHistory: [],
      startTime: new Date(),
      turnCount: 0,
      symptomsCollected: {
        symptoms: [],
        duration: null,
        severity: null
      }
    });

    console.log(`✅ Call initiated successfully`);
    console.log(`📋 Call SID: ${call.sid}`);
    console.log(`📊 Status: ${call.status}\n`);

    res.json({ 
      success: true, 
      callSid: call.sid,
      status: call.status,
      message: 'Call initiated. You will receive a call shortly.'
    });

  } catch (error) {
    console.error('\n❌❌❌ CALL INITIATION FAILED ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Twilio-specific error handling
    let errorMessage = 'Failed to initiate call';
    let errorType = 'unknown';
    
    if (error.code === 21608) {
      errorType = 'unverified_number';
      errorMessage = 'Phone number not verified (Twilio trial limitation)';
    } else if (error.code === 21211 || error.code === 21212) {
      errorType = 'invalid_number';
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 21201) {
      errorType = 'invalid_number';
      errorMessage = 'Invalid phone number';
    } else if (error.message?.includes('not valid')) {
      errorType = 'invalid_number';
      errorMessage = 'Invalid phone number';
    }
    
    res.status(400).json({ 
      success: false,
      error: errorMessage,
      errorType: errorType,
      twilioCode: error.code || null,
      details: error.message
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// HANDLE INCOMING CALL (TWILIO WEBHOOK) - CRITICAL ENTRY POINT
// ════════════════════════════════════════════════════════════════════
router.post('/handle-call', async (req, res) => {
  const requestStartTime = Date.now();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎤 INCOMING CALL - HANDLE-CALL WEBHOOK                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📋 CallSid: ${req.body.CallSid}`);
    console.log(`📞 From: ${req.body.From} → To: ${req.body.To}`);
    console.log(`📊 Status: ${req.body.CallStatus}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`🔍 Full payload:`, JSON.stringify(req.body, null, 2));
    
    const callSid = req.body.CallSid;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Initialize or get session
    if (!callSessions.has(callSid)) {
      callSessions.set(callSid, {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0,
        symptomsCollected: {
          symptoms: [],
          duration: null,
          severity: null
        }
      });
      console.log('✅ New session created');
    }
    
    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // Initial greeting with speech input (NO RECORD to prevent echo)
    const gather = twiml.gather({
      input: 'speech',
      action: `${backendUrl}/api/voice-call/process-speech`,
      method: 'POST',
      timeout: 5,
      speechTimeout: '3',
      language: 'hi-IN',
      profanityFilter: false,
      speechModel: 'phone_call',
      enhanced: true,
      hints: 'bukhar,sar dard,pet dard,khansi,thanda,dard,dawai,doctor,symptoms,diabetes,blood pressure'
    });

    gather.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Namaste, main MediSaarthi hoon, aapki personal health assistant. Main aapki medical problems ko samajhne aur guidance dene mein madad karungi. Kripya batayein, aapko kya health problem hai?'
    );

    // Fallback if no speech  
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Mujhe kuch sunayi nahi diya. Kripya phir se bolein.'
    );
    twiml.redirect(`${backendUrl}/api/voice-call/handle-call`);

    const processingTime = Date.now() - requestStartTime;
    console.log(`📤 Sending TwiML response (${processingTime}ms)`);
    console.log(`📄 TwiML (${twiml.toString().length} bytes):`, twiml.toString().substring(0, 200) + '...');
    
    res.type('text/xml');
    res.send(twiml.toString());
    
    console.log('✅ TwiML response sent successfully\n');
    
  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR IN HANDLE-CALL ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // EMERGENCY FALLBACK - ALWAYS return valid TwiML
    try {
      const emergencyTwiml = new VoiceResponse();
      emergencyTwiml.say(
        { voice: 'Polly.Aditi', language: 'en-IN' },
        'Sorry, I am facing a temporary technical issue. Please try calling again in a few moments.'
      );
      emergencyTwiml.hangup();
      
      res.type('text/xml');
      res.send(emergencyTwiml.toString());
      console.log('📤 Emergency fallback TwiML sent');
    } catch (fallbackError) {
      console.error('❌ Even emergency fallback failed:', fallbackError.message);
      // Last resort - minimal valid XML
      res.type('text/xml');
      res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error</Say><Hangup/></Response>');
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// PROCESS SPEECH INPUT - HEART OF THE AI CONVERSATION
// ════════════════════════════════════════════════════════════════════
router.post('/process-speech', async (req, res) => {
  const requestStartTime = Date.now();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🗣️  PROCESSING SPEECH INPUT                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const speechResult = req.body.SpeechResult;
    const callSid = req.body.CallSid;
    const confidence = parseFloat(req.body.Confidence || 0);
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    console.log(`📱 CallSid: ${callSid}`);
    console.log(`🎯 Speech: "${speechResult}"`);
    console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // ═══ VALIDATION: Empty Speech ═══
    if (!speechResult || speechResult.trim() === '') {
      console.warn('⚠️  Empty speech result');
      const twiml = new VoiceResponse();
      const gather = twiml.gather({
        input: 'speech',
        action: `${backendUrl}/api/voice-call/process-speech`,
        method: 'POST',
        timeout: 5,
        speechTimeout: '3',
        language: 'hi-IN',
        profanityFilter: false,
        speechModel: 'phone_call',
        enhanced: true
      });
      
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe aapki baat sunai nahi di. Kripya thoda zor se bolein. Aapki kya health problem hai?'
      );
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // ═══ VALIDATION: Low Confidence ═══
    if (confidence < 0.35) {
      console.warn(`⚠️  Low confidence (${(confidence * 100).toFixed(1)}%)`);
      const twiml = new VoiceResponse();
      const gather = twiml.gather({
        input: 'speech',
        action: `${backendUrl}/api/voice-call/process-speech`,
        method: 'POST',
        timeout: 5,
        speechTimeout: '3',
        language: 'hi-IN',
        profanityFilter: false,
        speechModel: 'phone_call',
        enhanced: true
      });
      
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe aapki baat samajh nahi aayi. Kripya dhire dhire aur saaf bolein.'
      );
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // ═══ GET OR CREATE SESSION ═══
    let session = callSessions.get(callSid);
    if (!session) {
      console.warn('⚠️  Session not found, creating new one');
      session = {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0,
        symptomsCollected: {
          symptoms: [],
          duration: null,
          severity: null
        }
      };
      callSessions.set(callSid, session);
    }
    
    session.turnCount = (session.turnCount || 0) + 1;
    console.log(`📈 Conversation turn: ${session.turnCount}`);

    // ═══ EMERGENCY DETECTION ═══
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'cant breathe', 'cannot breathe',
      'suicide', 'heavy bleeding', 'unconscious', 'behosh', 'dil ka dor', 
      'sans nahi aa rahi', 'khoon bah raha', 'chakkar aa rahe'
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      console.log('🚨🚨🚨 EMERGENCY DETECTED 🚨🚨🚨');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Yeh emergency situation hai! Kripya turant 102 par ambulance bulayein ya najdeeki hospital jaayein. Bilkul deri mat karein. Main aapke liye pray karti hoon.'
      );
      twiml.hangup();
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // ═══ GOODBYE DETECTION ═══
    const goodbyeKeywords = ['bye', 'goodbye', 'thank you', 'thanks', 'dhanyavaad', 'shukriya', 'alvida', 'thik hai bas'];
    const wantsToEnd = goodbyeKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    ) && speechResult.split(' ').length <= 4; // Short goodbye phrases only

    if (wantsToEnd) {
      console.log('👋 User saying goodbye');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Dhanyavaad MediSaarthi use karne ke liye. Apna aur apne family ka khayal rakhein. Agar zaroorat pade toh doctor se zaroor milein. Swasth rahein, namaste!'
      );
      twiml.hangup();
      
      // Clean up session
      callSessions.delete(callSid);
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // ═══ ADD USER MESSAGE TO HISTORY ═══
    session.conversationHistory.push({
      role: 'user',
      content: speechResult,
      timestamp: new Date()
    });
    
    console.log(`📝 Added to history (${session.conversationHistory.length} messages total)`);

    // ═══ GET AI RESPONSE WITH TIMEOUT PROTECTION ═══
    console.log('🤖 Requesting AI response...');
    let aiResponse;
    
    try {
      const aiStartTime = Date.now();
      
      // Set 12 second timeout for Gemini (Twilio webhook timeout is 15s)
      const responsePromise = getGeminiMedicalResponse(
        speechResult, 
        session.conversationHistory,
        session.symptomsCollected,
        session.turnCount
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI response timeout')), 12000)
      );
      
      aiResponse = await Promise.race([responsePromise, timeoutPromise]);
      
      const aiTime = Date.now() - aiStartTime;
      console.log(`✅ AI response received in ${aiTime}ms`);
      console.log(`📝 Response (${aiResponse.length} chars):`, aiResponse);
      
    } catch (aiError) {
      console.error('❌ AI Response Error:', aiError.message);
      
      // Intelligent fallback based on conversation turn
      if (session.turnCount === 1) {
        aiResponse = 'Mujhe maaf karein, response aane mein time lag raha hai. Kripya apni main health problem batayein. Jaise bukhar, dard, ya koi aur symptom?';
      } else {
        aiResponse = 'Technical problem ho rahi hai. Kripya apna question short rakhein. Main kya specific help kar sakti hoon?';
      }
      
      console.log('📝 Using fallback response:', aiResponse);
    }

    // ═══ ADD AI RESPONSE TO HISTORY ═══
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Update session
    callSessions.set(callSid, session);
    console.log('💾 Session updated');

    // ═══ CREATE TwiML RESPONSE - CONTINUOUS CONVERSATION LOOP ═══
    const twiml = new VoiceResponse();
    
    // Speak AI response
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      aiResponse
    );
    
    // Brief pause for natural flow
    twiml.pause({ length: 1 });
    
    // CRITICAL: Continue listening for follow-up (NO RECORD to prevent echo)
    const gather = twiml.gather({
      input: 'speech',
      action: `${backendUrl}/api/voice-call/process-speech`,
      method: 'POST',
      timeout: 5,
      speechTimeout: '3',
      language: 'hi-IN',
      profanityFilter: false,
      speechModel: 'phone_call',
      enhanced: true,
      hints: 'haan,nahi,bukhar,sar dard,dard,dawai,doctor,symptoms,khansi,pet dard,ulti,chakkar,kamzori,diabetes,blood pressure,dhanyavaad,alvida'
    });

    // Let user speak naturally without prompting after every response
    
    // Fallback only after timeout - graceful ending
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Koi aur sawal nahi? Theek hai. Dhanyavaad MediSaarthi use karne ke liye. Apna khayal rakhein. Namaste!'
    );
    twiml.hangup();

    const totalTime = Date.now() - requestStartTime;
    console.log(`📤 Sending TwiML response (total: ${totalTime}ms)`);
    console.log(`📄 TwiML length: ${twiml.toString().length} bytes\n`);
    
    res.type('text/xml');
    res.send(twiml.toString());
    
    console.log('✅ Response sent successfully\n');

  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR IN PROCESS-SPEECH ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // EMERGENCY FALLBACK - Always return valid TwiML
    try {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const twiml = new VoiceResponse();
      
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe maaf karein, mujhe technical problem aa rahi hai. Kripya thodi der baad dobara call karein ya doctor se consult karein.'
      );
      
      twiml.pause({ length: 1 });
      twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Apna khayal rakhein. Dhanyavaad.');
      twiml.hangup();
      
     res.type('text/xml');
      res.send(twiml.toString());
      
      console.log('📤 Emergency fallback sent\n');
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      res.type('text/xml');
      res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN">System error</Say><Hangup/></Response>');
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// CALL STATUS CALLBACK
// ════════════════════════════════════════════════════════════════════
router.post('/call-status', (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, From, To } = req.body;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📞 CALL STATUS UPDATE                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📱 CallSid: ${CallSid}`);
    console.log(`📊 Status: ${CallStatus}`);
    console.log(`⏱️  Duration: ${CallDuration || 0} seconds`);
    console.log(`📞 From: ${From} → To: ${To}\n`);

    // Cleanup on call end
    const endStatuses = ['completed', 'failed', 'busy', 'no-answer', 'canceled'];
    if (endStatuses.includes(CallStatus) && callSessions.has(CallSid)) {
      const session = callSessions.get(CallSid);
      console.log(`🗑️  Cleaning up session:`);
      console.log(`   - Turns: ${session.turnCount || 0}`);
      console.log(`   - Messages: ${session.conversationHistory?.length || 0}`);
      callSessions.delete(CallSid);
      console.log('✅ Session cleaned\n');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error in call-status:', error.message);
    res.sendStatus(200); // Still acknowledge to Twilio
  }
});

// ════════════════════════════════════════════════════════════════════
// TEST ENDPOINT - Verify voice call system is working
// ════════════════════════════════════════════════════════════════════
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Voice call system is operational',
    twilioConfigured: !!client,
    geminiConfigured: !!geminiApiKey && geminiApiKey !== 'your_key_here',
    backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
    activeSessions: callSessions.size,
    timestamp: new Date().toISOString()
  });
});

// ════════════════════════════════════════════════════════════════════
// AI RESPONSE GENERATOR - GEMINI API WITH PROACTIVE MEDICAL QUESTIONING
// ════════════════════════════════════════════════════════════════════
async function getGeminiMedicalResponse(userMessage, conversationHistory = [], symptomsCollected = {}, turnCount = 0) {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 GEMINI AI REQUEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 User message:', userMessage);
  console.log('📚 History length:', conversationHistory.length);
  console.log('🔢 Turn count:', turnCount);
  
  try {
    // Validate API key
    if (!geminiApiKey || geminiApiKey === 'your_key_here') {
      throw new Error('Gemini API key not configured');
    }
    
    // Build conversation context (last 4 messages only for speed)
    let contextText = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4);
      contextText = '\n\nPREVIOUS CONVERSATION:\n' + recentHistory.map(msg => {
        const role = msg.role === 'user' ? 'Patient' : 'MediSaarthi';
        return `${role}: ${msg.content}`;
      }).join('\n');
    }
    
    // Dynamic system prompt based on conversation stage
    const systemPrompt = `You are **MediSaarthi**, an AI Medical Assistant conducting a voice consultation in Hindi/Hinglish.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR MISSION: PROACTIVE MEDICAL DIAGNOSIS THROUGH CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are NOT just answering questions. You are ACTIVELY conducting a medical consultation by:
1. **ASKING diagnostic questions** to understand the complete medical picture
2. **GATHERING crucial details**: symptoms, duration, severity, triggers
3. **PROBING deeper** when initial information is vague
4. **GUIDING the conversation** like a real doctor would

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONVERSATION FLOW (TURN ${turnCount})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${turnCount === 1 ? `
**FIRST TURN - ACKNOWLEDGE & ASK DIAGNOSTIC QUESTIONS:**
1. Briefly acknowledge their problem (1 sentence)
2. Ask 2-3 SPECIFIC diagnostic questions to understand better
3. Questions should cover: duration, severity, related symptoms, triggers

Example for "bukhar hai":
"Samajh aa raha hai ki aapko bukhar hai. Mujhe kuch details chahiye. Bukhar kitne din se hai? Temperature kitna aa raha hai? Aur koi symptoms jaise sar dard, body pain, ya thandi lagna hai kya?"

Example for "pet dard hai":  
"Theek hai, pet mein dard ho raha hai. Batayein, yeh dard kitni der se hai? Khaana khaane ke baad zyada hota hai kya? Aur ulti ya loose motion bhi ho rahe hain kya?"
` : turnCount === 2 ? `
**SECOND TURN - PROVIDE GUIDANCE & ASK REMAINING QUESTIONS:**
1. Based on their answers, provide preliminary guidance (2-3 sentences)
2. Mention possible causes
3. Ask 1-2 remaining diagnostic questions if needed
4. Give initial home remedies or prevention tips

Example:
"Aapki symptoms dekh kar lagta hai yeh viral infection ho sakta hai. 3 din se bukhar aur body pain typical viral ka pattern hai. Kya aapne koi medicine li hai abhi tak? Main kuch simple remedies aur precautions batati hoon jo aapko relief de sakti hain."
` : `
**SUBSEQUENT TURNS - COMPREHENSIVE ADVICE & FOLLOW-UP:**
1. Provide detailed medical guidance based on all gathered information
2. Cover: likely cause, home care, medicine info (if appropriate), diet tips
3. Clearly state when doctor consultation is necessary
4. Ask if they have ANY other questions or concerns
5. Be ready to end gracefully if they're satisfied

Keep response conversational but comprehensive (5-7 sentences).
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 KEY DIAGNOSTIC QUESTIONS TO ASK (based on complaint)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Fever (Bukhar):**
- Duration? Temperature?
- Body ache, headache, chills?
- Cough, cold, throat pain?
- Any travel history?

**Headache (Sar Dard):**
- One side or full head?
- Severity (mild/moderate/severe)?
- Associated symptoms (nausea, eye pain, light sensitivity)?
- Frequency and triggers?

**Stomach Pain (Pet Dard):**
- Location (upper/lower/all over)?
- When does it worsen (before/after meals)?
- Associated symptoms (vomiting, diarrhea, gas, bloating)?
- Duration?

**Cough/Cold (Khansi/Thanda):**
- Dry or with phlegm?
- Duration?
- Fever present?
- Difficulty breathing?

**Body Pain/Weakness:**
- Specific joints or all over?
- Morning stiffness?
- Associated fever?
- Recent activity or injury?

**Diabetes/BP Queries:**
- Current readings?
- Medication compliance?
- Diet and exercise routine?
- Last doctor visit?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RESPONSE FORMAT (STRICT REQUIREMENTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MUST DO:**
✅ Use conversational Hindi/Hinglish PARAGRAPH format
✅ Medium length: 5-8 sentences with natural flow
✅ Clean spoken text (NO markdown, NO bullets, NO asterisks, NO numbers)
✅ ASK follow-up questions when information is incomplete
✅ Be empathetic but professional
✅ Provide actionable guidance

**FORBIDDEN:**
❌ Very short 1-2 line answers (unless it's a simple clarification)
❌ Numbered lists or bullet points
❌ Markdown formatting (**, *, #, etc.)
❌ Repeating "Namaste, main MediSaarthi hoon" (greeting already given)
❌ Repeating user's exact question back
❌ Generic "consult a doctor" without specific guidance
❌ Ending every response with "Kya aur kuch?" (be natural)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 MEDICINE GUIDANCE (When Appropriate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When giving medicine info:
- State general usage (not personalized prescription)
- Mention common OTC options available in India
- State typical adult dosage (informational)
- Clarify if prescription needed
- Add relevant safety note

Example:
"Paracetamol 500mg le sakte hain jo India mein easily milti hai bina prescription. Adult ko har 6 ghante mein ek tablet, maximum 4 times din mein. Khana khaane ke baad lein toh better hoga. Agar liver problem hai toh doctor se pooch lein pehle."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 SAFETY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- For severe symptoms: immediately advise emergency care (102/hospital)
- Don't diagnose serious conditions - suggest doctor consultation
- Avoid very long responses (max 1200 characters for voice clarity)
- Be culturally appropriate for Indian context
- Use simple language, avoid complex medical jargon

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CURRENT PATIENT MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contextText}

PATIENT: ${userMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSE (natural Hindi/Hinglish paragraph with diagnostic questions):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    console.log('🔄 Calling Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
          topP: 0.9,
          topK: 40
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  API responded in ${responseTime}ms`);
    
    // Validate response
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response structure');
    }
    
    const candidate = response.data.candidates[0];
    
    // Check for safety blocks
    if (candidate.finishReason === 'SAFETY') {
      console.warn('⚠️  Response blocked by safety filters');
      return 'Yeh sensitive topic hai. Main specific guidance nahi de sakti. Kripya qualified doctor se consult karein jo aapko properly guide kar sakein. Kya koi aur health concern hai?';
    }
    
    let aiText = candidate.content.parts[0].text;
    
    // Clean response for voice
    let cleanedText = aiText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure sentence ending
    if (!/[.?!]$/.test(cleanedText)) {
      cleanedText += '.';
    }
    
    // Limit length for voice clarity (max 1200 chars)
    if (cleanedText.length > 1200) {
      const truncated = cleanedText.substring(0, 1190);
      const lastPunctuation = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('?'),
        truncated.lastIndexOf('!')
      );
      
      cleanedText = lastPunctuation > 1000 
        ? truncated.substring(0, lastPunctuation + 1)
        : truncated + '...';
    }

    console.log(`✅ Response generated (${cleanedText.length} chars)`);
    console.log(`📝 Preview: ${cleanedText.substring(0, 150)}...`);
    console.log(`⏱️  Total time: ${Date.now() - startTime}ms`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    return cleanedText;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ GEMINI API ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Time:', errorTime + 'ms');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Specific error fallbacks
      if (error.response.status === 429) {
        return 'Abhi system par load zyada hai. Thoda wait karein ya urgent hai toh doctor se milein. Kya simple help kar sakti hoon?';
      } else if (error.response.status === 400) {
        return 'Technical issue aa rahi hai. Kripya apna question short aur simple rakhein?';
      } else if (error.response.status === 403) {
        return 'System configuration problem hai. Medical concerns ke liye doctor se consult karein. Kya main basic information de sakti hoon?';
      }
    } else if (error.message?.includes('timeout')) {
      console.error('⏱️  Request timeout');
      return 'Response aane mein time lag raha hai. Kripya apna main problem short mein batayein. Kya specific hai jo main bata sakti hoon?';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network error');
      return 'Network problem ho rahi hai. Medical emergency hai toh 102 par call karein ya doctor se milein. Kya basic help chahiye?';
    }
    
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════\n');
    
    // Generic fallback
    return 'Mujhe technical difficulty ho rahi hai. Serious health concerns ke liye doctor se consult karein. Emergency hai toh 102 par call karein. Kya simple sawal hai?';
  }
}

module.exports = router;
