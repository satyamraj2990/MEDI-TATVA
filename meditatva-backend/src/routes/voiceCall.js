const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');
const crypto = require('crypto');
const { getMedicalResponse } = require('../utils/medicalKnowledgeBase');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const geminiApiKey = process.env.GEMINI_API_KEY;

// CRITICAL: Validate BACKEND_URL on startup
const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
  console.warn('\n⚠️⚠️⚠️ WARNING: BACKEND_URL is set to localhost! ⚠️⚠️⚠️');
  console.warn('Twilio webhooks will NOT work with localhost.');
  console.warn('Set BACKEND_URL to your Ngrok URL in .env file:');
  console.warn('BACKEND_URL=https://your-ngrok-url.ngrok-free.app\n');
}

// Initialize Twilio client with validation
let client = null;
if (accountSid && accountSid.startsWith('AC') && authToken) {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized');
} else {
  console.error('❌ Twilio credentials missing or invalid');
}
const VoiceResponse = twilio.twiml.VoiceResponse;

// Generate unique request IDs for debugging
function generateRequestId() {
  return crypto.randomBytes(8).toString('hex');
}

// Store active call sessions with conversation state
const callSessions = new Map();

// Store active CONFERENCE sessions (multi-party calls with AI MediSaarthi)
const conferenceSessions = new Map();

// Track processed requests to prevent duplicate processing (Twilio retries)
const processedRequests = new Map();

// Rate limiting for Gemini API calls (prevent quota exhaustion)
const geminiRateLimit = {
  calls: [],
  maxCallsPerMinute: 15,
  isAllowed: function() {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < 60000); // Keep only last minute
    if (this.calls.length >= this.maxCallsPerMinute) {
      console.warn(`⚠️ Gemini rate limit reached (${this.maxCallsPerMinute}/min)`);
      return false;
    }
    this.calls.push(now);
    return true;
  }
};

// Session cleanup - remove old sessions after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [callSid, session] of callSessions.entries()) {
    if (session.startTime.getTime() < oneHourAgo) {
      console.log(`🧹 Cleaning up old session: ${callSid}`);
      callSessions.delete(callSid);
    }
  }
  
  // Clean up old processed requests (keep only last 5 minutes)
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [reqId, timestamp] of processedRequests.entries()) {
    if (timestamp < fiveMinutesAgo) {
      processedRequests.delete(reqId);
    }
  }
  
  console.log(`📊 Active sessions: ${callSessions.size}, Recent requests: ${processedRequests.size}`);
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
  const requestId = generateRequestId();
  let responseSent = false; // Prevent double-send
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎤 INCOMING CALL - HANDLE-CALL WEBHOOK                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📋 CallSid: ${req.body.CallSid}`);
    console.log(`📞 From: ${req.body.From} → To: ${req.body.To}`);
    console.log(`📊 Status: ${req.body.CallStatus}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`🔍 Full payload:`, JSON.stringify(req.body, null, 2));
    
    const callSid = req.body.CallSid;
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // CRITICAL: Validate public URL
    if (currentBackendUrl.includes('localhost') || currentBackendUrl.includes('127.0.0.1')) {
      console.error('❌ BACKEND_URL is localhost - webhooks will fail!');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'System configuration error. Kripya administrator se contact karein. Dhanyavaad.'
      );
      twiml.hangup();
      res.type('text/xml');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    // Initialize or get session (ONLY on first call, not redirects)
    if (!callSessions.has(callSid)) {
      callSessions.set(callSid, {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0,
        lastUserQuery: null,
        greetingSent: false, // Track if greeting was already played
        symptomsCollected: {
          symptoms: [],
          duration: null,
          severity: null
        }
      });
      console.log(`✅ New session created for ${callSid}`);
    } else {
      console.log(`♻️  Reusing existing session for ${callSid}`);
    }
    
    const session = callSessions.get(callSid);
    
    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // CRITICAL FIX: Optimized gather settings to prevent echo and enable fast greeting
    const gather = twiml.gather({
      input: 'speech',              // CRITICAL: Only speech input, NO recording
      action: `${currentBackendUrl}/api/voice-call/process-speech`,
      method: 'POST',
      timeout: 5,                   // Wait 5 seconds for user to start speaking
      speechTimeout: '3',           // Auto-finish after 3 seconds of silence
      language: 'hi-IN',
      profanityFilter: false,
      speechModel: 'phone_call',    // Optimized for phone quality audio
      enhanced: true,               // Use enhanced speech recognition
      hints: 'bukhar,sar dard,pet dard,khansi,thanda,dard,dawai,doctor,symptoms,diabetes,blood pressure,thyroid,infection,medicine,tablet,paracetamol,cetirizine'
    });

    // CRITICAL FIX: Only greet on FIRST call, not on redirects (prevents greeting loop)
    if (!session.greetingSent) {
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Namaste, main MediSaarthi hoon, aapki health assistant. Main aapki kya sahayata kar sakti hoon?'
      );
      session.greetingSent = true;
      callSessions.set(callSid, session);
      console.log('🎙️  Greeting sent for first time');
    } else {
      // On retry/redirect, use shorter prompt
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Kripya apni health problem batayein.'
      );
      console.log('🔁 Retry prompt sent (no greeting)');
    }

    // Fallback if no speech detected after timeout
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Mujhe kuch sunayi nahi diya. Kripya dobara call karein. Dhanyavaad.'
    );
    twiml.hangup(); // End call after timeout instead of endless redirect

    const processingTime = Date.now() - requestStartTime;
    console.log(`📤 Sending TwiML response (${processingTime}ms)`);
    console.log(`📄 TwiML length: ${twiml.toString().length} bytes`);
    
    // CRITICAL: Proper headers and immediate response send
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    responseSent = true;
    return res.send(twiml.toString());
    
    console.log(`✅ [${requestId}] TwiML response sent successfully (${processingTime}ms)\n`);
    
  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR IN HANDLE-CALL ❌❌❌');
    console.error(`🆔 Request ID: ${requestId}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Only send fallback if we haven't sent a response yet
    if (!responseSent) {
      // EMERGENCY FALLBACK - ALWAYS return valid TwiML
      try {
        const emergencyBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const emergencyTwiml = new VoiceResponse();
        const emergencyGather = emergencyTwiml.gather({
          input: 'speech',
          action: `${emergencyBackendUrl}/api/voice-call/process-speech`,
          method: 'POST',
          timeout: 6,
          speechTimeout: '5',
          language: 'hi-IN'
        });
        
        emergencyGather.say(
          { voice: 'Polly.Aditi', language: 'hi-IN' },
          'Namaste, main MediSaarthi hoon. Aapko kya health problem hai?'
        );
        
        emergencyTwiml.say(
          { voice: 'Polly.Aditi', language: 'hi-IN' },
          'Kripya dobara bolein.'
        );
        
        res.type('text/xml');
        res.status(200);
        res.send(emergencyTwiml.toString());
        console.log(`📤 [${requestId}] Emergency fallback TwiML sent`);
        
      } catch (fallbackError) {
        console.error(`❌ [${requestId}] Even emergency fallback failed:`, fallbackError.message);
        // Last resort - minimal valid TwiML
        try {
          const minimalTwiml = new VoiceResponse();
          minimalTwiml.say(
            { voice: 'Polly.Aditi', language: 'hi-IN' },
            'Namaste, main MediSaarthi hoon. Kripya thodi der baad call karein. Dhanyavaad.'
          );
          minimalTwiml.hangup();
          
          res.type('text/xml');
          res.status(200);
          res.send(minimalTwiml.toString());
          console.log(`📤 [${requestId}] Minimal fallback TwiML sent`);
        } catch (finalError) {
          console.error(`❌ [${requestId}] All fallbacks failed:`, finalError.message);
          // Absolute last resort
          if (!res.headersSent) {
            res.type('text/xml').status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN">Namaste. Kripya thodi der baad call karein.</Say><Hangup/></Response>');
          }
        }
      }
    } else {
      console.log(`⚠️ [${requestId}] Response already sent, skipping fallback`);
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// PROCESS SPEECH INPUT - HEART OF THE AI CONVERSATION
// ════════════════════════════════════════════════════════════════════
router.post('/process-speech', async (req, res) => {
  const requestStartTime = Date.now();
  let responseSent = false; // Prevent double-send
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🗣️  PROCESSING SPEECH INPUT - STT → AI → TTS             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const speechResult = req.body.SpeechResult;
    const callSid = req.body.CallSid;
    const confidence = parseFloat(req.body.Confidence || 0);
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📥 INCOMING SPEECH TRANSCRIPTION (STT OUTPUT)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📱 CallSid: ${callSid}`);
    console.log(`🎯 Speech Transcript: "${speechResult}"`);
    console.log(`📊 STT Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`🔡 Transcript Length: ${speechResult?.length || 0} chars`);
    console.log(`✅ Valid Transcript: ${speechResult && speechResult.trim() !== '' ? 'YES' : 'NO'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // ═══ CRITICAL VALIDATION: Empty Speech ═══
    if (!speechResult || speechResult.trim() === '') {
      console.warn('⚠️  Empty speech result - user might be silent or unclear');
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
        'Mujhe aapki baat sunai nahi di. Kripya thoda zor se aur clearly bolein.'
      );
      
      // Give one more chance before hanging up
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Dhanyavaad call karne ke liye. Apna khayal rakhein.'
      );
      twiml.hangup();
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    // ═══ GET OR CREATE SESSION ═══
    let session = callSessions.get(callSid);
    if (!session) {
      console.warn('⚠️  Session not found for CallSid, creating new session');
      session = {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0,
        lastUserQuery: '',
        greetingSent: true, // Already sent in handle-call
        symptomsCollected: {
          symptoms: [],
          duration: null,
          severity: null
        }
      };
      callSessions.set(callSid, session);
    }
    
    // ═══ DEBUG: Prevent duplicate query processing ═══
    console.log(`📚 Conversation history length: ${session.conversationHistory.length}`);
    console.log(`🔢 Current turn: ${session.turnCount}`);
    
    // ═══ VALIDATION: Low Confidence Recognition ═══
    if (confidence < 0.4) {
      console.warn(`⚠️  Low STT confidence (${(confidence * 100).toFixed(1)}%) - asking user to repeat`);
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
        'Mujhe aapki baat theek se samajh nahi aayi. Kripya dhire dhire aur saaf shabdon mein bolein.'
      );
      
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Theek hai. Dhanyavaad call karne ke liye.'
      );
      twiml.hangup();
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    session.turnCount = (session.turnCount || 0) + 1;
    console.log(`📈 Incrementing conversation turn: ${session.turnCount}`);
    
    // Store current query
    session.lastUserQuery = speechResult;

    // ═══ EMERGENCY DETECTION (CRITICAL: Immediate Hospital Referral) ═══
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'cant breathe', 'cannot breathe',
      'suicide', 'heavy bleeding', 'unconscious', 'behosh', 'dil ka dor', 
      'sans nahi aa rahi', 'khoon bah raha', 'chakkar aa rahe', 'dil dard'
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      console.log('🚨🚨🚨 EMERGENCY DETECTED - Immediate Referral 🚨🚨🚨');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Yeh emergency situation hai! Kripya turant 102 par ambulance bulayein ya najdeeki hospital jaayein. Bilkul deri mat karein!'
      );
      twiml.hangup();
      
      // Clean up session
      callSessions.delete(callSid);
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }

    // ═══ GOODBYE DETECTION (Graceful Call End) ═══
    const goodbyeKeywords = ['bye', 'goodbye', 'thank you', 'thanks', 'dhanyavaad', 'shukriya', 'alvida', 'thik hai bas', 'koi nahi', 'rakhna'];
    const wantsToEnd = goodbyeKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    ) && speechResult.split(' ').length <= 5; // Short goodbye phrases only

    if (wantsToEnd) {
      console.log('👋 User saying goodbye - ending call gracefully');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Dhanyavaad MediSaarthi use karne ke liye. Apna aur apne family ka khayal rakhein. Swasth rahein, namaste!'
      );
      twiml.hangup();
      
      // Clean up session
      callSessions.delete(callSid);
      console.log('✅ Session cleaned after goodbye');
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }

    // ═══ ADD USER MESSAGE TO CONVERSATION HISTORY ═══
    session.conversationHistory.push({
      role: 'user',
      content: speechResult,
      timestamp: new Date()
    });
    
    // Keep only last 8 messages (4 turns) to prevent context bloat
    if (session.conversationHistory.length > 8) {
      const trimCount = session.conversationHistory.length - 8;
      session.conversationHistory.splice(0, trimCount);
      console.log(`🗑️  Trimmed ${trimCount} old messages from history`);
    }
    
    console.log(`📝 User message added to history`);
    console.log(`📚 Total messages in context: ${session.conversationHistory.length}`);

    // ═══ GET MEDICAL RESPONSE (AI with Intelligent Fallback) ═══
    console.log(`🤖 Generating medical response...`);
    console.log(`📋 User query: "${speechResult}"`);
    let aiResponse = '';
    let useAI = false;
    
    // SMART DECISION: Try AI only if key is configured and likely to work
    const hasValidKey = geminiApiKey && geminiApiKey !== 'your_key_here' && geminiApiKey.startsWith('AIza');
    const withinRateLimit = geminiRateLimit.isAllowed();
    
    console.log(`🔑 Valid API Key: ${hasValidKey}`);
    console.log(`⏱️  Within Rate Limit: ${withinRateLimit}`);
    
    if (hasValidKey && withinRateLimit) {
      try {
        const aiStartTime = Date.now();
        console.log('🔄 Attempting Gemini API...');
        
        // Set 9 second timeout for Gemini (Twilio webhook timeout is 15s, leave buffer)
        const responsePromise = getGeminiMedicalResponse(
          speechResult, 
          session.conversationHistory,
          session.symptomsCollected,
          session.turnCount
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout after 9s')), 9000)
        );
        
        aiResponse = await Promise.race([responsePromise, timeoutPromise]);
        
        const aiTime = Date.now() - aiStartTime;
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ GEMINI AI RESPONSE RECEIVED');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`⏱️  Response time: ${aiTime}ms`);
        console.log(`📝 Response length: ${aiResponse.length} characters`);
        console.log(`📄 Full Response: "${aiResponse}"`);
        console.log('═══════════════════════════════════════════════════════\n');
        useAI = true;
      } catch (aiError) {
        console.warn('⚠️  Gemini API failed, will use medical knowledge base');
        console.warn(`   Error type: ${aiError.message}`);
        useAI = false;
        aiResponse = ''; // Clear any partial response
      }
    } else {
      console.log('💡 Skipping Gemini API - using medical knowledge system directly');
      if (!hasValidKey) console.log('   Reason: No valid API key configured');
      if (!withinRateLimit) console.log('   Reason: Rate limit exceeded');
      useAI = false;
    }
    
    // ═══ INTELLIGENT MEDICAL KNOWLEDGE FALLBACK (Production-Quality) ═══
    if (!useAI || !aiResponse || aiResponse.trim() === '') {
      const startTime = Date.now();
      console.log('═══════════════════════════════════════════════════════');
      console.log('🏥 MEDICAL KNOWLEDGE BASE FALLBACK ACTIVATED');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📋 User Query: "${speechResult}"`);
      console.log(`❌ Reason: Gemini API ${!hasValidKey ? 'no valid key' : !withinRateLimit ? 'rate limit exceeded' : 'failed/timeout'}`);
      
      // Use centralized medical knowledge base (imported from utils)
      aiResponse = getMedicalResponse(speechResult);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Medical knowledge response generated in ${responseTime}ms`);
      console.log(`📝 Response length: ${aiResponse.length} characters`);
      console.log(`📄 Full Response: "${aiResponse}"`);
      console.log('═══════════════════════════════════════════════════════\n');
    }

    // ═══ CRITICAL VALIDATION: Ensure Response is Valid ═══
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('\n❌❌❌ CRITICAL ERROR: No response generated!');
      console.error(`   User query was: "${speechResult}"`);
      console.error(`   Both Gemini AI and Medical Knowledge Base failed!`);
      aiResponse = 'Maaf kijiye, kripya apna sawal dobara bataye.';
    } else {
      console.log(`\n✅ Final response ready (${aiResponse.length} chars)`);
      
      // CRITICAL VALIDATION: Only reject if response is truly generic and unhelpful
      const lowerResponse = aiResponse.toLowerCase();
      const lowerQuery = speechResult.toLowerCase();
      
      // Detect unrelated disease lists (diseases mentioned that user didn't ask about)
      const diseaseCount = (lowerResponse.match(/diabetes/gi) || []).length + 
                          (lowerResponse.match(/thyroid/gi) || []).length + 
                          (lowerResponse.match(/\bbp\b/gi) || []).length +
                          (lowerResponse.match(/infection/gi) || []).length;
      
      const userAskedDiseases = (lowerQuery.match(/diabetes/gi) || []).length + 
                                (lowerQuery.match(/thyroid/gi) || []).length + 
                                (lowerQuery.match(/\bbp\b/gi) || []).length;
      
      // Only reject if response mentions 3+ diseases but user asked about 0-1
      const hasIrrelevantDiseaseList = diseaseCount >= 3 && userAskedDiseases <= 1;
      
      // Detect truly generic helper responses (very short with no medical content)
      const hasMedialContent = lowerResponse.includes('usually') || 
                               lowerResponse.includes('wajah se') ||
                               lowerResponse.includes('prevention') ||
                               lowerResponse.includes('le sakte hain') ||
                               lowerResponse.includes('doctor') ||
                               lowerResponse.length > 250;
      
      const isUnhelpfulGeneric = !hasMedialContent && lowerResponse.length < 200;
      
      if (hasIrrelevantDiseaseList) {
        console.error('\n🚨 IRRELEVANT DISEASE LIST DETECTED - REJECTING!');
        console.error(`   Response mentioned ${diseaseCount} diseases but user only asked about ${userAskedDiseases}`);
        console.error(`   User query: "${speechResult}"`);
        // Return more general guidance without asking for clarification
        aiResponse = `Main "${speechResult}" ke baare mein aapki madad karna chahti hoon. Medical guidance Hindi mein dene ki koshish karungi. Kya main aapki kisi specific swasthya sambandhit sawal mein madad kar sakti hoon?`;
      } else if (isUnhelpfulGeneric) {
        console.error('\n🚨 TOO SHORT/GENERIC RESPONSE - NEEDS MORE DETAIL!');
        console.error(`   Response length: ${aiResponse.length} chars, lacks medical content`);
        // Keep it but log warning
        console.log('⚠️  Using generic response (not ideal but better than asking for clarification again)');
      } else {
        console.log('✅ Response validation passed - specific and medically relevant');
        console.log(`   Response length: ${aiResponse.length} chars`);
        console.log(`   Contains medical guidance: YES`);
      }
    }

    // ═══ ADD AI RESPONSE TO CONVERSATION HISTORY ═══
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Update session in memory
    callSessions.set(callSid, session);
    console.log('💾 Session updated with AI response');

    // ═══ CREATE TwiML RESPONSE - CRITICAL: NO ECHO, ONLY AI SPEECH ═══
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔊 GENERATING TTS RESPONSE (Text-to-Speech)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📝 Text to be spoken: "${aiResponse}"`);
    console.log(`🎤 TTS Voice: Polly.Aditi (Hindi)`);
    console.log(`🔄 Will ask follow-up: "Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?"`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const twiml = new VoiceResponse();
    
    // CRITICAL FIX: Speak ONLY the AI response (NOT user's voice)
    // This prevents echo issue - we never play back user audio
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      aiResponse
    );
    
    // Natural pause before asking follow-up
    twiml.pause({ length: 1 });
    
    // CRITICAL: Continue conversation loop with new gather
    // This is how we maintain continuous voice conversation
    const followUpGather = twiml.gather({
      input: 'speech',              // CRITICAL: Only speech, NO record
      action: `${backendUrl}/api/voice-call/process-speech`,
      method: 'POST',
      timeout: 6,                   // Wait 6 seconds for user to start speaking
      speechTimeout: '3',           // Auto-finish 3 seconds after silence
      language: 'hi-IN',
      profanityFilter: false,
      speechModel: 'phone_call',
      enhanced: true,
      hints: 'haan,nahi,bukhar,sir dard,pet dard,khansi,dawai,doctor,diabetes,blood pressure,dhanyavaad,bas,theek hai'
    });

    // Ask follow-up question AFTER the medical answer
    // This separates the answer from the follow-up question clearly
    followUpGather.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?'
    );
    
    // Fallback if user doesn't respond after timeout - end gracefully
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Theek hai. Dhanyavaad MediSaarthi use karne ke liye. Apna khayal rakhein. Swasth rahein!'
    );
    twiml.hangup();

    const totalTime = Date.now() - requestStartTime;
    console.log(`📤 Sending TwiML response (total processing: ${totalTime}ms)`);
    console.log(`📄 TwiML length: ${twiml.toString().length} bytes`);
    console.log(`✅ TwiML structure: Greeting → Speech → Pause → Follow-up Gather → Timeout Fallback\n`);
    
    // CRITICAL: Proper headers for Twilio TwiML
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    responseSent = true;
    return res.send(twiml.toString());

  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR IN PROCESS-SPEECH ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // CRITICAL: Only send fallback if we haven't already sent a response
    // This prevents "headers already sent" errors
    if (!responseSent) {
      try {
        console.log('🚨 Sending emergency fallback TwiML...');
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fallbackTwiml = new VoiceResponse();
        
        // Give user one more chance to speak
        const fallbackGather = fallbackTwiml.gather({
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
        
        fallbackGather.say(
          { voice: 'Polly.Aditi', language: 'hi-IN' },
          'Maaf kijiye, kripya apna sawal dobara bataye.'
        );
        
        // Timeout fallback
        fallbackTwiml.say(
          { voice: 'Polly.Aditi', language: 'hi-IN' },
          'Theek hai. Dhanyavaad call karne ke liye. Apna khayal rakhein.'
        );
        fallbackTwiml.hangup();
        
        res.set('Content-Type', 'text/xml; charset=utf-8');
        res.status(200);
        return res.send(fallbackTwiml.toString());
        
      } catch (fallbackError) {
        console.error('❌ Emergency fallback also failed:', fallbackError.message);
        // Absolute last resort - minimal valid TwiML
        if (!res.headersSent) {
          const minimalResponse = '<?xml version="1.0" encoding="UTF-8"?><Response><Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad call karne ke liye. Apna khayal rakhein.</Say><Hangup/></Response>';
          res.set('Content-Type', 'text/xml; charset=utf-8');
          res.status(200).send(minimalResponse);
        }
      }
    } else {
      console.log('⚠️  Response already sent to client, skipping fallback');
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
    activeConferences: conferenceSessions.size,
    timestamp: new Date().toISOString()
  });
});

// ════════════════════════════════════════════════════════════════════
// UI-INITIATED CONFERENCE CALLS (for MediConferenceCall component)
// ════════════════════════════════════════════════════════════════════

// ═══ INITIATE CONFERENCE (Called from UI) ═══
router.post('/initiate-conference', async (req, res) => {
  try {
    const { phoneNumber, conferenceName } = req.body;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎙️  UI INITIATED CONFERENCE CALL                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📞 Calling: ${phoneNumber}`);
    console.log(`📋 Conference: ${conferenceName || 'Auto-generated'}`);
    
    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please include country code (e.g., +917739489684)'
      });
    }
    
    if (!client) {
      return res.status(500).json({
        success: false,
        message: 'Twilio not configured'
      });
    }
    
    // Generate conference name
    const finalConferenceName = conferenceName || `MediConf-${Date.now()}`;
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Create call to host
    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhoneNumber,
      url: `${currentBackendUrl}/api/voice-call/conference/join?conference=${encodeURIComponent(finalConferenceName)}`,
      method: 'POST',
      statusCallback: `${currentBackendUrl}/api/voice-call/call-status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    
    console.log(`✅ Conference call initiated: ${call.sid}`);
    console.log(`📋 Conference name: ${finalConferenceName}`);
    
    res.json({
      success: true,
      message: 'Conference call initiated successfully',
      callSid: call.sid,
      conferenceName: finalConferenceName,
      status: call.status
    });
    
  } catch (error) {
    console.error('❌ Error initiating conference:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate conference call'
    });
  }
});

// ═══ ADD PARTICIPANT TO CONFERENCE ═══
router.post('/add-to-conference', async (req, res) => {
  try {
    const { conferenceName, phoneNumber, participantName } = req.body;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  👥 ADDING PARTICIPANT TO CONFERENCE                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📋 Conference: ${conferenceName}`);
    console.log(`📞 Adding: ${participantName || 'Participant'} (${phoneNumber})`);
    
    // Validate inputs
    if (!conferenceName) {
      return res.status(400).json({
        success: false,
        message: 'Conference name is required'
      });
    }
    
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please include country code'
      });
    }
    
    if (!client) {
      return res.status(500).json({
        success: false,
        message: 'Twilio not configured'
      });
    }
    
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Create call to add participant
    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhoneNumber,
      url: `${currentBackendUrl}/api/voice-call/conference/join?conference=${encodeURIComponent(conferenceName)}`,
      method: 'POST',
      statusCallback: `${currentBackendUrl}/api/voice-call/call-status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    
    console.log(`✅ Participant call initiated: ${call.sid}`);
    console.log(`👤 Name: ${participantName || 'Unknown'}`);
    
    res.json({
      success: true,
      message: 'Participant added successfully',
      callSid: call.sid,
      participantName: participantName,
      phoneNumber: phoneNumber,
      status: call.status
    });
    
  } catch (error) {
    console.error('❌ Error adding participant:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add participant to conference'
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// CONFERENCE MODE: MediSaarthi joins as AI participant
// ════════════════════════════════════════════════════════════════════

// ═══ CREATE/JOIN CONFERENCE WITH AI MEDISAARTHI ═══
router.post('/conference/join', async (req, res) => {
  const requestId = generateRequestId();
  let responseSent = false;
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎙️  CONFERENCE CALL - AI MEDISAARTHI JOINING             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📋 Conference Name: ${req.body.conferenceName || req.query.conference || 'MediTatva-Health-Call'}`);
    console.log(`📞 From: ${req.body.From}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    // Get conference name from query param or body
    const conferenceName = req.query.conference || req.body.conferenceName || `MediCall-${Date.now()}`;
    const callSid = req.body.CallSid;
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Initialize conference session
    if (!conferenceSessions.has(conferenceName)) {
      conferenceSessions.set(conferenceName, {
        conferenceName: conferenceName,
        participants: [],
        greeted: false,
        conversationHistory: [],
        lastUserQuery: null,
        startTime: new Date(),
        queryCount: 0
      });
      console.log(`✅ New conference session created: ${conferenceName}`);
    }
    
    const session = conferenceSessions.get(conferenceName);
    session.participants.push({ callSid, joinedAt: new Date() });
    
    // Create TwiML to join conference
    const twiml = new VoiceResponse();
    
    const dial = twiml.dial();
    const conference = dial.conference({
      statusCallback: `${currentBackendUrl}/api/voice-call/conference/status`,
      statusCallbackEvent: 'start end join leave',
      statusCallbackMethod: 'POST',
      startConferenceOnEnter: true,
      endConferenceOnExit: false
    }, conferenceName);
    
    // GREETING: Only on first participant
    if (!session.greeted) {
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Namaste, main MediSaarthi hoon, aapki AI health assistant. Aap apna health sambandhit sawal puch sakte hain.'
      );
      session.greeted = true;
      conferenceSessions.set(conferenceName, session);
      console.log('🎙️  MediSaarthi greeting sent');
    }
    
    console.log(`📤 Sending conference join TwiML`);
    
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    responseSent = true;
    return res.send(twiml.toString());
    
  } catch (error) {
    console.error('\n❌ Error in conference join:', error.message);
    console.error('Stack:', error.stack);
    
    if (!responseSent) {
      const fallbackTwiml = new VoiceResponse();
      fallbackTwiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Namaste. Conference join mein thodi technical problem hai. Kripya dobara try karein.'
      );
      fallbackTwiml.hangup();
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200).send(fallbackTwiml.toString());
    }
  }
});

// ═══ ADD AI MEDISAARTHI TO EXISTING CONFERENCE ═══
router.post('/conference/add-ai', async (req, res) => {
  try {
    const { conferenceName, phoneNumber } = req.body;
    
    if (!conferenceName) {
      return res.status(400).json({ error: 'Conference name required' });
    }
    
    if (!client) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }
    
    console.log(`🤖 Adding MediSaarthi AI to conference: ${conferenceName}`);
    
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Create call that joins AI to conference
    const call = await client.calls.create({
      to: phoneNumber || '+919999999999', // Dummy number - AI participant
      from: twilioPhoneNumber,
      url: `${currentBackendUrl}/api/voice-call/conference/ai-participant?conference=${encodeURIComponent(conferenceName)}`,
      method: 'POST',
      statusCallback: `${currentBackendUrl}/api/voice-call/call-status`,
      statusCallbackMethod: 'POST'
    });
    
    console.log(`✅ AI participant call initiated: ${call.sid}`);
    
    res.json({
      success: true,
      message: 'MediSaarthi AI added to conference',
      callSid: call.sid,
      conferenceName: conferenceName
    });
    
  } catch (error) {
    console.error('❌ Error adding AI to conference:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══ AI PARTICIPANT TwiML (for AI bot joining conference) ═══
router.post('/conference/ai-participant', (req, res) => {
  try {
    const conferenceName = req.query.conference || 'MediTatva-Health-Call';
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    console.log(`🤖 AI MediSaarthi joining conference: ${conferenceName}`);
    
    const twiml = new VoiceResponse();
    
    // Greeting for AI participant
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Namaste, main MediSaarthi hoon, aapki AI health assistant. Conference mein shamil ho rahi hoon.'
    );
    
    const dial = twiml.dial();
    dial.conference({
      statusCallback: `${currentBackendUrl}/api/voice-call/conference/status`,
      statusCallbackEvent: 'start end join leave',
      statusCallbackMethod: 'POST',
      startConferenceOnEnter: false,
      endConferenceOnExit: false,
      coach: false, // AI can hear all participants
      beep: false   // No beep when AI joins
    }, conferenceName);
    
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(twiml.toString());
    
  } catch (error) {
    console.error('❌ Error in AI participant TwiML:', error.message);
    const fallbackTwiml = new VoiceResponse();
    fallbackTwiml.hangup();
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(fallbackTwiml.toString());
  }
});

// ═══ CONFERENCE STATUS CALLBACK ═══
router.post('/conference/status', (req, res) => {
  try {
    const { ConferenceSid, FriendlyName, StatusCallbackEvent, Timestamp } = req.body;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📞 CONFERENCE STATUS UPDATE                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`🎙️  Conference: ${FriendlyName}`);
    console.log(`📊 Event: ${StatusCallbackEvent}`);
    console.log(`🆔 Sid: ${ConferenceSid}`);
    console.log(`⏰ Time: ${Timestamp}\n`);
    
    // Cleanup on conference end
    if (StatusCallbackEvent === 'conference-end' && conferenceSessions.has(FriendlyName)) {
      const session = conferenceSessions.get(FriendlyName);
      console.log(`🗑️  Cleaning up conference session:`);
      console.log(`   - Queries handled: ${session.queryCount || 0}`);
      console.log(`   - Participants: ${session.participants?.length || 0}`);
      conferenceSessions.delete(FriendlyName);
      console.log('✅ Conference session cleaned\n');
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error in conference status:', error.message);
    res.sendStatus(200);
  }
});

// ═══ PROCESS SPEECH IN CONFERENCE (Health Query Detection) ═══
router.post('/conference/process-speech', async (req, res) => {
  const requestStartTime = Date.now();
  let responseSent = false;
  
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  🗣️  CONFERENCE SPEECH PROCESSING - HEALTH QUERY DETECTION  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    const speechResult = req.body.SpeechResult;
    const conferenceName = req.body.ConferenceName || req.query.conference;
    const confidence = parseFloat(req.body.Confidence || 0);
    const currentBackendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    console.log(`🎙️  Conference: ${conferenceName}`);
    console.log(`🎯 Speech: "${speechResult}"`);
    console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    // Validate speech
    if (!speechResult || speechResult.trim() === '') {
      console.warn('⚠️  Empty speech - ignoring');
      const twiml = new VoiceResponse();
      twiml.pause({ length: 1 });
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    // Get or create conference session
    let session = conferenceSessions.get(conferenceName);
    if (!session) {
      session = {
        conferenceName: conferenceName,
        participants: [],
        greeted: true, // Already greeted in join
        conversationHistory: [],
        lastUserQuery: null,
        startTime: new Date(),
        queryCount: 0
      };
      conferenceSessions.set(conferenceName, session);
      console.log(`📝 Created new conference session`);
    }
    
    // ═══ HEALTH QUERY DETECTION (Smart Filter) ═══
    const isHealthQuery = detectHealthQuery(speechResult);
    
    if (!isHealthQuery) {
      console.log('ℹ️  Not a health query - AI remains silent');
      const twiml = new VoiceResponse();
      twiml.pause({ length: 1 }); // Stay silent
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    console.log('🏥 Health query detected - generating AI response');
    session.queryCount = (session.queryCount || 0) + 1;
    
    // ═══ PREVENT REPEATING SAME QUERY ═══
    if (session.lastUserQuery && session.lastUserQuery.toLowerCase() === speechResult.toLowerCase()) {
      console.warn('⚠️  Duplicate query detected - using cached response or skipping');
      const twiml = new VoiceResponse();
      twiml.pause({ length: 1 });
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200);
      responseSent = true;
      return res.send(twiml.toString());
    }
    
    session.lastUserQuery = speechResult;
    
    // ═══ GENERATE MEDICAL RESPONSE ═══
    let aiResponse = '';
    
    try {
      const aiStartTime = Date.now();
      
      if (!geminiRateLimit.isAllowed()) {
        throw new Error('Rate limit exceeded');
      }
      
      const responsePromise = getConferenceMedicalResponse(
        speechResult,
        session.conversationHistory,
        session.queryCount
      );
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 8000)
      );
      
      aiResponse = await Promise.race([responsePromise, timeoutPromise]);
      
      const aiTime = Date.now() - aiStartTime;
      console.log(`✅ AI response in ${aiTime}ms`);
      console.log(`📝 Response: ${aiResponse.substring(0, 100)}...`);
      
    } catch (aiError) {
      console.error('❌ AI error:', aiError.message);
      aiResponse = getFallbackMedicalResponse(speechResult);
      console.log('📝 Using fallback response');
    }
    
    // Validate response
    if (!aiResponse || aiResponse.trim() === '') {
      aiResponse = 'Kripya apna health sawal dobara spasht bataye.';
    }
    
    // Add to history
    session.conversationHistory.push({
      role: 'user',
      content: speechResult,
      timestamp: new Date()
    });
    
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
    
    // Keep only last 6 messages
    if (session.conversationHistory.length > 6) {
      session.conversationHistory = session.conversationHistory.slice(-6);
    }
    
    conferenceSessions.set(conferenceName, session);
    
    // ═══ CREATE TwiML RESPONSE (AI SPEAKS IN CONFERENCE) ═══
    const twiml = new VoiceResponse();
    
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      aiResponse
    );
    
    twiml.pause({ length: 1 });
    
    const totalTime = Date.now() - requestStartTime;
    console.log(`📤 Sending AI response (${totalTime}ms)`);
    
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    responseSent = true;
    return res.send(twiml.toString());
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR in conference speech processing');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (!responseSent) {
      const fallbackTwiml = new VoiceResponse();
      fallbackTwiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Maaf kijiye, mujhe thodi technical dikkat aa rahi hai, kripya fir se apna sawal bataye.'
      );
      fallbackTwiml.pause({ length: 1 });
      
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(200).send(fallbackTwiml.toString());
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// HEALTH QUERY DETECTION FUNCTION
// ════════════════════════════════════════════════════════════════════
function detectHealthQuery(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Health/Medical keywords (comprehensive list)
  const healthKeywords = [
    // Symptoms
    'dard', 'pain', 'ache', 'bukhar', 'fever', 'tap', 'thanda', 'cold', 'khansi', 'cough',
    'headache', 'sir', 'sar', 'pet', 'stomach', 'ulti', 'vomit', 'loose motion', 'diarrhea',
    'chakkar', 'dizzy', 'weakness', 'kamzori', 'thakaan', 'tired', 'sans', 'breathing',
    'dil', 'heart', 'chest', 'naak', 'nose', 'gala', 'throat', 'khara', 'khaaj', 'itch',
    'swelling', 'sujan', 'rash', 'allergy', 'infection', 'jalan', 'burning',
    
    // Diseases
    'diabetes', 'sugar', 'shakkar', 'bp', 'blood pressure', 'thyroid', 'asthma', 'dama',
    'cancer', 'tuberculosis', 'tb', 'malaria', 'dengue', 'typhoid', 'cholesterol',
    'arthritis', 'kidney', 'liver', 'heart', 'pneumonia', 'covid', 'corona',
    
    // Medicine related
    'dawai', 'medicine', 'tablet', 'capsule', 'syrup', 'dawa', 'injection', 'dose',
    'paracetamol', 'aspirin', 'antibiotic', 'prescription', 'doctor',
    
    // Body parts
    'kamar', 'back', 'pair', 'leg', 'hath', 'hand', 'aankh', 'eye', 'kan', 'ear',
    
    // Health queries
    'health', 'swasthya', 'bimar', 'sick', 'ill', 'problem', 'issue', 'treatment', 'upchar',
    'hospital', 'clinic', 'checkup', 'test', 'report', 'diagnosis'
  ];
  
  // Check if text contains any health keyword
  const containsHealthKeyword = healthKeywords.some(keyword => lowerText.includes(keyword));
  
  // Return true ONLY if contains health keyword
  // This prevents AI from responding to normal chat like "Hello, kaise ho?"
  return containsHealthKeyword;
}

// ════════════════════════════════════════════════════════════════════
// CONFERENCE MEDICAL RESPONSE GENERATOR
// ════════════════════════════════════════════════════════════════════
async function getConferenceMedicalResponse(userQuery, conversationHistory = [], queryCount = 0) {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 CONFERENCE AI - GENERATING MEDICAL RESPONSE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 Query:', userQuery);
  console.log('🔢 Query count:', queryCount);
  
  try {
    const apiKey = process.env.GEMINI_API_KEY || geminiApiKey;
    if (!apiKey || apiKey === 'your_key_here') {
      throw new Error('Gemini API key not configured');
    }
    
    // Build compact context (only last 2 exchanges)
    let contextText = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4); // Last 2 exchanges
      contextText = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    }
    
    // CONFERENCE-SPECIFIC PROMPT (Short & Direct)
    const systemPrompt = `You are MediSaarthi, an AI health assistant in a conference call. 

RULES:
1. Answer the health query DIRECTLY in 4-6 sentences
2. Use simple Hindi/Hinglish
3. NO greeting (already done)
4. NO generic templates
5. Give: causes, relief tips, medicine info (if relevant), doctor advice (if serious)
6. Format: Natural spoken paragraph, no bullets

Query: "${userQuery}"

${contextText ? `\nRecent context:\n${contextText}` : ''}

Respond in Hindi:`;

    console.log('🔄 Calling Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
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
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  API responded in ${responseTime}ms`);
    
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response');
    }
    
    let aiText = response.data.candidates[0].content.parts[0].text;
    
    // Clean for voice
    aiText = aiText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit length
    if (aiText.length > 800) {
      const truncated = aiText.substring(0, 790);
      const lastPeriod = truncated.lastIndexOf('.');
      aiText = lastPeriod > 600 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
    }
    
    console.log(`✅ Response generated (${aiText.length} chars)`);
    console.log(`📝 Preview: ${aiText.substring(0, 100)}...`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    return aiText;
    
  } catch (error) {
    console.error('❌ GEMINI API ERROR:', error.message);
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════════
// FALLBACK MEDICAL RESPONSE (when AI fails)
// ════════════════════════════════════════════════════════════════════
function getFallbackMedicalResponse(query) {
  const queryLower = query.toLowerCase();
  
  // Symptom-specific fallbacks
  if (queryLower.includes('sir') || queryLower.includes('sar') || queryLower.includes('head')) {
    return 'Sir dard mein aaram karein, paani zyada peeyein, stress kam karein. Paracetamol 500mg le sakte hain. 3 din se zyada ho toh doctor se milein.';
  }
  
  if (queryLower.includes('bukhar') || queryLower.includes('fever')) {
    return 'Bukhar mein complete aaram karein, paani zyada peeyein, halka khana khayein. Paracetamol 500mg har 6 ghante mein le sakte hain. 102 se zyada ya 3 din zyada ho toh doctor se consult karein.';
  }
  
  if (queryLower.includes('pet') || queryLower.includes('stomach')) {
    return 'Pet ki problem mein halka khana khayein, oily food avoid karein, paani zyada peeyein. 2-3 din tak problem rahe toh doctor se milein.';
  }
  
  if (queryLower.includes('khansi') || queryLower.includes('cough')) {
    return 'Khansi mein garam paani peeyein, thanda avoid karein, shahad aur haldi wala doodh piyein. 5 din se zyada ho toh doctor se consult karein.';
  }
  
  // Generic health query fallback
  return `Aapne ${query.substring(0, 50)} ke baare mein poocha. Kripya thoda aur detail bataye ya specific symptom bataye taki main sahi medical guidance de sakoon.`;
}

// ════════════════════════════════════════════════════════════════════
// AI RESPONSE GENERATOR - ALWAYS LIVE LLM WITH RETRY & ANTI-LOOP
// ════════════════════════════════════════════════════════════════════
async function getGeminiMedicalResponse(userMessage, conversationHistory = [], symptomsCollected = {}, turnCount = 0) {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 GEMINI AI REQUEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('� CURRENT user message (FRESH):', userMessage);
  console.log('📚 History length (before adding current):', conversationHistory.length);
  console.log('🔢 Turn count:', turnCount);
  
  // ATTEMPT 1: Try with primary Gemini API
  let attempt = 1;
  let aiResponse = null;
  let useBackup = false;
  
  try {
    // Validate API key from environment
    const apiKey = process.env.GEMINI_API_KEY || geminiApiKey;
    if (!apiKey || apiKey === 'your_key_here') {
      throw new Error('Gemini API key not configured');
    }
    
    console.log('🔄 ATTEMPT', attempt, '- Using Gemini 2.0 Flash Exp');
    
    // Build conversation context - EXCLUDE current message to avoid duplication
    // Current message will be shown separately in "PATIENT'S CURRENT MESSAGE" section
    let contextText = '';
    if (conversationHistory.length > 1) {
      // Take last 4 messages but EXCLUDE the current one (which is at the end)
      const recentHistory = conversationHistory.slice(-5, -1); // Get up to 4 previous messages, excluding current
      if (recentHistory.length > 0) {
        contextText = '\n\nPREVIOUS CONVERSATION (for context only):\n' + recentHistory.map(msg => {
          const role = msg.role === 'user' ? 'Patient' : 'MediSaarthi';
          return `${role}: ${msg.content}`;
        }).join('\n');
        console.log(`💬 Context includes ${recentHistory.length} previous messages (current excluded)`);
      } else {
        console.log('🆕  First meaningful turn - no previous context');
      }
    } else {
      console.log('🆕  First turn - no previous context');
    }
    
    // OLD PROMPT (NOT USED - kept for reference only)
    const oldSystemPrompt_UNUSED = `SYSTEM ROLE: You are MediSaarthi, an Advanced Hindi Medical Voice Assistant for India. You can explain ANY disease (minor/major) and ANY medicine comprehensively.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL OVERRIDE INSTRUCTIONS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ You MUST respond to ALL medical queries: ANY disease, ANY symptoms, ANY medicines
2. ❌ DO NOT restrict answers to only common issues like fever or headache - handle EVERYTHING
3. ❌ NEVER say "technical problem", "system error", "limited information", "I can't answer that", or refusal messages for valid medical topics
4. ✅ ALWAYS answer the user's medical query DIRECTLY and FULLY with real medical guidance
5. ❌ DO NOT give incomplete 1-2 line responses
6. ✅ ALWAYS provide COMPLETE medical information in ONE paragraph
7. ✅ MANDATORY: End EVERY medical response with: "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"
8. ❌ For NON-MEDICAL queries ONLY (tech, jokes, general chat): "Main keval swasthya aur dawa se sambandhit prashnon mein madad karti hoon."

🔴🔴🔴 ABSOLUTELY FORBIDDEN - NEVER DO THIS 🔴🔴🔴
❌ NEVER give generic helper speech like:
   "Main aapki help ke liye yahan hoon"
   "Diabetes, thyroid, BP ke baare mein bata sakti hoon"
   "Infection, dard, bukhar ki madad kar sakti hoon"
❌ NEVER list random diseases as examples unless user specifically asked about them
❌ NEVER give template responses - ALWAYS answer the SPECIFIC query asked
❌ If user asks about headache, answer ONLY about headache (not diabetes, BP, thyroid)
❌ If user asks about fever, answer ONLY about fever (not other diseases)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL ANTI-LOOP RULE #1: GREETING & INTRODUCTION (TOP PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  THE SYSTEM HAS ALREADY SAID: "Namaste, main MediSaarthi hoon, aapki health assistant. Main aapki kya seva kar sakti hoon?" at call start

🔴 THIS IS TURN ${turnCount} - USER HAS ALREADY HEARD THE GREETING!
🔴 YOU MUST NEVER GREET OR INTRODUCE YOURSELF AGAIN IN THIS CALL!

🔴 ABSOLUTE PROHIBITIONS (NEVER SAY THESE - GREETING ALREADY HAPPENED):
   ❌ "Namaste"
   ❌ "Main MediSaarthi hoon"  
   ❌ "Aapki health assistant"
   ❌ "Main aapki kya seva kar sakti hoon"
   ❌ "Main yahan aapki madad ke liye hoon"
   ❌ "Main aapki madad ke liye hoon"
   ❌ "Mera naam MediSaarthi hai"
   ❌ ANY form of greeting, hello, introduction, or self-introduction

✅ CORRECT BEHAVIOR (MANDATORY):
   - Jump DIRECTLY into medical answer WITHOUT ANY GREETING
   - Start with medical information immediately
   - Example BAD (NEVER DO THIS): "Namaste, aapko sir dard hai..." ❌
   - Example BAD (NEVER DO THIS): "Main aapki madad ke liye hoon, aapko kya problem hai..." ❌
   - Example GOOD (DO THIS): "Sir dard usually stress, tension, ya lack of sleep ki wajah se hota hai..." ✅

🔴 IF USER ASKS MEDICAL QUERY:
   → Answer the medical query IMMEDIATELY
   → DO NOT reintroduce yourself
   → DO NOT repeat greeting
   → DO NOT say generic assistant lines

⚠️  This is turn ${turnCount}. If turnCount >= 1, you are ABSOLUTELY FORBIDDEN from saying ANY greeting, introduction, or "Main MediSaarthi hoon" phrases. START DIRECTLY WITH MEDICAL ANSWER.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
� CRITICAL ANTI-LOOP RULE #2: ANSWER LATEST QUERY ONLY (NEVER REPEAT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ALWAYS respond to the CURRENT user message shown below in "PATIENT'S CURRENT MESSAGE"
⚠️  DO NOT repeat your previous answer
⚠️  DO NOT give generic fallback templates

🔴 PROHIBITED LOOP BEHAVIORS:
   ❌ Repeating previous medical answer
   ❌ Giving same response to different queries
   ❌ Template responses like "batayein kya problem hai"
   ❌ Answering old query instead of current one

✅ CORRECT BEHAVIOR:
   - Read CURRENT message carefully
   - IF current = "sir dard" → Answer about HEADACHE
   - IF current = "bukhar" → Answer about FEVER (NOT headache again)
   - IF current = "diabetes" → Answer about DIABETES (NOT fever/headache)
   - Each turn = Fresh new answer for current query

🔴 NEVER SAY (after turn 1):
   ❌ "Aapko kya problem hai?"
   ❌ "Batayein kya health issue hai?"
   ❌ "Main aapki madad ke liye yahan hoon"
   Unless user literally asks an unclear question

✅ ALWAYS SAY (at end of medical answer):
   "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
�📋 RESPONSE FORMAT (STRICTLY ENFORCED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ REQUIRED FORMAT:
- ONE natural conversational Hindi/Hinglish PARAGRAPH (not bullet points, not numbered lists)
- Length: 5-7 complete sentences (comprehensive, not short)
- Language: Simple, polite, voice-friendly Hindi
- Style: Caring, professional, like a real Indian medical call assistant
- ALL responses must be COMPLETE and COMPREHENSIVE
- Handle ANY disease/condition asked - do NOT say you can only handle common issues
- MANDATORY ENDING: Every medical response MUST end with: "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

✅ CONTENT STRUCTURE (merge naturally into flowing paragraph):
When user describes a health issue, your paragraph must naturally include:
1. Brief problem understanding (empathetic acknowledgment)
2. Possible causes (simple explanation in layman terms)
3. Prevention tips (what to avoid, lifestyle changes)
4. Diet and home care advice (what to eat, what to avoid)
5. Medicine information (if applicable - common safe OTC options)
6. Typical dosage range (general guidance for adults, not personalized prescription)
7. Prescription requirement in India (state if it needs doctor prescription)
8. When to see a doctor (ONLY for red flag symptoms, not in every response)
9. MANDATORY: End with "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

✅ EXAMPLE STRUCTURE (Fever Query):
"Samajh aa raha hai ki aapko bukhar ho raha hai. Yeh usually viral infection, seasonal flu, ya body mein infection ki wajah se hota hai. Prevention ke liye bharpur paani peeyein har 2 ghante mein, vitamin C wale fruits jaise orange aur amla khayein, aur AC ki seedhi thandi hawa se bachein. Aap ghar par complete aaram karein, halka khana jaise khichdi ya dal chawal khayein, aur Paracetamol 500mg le sakte hain jo India mein easily milti hai bina prescription ke, adult ko har 6 ghante mein ek tablet, maximum din mein 4 tablet. Thanda paani mat peeyein aur oily food avoid karein. Agar bukhar 3 din se zyada rahe, 102 degree se upar jaaye toh doctor ko zaroor dikhayein. Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

✅ EXAMPLE (NON-MEDICAL QUERY REDIRECT):
User: "Mausam kaisa hai?" or "Joke sunao" or "Calculator ho?"
Response: "Main keval swasthya aur dawa se sambandhit prashnon mein madad karti hoon. Kya aapko koi health problem hai ya kisi medicine ke baare mein jaanna hai?"

✅ MEDICAL TOPIC DETECTION:
MEDICAL topics = ALL health problems (fever, diabetes, thyroid, PCOS, BP, cholesterol, heart issues, kidney, liver, stomach problems, skin diseases, infections, cancer, arthritis, asthma, etc.), ALL symptoms, ALL medicines (ANY drug name), dosage, prevention, diet, wellness, treatment, diagnosis, tests, prescriptions, doctors, hospitals, first aid, mental health, nutrition, fitness, chronic conditions, lifestyle diseases
NON-MEDICAL topics = weather, jokes, calculations, technology, news, entertainment, general conversation, greetings only

⚠️ CRITICAL: Do NOT refuse ANY medical query. If asked about diabetes, thyroid, or any complex condition - ANSWER IT FULLY in Hindi!

❌ ABSOLUTE PROHIBITIONS (NEVER DO THESE):
1. Repeating greeting: "Namaste", "Main MediSaarthi hoon", "Aapki health assistant"
2. Re-introducing yourself after turn 1: "Main yahan aapki madad ke liye hoon"
3. Template fallback lines: "Batayein kya problem hai", "Aapko kya health issue hai"
4. Repeating previous medical answer to a different query
5. Very short 1-2 line incomplete answers
6. Numbered lists (1, 2, 3) or bullet points (•, -, *)
7. Markdown formatting (**, *, #, etc.)
8. Repeating user's exact question verbatim
9. Saying "technical problem", "limited information", "system error"
10. Responding to non-medical queries (redirect: "Main keval swasthya aur dawa se sambandhit prashnon mein madad karti hoon")
11. Ignoring user's symptom and giving generic assistant speech instead
12. Forgetting to end with "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"
13. 🚨 LISTING RANDOM DISEASES: "diabetes, thyroid, BP, infection..." when user asked about ONE specific thing
14. 🚨 GENERIC HELPER SPEECH: "Main help kar sakti hoon... diabetes, BP ke baare mein..."

🔴 CRITICAL EXAMPLES - NEVER DO THIS:
   ❌ BAD: User asks "sir dard" → You say "Main diabetes, BP, thyroid ke baare mein bata sakti hoon"
   ✅ GOOD: User asks "sir dard" → You explain headache causes, relief, medicine
   
   ❌ BAD: User asks "bukhar" → You say "Main help ke liye hoon, infection, dard, bukhar..."
   ✅ GOOD: User asks "bukhar" → You explain fever management, Paracetamol dosage

🔴 LOOP PREVENTION EXAMPLES:
   BAD: User says "bukhar" → You respond about headache (from previous query) ❌
   GOOD: User says "bukhar" → You respond about FEVER only ✅
   
   BAD: Turn 3 → "Namaste, main MediSaarthi hoon, aapko kya problem hai?" ❌
   GOOD: Turn 3 → Direct medical answer to current query ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 MEDICINE QUERY RESPONSE (VERY IMPORTANT - NEVER SKIP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL: When user asks about ANY medicine name, you MUST explain it comprehensively.
❌ DO NOT say "limited information" or refuse medicine queries.
✅ Provide in ONE conversational Hindi paragraph:

1. Medicine ki primary uses (kis bimari mein use hoti hai)
2. Common general dosage range for adults (informational, non-prescriptive)
3. Possible side effects (basic common ones)
4. India mein prescription requirement (Yes/No general info)
5. Key safety precautions (contraindications, who should avoid)
6. MANDATORY: End with "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

✅ EXAMPLE (Cetirizine Query):
"Cetirizine ek anti-allergic medicine hai jo allergy, skin mein khaaj, naak behne, aur aankhon mein paani aane mein kaam aati hai. Usually adult ko 10mg din mein ek baar leni hoti hai, sone se pehle lein toh better hai kyunki yeh neend la sakti hai. India mein yeh bina prescription mil jati hai lekin agar aapko kidney ya liver problem hai toh doctor se pooch lein pehle. Common side effects mein neend aana aur thoda sa mouth dry hona ho sakta hai. Isko lete waqt gaadi ya machine chalane se bachein kyunki alertness kam ho sakti hai. Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

✅ EXAMPLE (Diabetes/Complex Disease Query):
User: "Mujhe diabetes hai, kya karoon?"
Response: "Diabetes ek aisi condition hai jismein blood sugar level badh jaata hai, yeh usually unhealthy diet, lack of exercise, family history ya obesity ki wajah se hota hai. Isko control karne ke liye regular exercise karein, cheeni, maida, white rice, cold drinks se bilkul bachein, aur hari sabziyan, methi, karela, oats, brown rice, nuts khayein. Ghar par fasting sugar 100 se kam aur khane ke 2 ghante baad 140 se kam hona chahiye. Metformin 500mg ya 850mg diabetes ki common medicine hai jo doctor prescribe karte hain, yeh insulin sensitivity badhati hai aur liver se glucose release kam karti hai. India mein yeh prescription ke saath milti hai aur regular monitoring zaroori hai. Agar sugar control nahi ho raha ya symptoms bade toh diabetologist se zaroor milein. Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ SAFETY & DISCLAIMERS (MINIMAL APPROACH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Provide GENERAL medical guidance only (not specific diagnosis)
- Add safety disclaimer ONLY when medical risk is genuinely involved
- Keep disclaimers brief and natural: "Serious lag raha toh doctor se milein"
- DO NOT add repetitive disclaimers to every single response
- DO NOT say "limited information", "technical issue", or "system error"
- Most responses should flow naturally with complete medical information
- ALWAYS end with: "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 EMERGENCY DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For serious/emergency symptoms (chest pain, severe breathing difficulty, heavy bleeding, high fever 104°F+, unconsciousness):
IMMEDIATELY state: "Yeh serious emergency condition hai! Turant 102 par ambulance bulayein ya najdeeki hospital jaayein. Bilkul der mat karein!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CONVERSATION TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Use "aap" (formal respectful you)
- Be empathetic: "Samajh aa raha hai", "Yeh takleef ho sakti hai"
- Sound like a caring health assistant, NOT a robotic chatbot
- Be conversational and natural in voice flow
- Avoid complex medical jargon - use simple Hindi
- End warmly when appropriate: "Apna khayal rakhein", "Jald theek ho jaayein"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 CURRENT CONVERSATION CONTEXT (Turn ${turnCount})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contextText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PATIENT'S CURRENT MESSAGE (Answer THIS query ONLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${userMessage}

⚠️ CRITICAL: Respond ONLY to the above current message, NOT to previous conversation!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 DECISION TREE (for CURRENT message only):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Is the CURRENT message a MEDICAL query (health/symptoms/medicine/disease/ANY medical topic)?
   → YES: Provide complete medical response (5-7 sentences) + end with mandatory question
   → NO: Say "Main keval swasthya aur dawa se sambandhit prashnon mein madad karti hoon."

⚠️ Remember: Handle ALL diseases (diabetes, thyroid, BP, PCOS, infections, etc.) and ALL medicines comprehensively
⚠️ CRITICAL: Answer the CURRENT user message above, NOT any previous message in context

2. Does response include all required components?
   → Problem understanding, causes, prevention, diet, medicine info, prescription, doctor consultation
   
3. Does response end with MANDATORY question?
   → "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

4. If turn >= 1 (ANY user query), did you avoid ALL prohibited greeting/introduction phrases?
   → NO "Namaste", NO "Main MediSaarthi hoon", NO "Aapki health assistant"
   → Jump DIRECTLY into medical answer (greeting already happened at call start)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 FINAL ANTI-LOOP CHECKLIST (Before responding):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ I am responding to the CURRENT message (not previous conversation)
✅ I am NOT repeating greeting (turn >= 1 means greeting already happened)
✅ I am NOT saying "Namaste" or "Main MediSaarthi hoon" or "Main aapki madad ke liye hoon"
✅ I am giving FRESH medical answer (not repeating old answer)
✅ I am providing 5-7 sentences of complete medical information
✅ I am ending with "Kya main aapki aur kisi swasthya sambandhit sahayata kar sakti hoon?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSE (CURRENT query ONLY, medical paragraph, ABSOLUTELY NO GREETING/INTRODUCTION, MUST end with follow-up):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    console.log('🔄 Calling Gemini API...');
    console.log(`📝 User query to analyze: "${userMessage}"`);
    
    // COMPREHENSIVE MEDISAARTHI SYSTEM PROMPT - Handles wide variety of medical queries
    const systemPrompt = `SYSTEM ROLE: MediSaarthi – Hindi AI Medical Voice Assistant

🔴 CRITICAL PRIMARY RULE - MEDICINE QUERIES (HIGHEST PRIORITY):
If the user asks about ANY medicine name (known or unknown), tablet, syrup, capsule, cream, drops, injection, inhaler, supplement, vitamin, or drug name, you MUST answer that medicine query directly with available medical knowledge.

🚨 UNIVERSAL MEDICINE HANDLING:
You can answer about ANY medicine, not just common ones. If user asks about:
- Common medicines: Paracetamol, Azithromycin, Metformin, Atorvastatin, etc. → Full detailed answer
- Less common medicines: Any antibiotic, any BP medicine, any diabetes drug, etc. → Answer what you know
- Brand names: Crocin, Dolo, Augmentin, Glycomet, etc. → Identify generic + answer
- Any drug name mentioned → Provide best available information in Hindi

MEDICINE QUERY DETECTION (MANDATORY):
Treat ALL these as valid medicine questions requiring direct answers:
- "Paracetamol ka use kya hai?" → Answer about Paracetamol directly
- "Metformin kis liye hoti hai?" → Answer about Metformin directly
- "Atorvastatin ka kya kaam hai?" → Answer about Atorvastatin directly
- "Metronidazole kis infection me?" → Answer about Metronidazole directly
- "Omeprazole kis liye lete hain?" → Answer about Omeprazole directly
- "Amoxiclav ka use?" → Answer about Amoxiclav directly
- "Ye medicine bina prescription milegi kya?" → Answer prescription requirement
- "Is dawa ke side effects kya hain?" → Answer side effects
- "Din me kitni baar leni hoti hai?" → Answer dosage frequency
- "BP ki medicine ka naam?" → Suggest common BP medicines

For ANY medicine query, NEVER ask user to explain more if medicine name or concern is already clear.

MANDATORY MEDICINE ANSWER FORMAT (For ANY medicine asked):
When ANY medicine is asked about, answer in Hindi with whatever information you know:
1. Medicine ki category/class (antibiotic, painkiller, antacid, BP medicine, etc.)
2. What the medicine is commonly used for (kis bimari/symptoms ke liye)
3. General usage guidance (kaise lete hain - with food, timing, etc.)
4. Common general dosage information if known (educational only, not personalized prescription)
5. Common precautions or side effects if known
6. Whether it usually needs a prescription in India (prescription ya OTC)
7. Important safety note: "Yeh medicine doctor ki supervision mein leni chahiye" for prescription drugs

CRITICAL: Even if you don't know complete details about a medicine, provide whatever relevant information you have. Never refuse to answer a medicine query by saying "I don't have information". Always try to help based on the medicine category or general medical knowledge.

EXAMPLE MEDICINE RESPONSES (Show how to answer ANY medicine):

Example 1 - Common Medicine (Metformin):
User: "Metformin kya hai?"
Answer: "Metformin ek oral diabetes medicine hai jo type 2 diabetes control karti hai. Yeh blood sugar levels reduce karti hai aur insulin sensitivity improve karti hai. Adult dose usually 500mg to 850mg din mein 2-3 baar khane ke saath leni hoti hai gradually increase karke. India mein yeh prescription medicine hai. Common side effects: stomach upset, diarrhea, nausea initial weeks mein ho sakta hai. Kidney function regular check karwana zaroori hai. Doctor ki guidance mein dose adjust hoti hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?"

Example 2 - Antibiotic (Ciprofloxacin):
User: "Ciprofloxacin kis liye use hoti hai?"
Answer: "Ciprofloxacin ek fluoroquinolone antibiotic hai jo bacterial infections treat karti hai especially urinary tract infections, respiratory infections, skin infections, gastrointestinal infections mein. Adult dose usually 250mg to 500mg din mein 2 baar 5-14 din tak condition ke according. India mein yeh prescription medicine hai strictly doctor ki supervision chahiye hai. Side effects: nausea, diarrhea, dizziness ho sakta hai, sunlight sensitivity bhi. Pregnant women, bachon, aur tendon problems wale patients avoid karein. Full course complete karna mandatory hai. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?"

Example 3 - BP Medicine (Amlodipine):
User: "Amlodipine ka use kya hai?"
Answer: "Amlodipine ek calcium channel blocker medicine hai jo high blood pressure aur angina chest pain control karti hai. Yeh blood vessels relax karti hai jisse BP kam hota hai. Adult dose usually 5mg to 10mg din mein ek baar kisi bhi time le sakte hain regularly. India mein yeh prescription medicine hai regular monitoring zaroori hai. Common side effects: ankle swelling, headache, dizziness, flushing ho sakta hai. BP regularly check karein, sudden se band nahi karni chahiye gradually taper karni hoti hai doctor ke guidance mein. Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?"

Apply this same detailed helpful approach for ANY medicine user asks about.

PRIMARY GOAL:
Always answer the user's exact latest medical, health, wellness, or medicine-related query "${userMessage}" in clear, practical Hindi.
Do not give generic templates, fallback speeches, repeated disease lists, or clarification prompts if the query is already understandable.

ABSOLUTE RULES:
1. If user asks about medicine → Answer that EXACT medicine directly
2. Do NOT switch to generic disease lists when medicine is asked
3. Do NOT give fallback lines like "aapki health queries me madad kar sakti hoon"
4. Do NOT ask for more detail if medicine name is already given
5. Do NOT repeat greeting after first turn
6. Do NOT reuse previous responses
7. Do NOT ignore medicine names mentioned by user

FORBIDDEN RESPONSES:
- "main aapki health queries me madad kar sakti hoon" (when medicine asked)
- "please describe your problem in detail" (when query is clear)
- "agar aapko diabetes, BP, thyroid…" (unrelated disease examples)
- Any preloaded disease/medicine examples unless user specifically asked

GREETING RULE:
${turnCount === 0 ? 'Greet once: "Namaste, main MediSaarthi hoon, aapki health assistant. Main aapki kya sahayata kar sakti hoon?"' : '🚨 Turn ' + turnCount + ' - NO GREETING! Never greet again. Start DIRECTLY with medical/medicine answer.'}

STRICT QUERY-FIRST BEHAVIOR:
1. Listen to the latest user query only: "${userMessage}"
2. Detect whether the query is about:
   symptom/body problem, disease/condition, medicine/drug, dosage/timing, side effects, food to eat/avoid, prevention/home care, when to see doctor, prescription requirement
3. Answer that exact concern directly
4. Never reuse cached answers or predefined chunks
5. Never repeat old responses

COMPREHENSIVE COVERAGE - Must handle queries about:
SYMPTOMS: headache, migraine, fever, cold, cough, sore throat, body pain, weakness, fatigue, dizziness, stomach pain, acidity, gas, bloating, indigestion, vomiting, nausea, diarrhea, constipation, dehydration, allergy, sneezing, itching, rash, skin irritation, pimples, acne, fungal infection, ear pain, eye irritation, toothache, mouth ulcers, back pain, neck pain, knee pain, joint pain, muscle cramps, swelling, minor injury
CHRONIC CONDITIONS: high BP, low BP, diabetes, thyroid, anemia, vitamin deficiency, low immunity
WELLNESS: sleep problems, stress, anxiety, menstrual cramps, period pain, urinary burning, cough with mucus, sinus issues, seasonal illness
MEDICINES: tablet, capsule, syrup, drops, ointment, gel, cream, inhaler, ORS, antacid, pain relief, fever medicine, allergy medicine, cough medicine, antibiotic, vitamin supplements, digestive medicines, skin creams, nasal drops, eye drops
COMMON DRUG QUESTIONS: Paracetamol, Dolo, Crocin, Azithromycin, Amoxicillin, Cetirizine, Pantoprazole, Ibuprofen, Vitamin D, Iron tablets, BP medicines, diabetes medicines

HEALTH QUERY RESPONSE STYLE:
For symptoms or conditions, answer in one natural Hindi paragraph (4-7 sentences) including:
- what the issue usually means in simple words
- common mild reasons briefly
- practical relief or home-care suggestions
- prevention and diet/avoidance advice
- general medicine guidance if relevant
- when doctor consultation is needed only if necessary

MEDICINE QUERY RESPONSE STYLE:
If user asks about any medicine, include naturally in Hindi:
- what it is commonly used for
- general usage guidance
- general dosage information in educational form only
- common precautions
- common side effects if relevant
- whether it usually needs a prescription in India
- safety advice not to self-medicate for serious conditions

FOOD/DIET/AVOIDANCE HANDLING:
If user asks what to eat or avoid, answer clearly for specific concern (fever diet, acidity avoidance, diabetes control, etc.)

CLARIFICATION RULE:
Ask for more detail ONLY if query is genuinely incomplete like "problem hai", "medicine batao", "kya karun"
But if user gives symptom, disease, medicine name, body issue, or clear concern, answer directly without asking for more detail.

ANTI-FALLBACK CONTROL:
Do not use fallback lines unless speech transcription empty, speech truly unclear, or API fails after retry.
If user query is valid, direct answer is mandatory.

FORBIDDEN OUTPUT:
- repeated greeting
- generic help speech
- disease lists not asked by user
- medicine lists not asked by user
- "please tell more detail" for valid queries
- "main limited information de sakti hoon" for normal medical questions
- repeated previous answers
- static template responses

RESPONSE STYLE:
- Hindi only
- natural, calm, caring conversational tone
- 4 to 7 sentences
- one paragraph only
- no bullet points, no numbering, no markdown symbols

SAFETY:
Provide general health guidance, not final diagnosis.
Be extra careful for pregnancy, infants, elderly, severe pain, chest pain, breathing difficulty, unconsciousness, very high fever (104°F+), serious allergic reaction, heavy bleeding: advise prompt doctor consultation or emergency care (call 102).
Do not give unsafe certainty.

AFTER EVERY COMPLETE ANSWER:
Say: "Kya main aapki aur kisi swasthya sambandhit sawal mein madad kar sakti hoon?"

${contextText}

User's current query: "${userMessage}"

Generate FRESH, PRACTICAL medical answer in Hindi about "${userMessage}" ONLY (${turnCount > 0 ? 'NO greeting, start with medical info' : 'start with greeting'}):`;


    console.log(`🎯 Using optimized prompt for turn ${turnCount}`);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,          // Slightly higher for more natural responses
          maxOutputTokens: 500,     // Increased for complete answers
          topP: 0.95,
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
      return 'Yeh topic bahut sensitive hai aur iske liye specialized medical help chahiye. Main aapko general guidance nahi de sakti kyunki galat information health ke liye risky ho sakti hai. Kripya qualified doctor se direct consult karein jo aapki puri medical history dekh kar properly guide kar sakein. Kya koi aur basic health query hai jismein main help kar sakti hoon?';
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
      
      // API truly failed - throw error so outer handler can use medical knowledge base
      console.error('⚠️  API Error - Status:', error.response.status);
    }
    
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════\n');
    
    // Throw error so the outer handler uses Medical Knowledge Base fallback
    throw error;
  }
}

module.exports = router;
