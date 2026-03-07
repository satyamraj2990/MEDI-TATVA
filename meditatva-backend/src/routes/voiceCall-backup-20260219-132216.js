const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const speechToTextApiKey = process.env.GOOGLE_SPEECH_API_KEY;
const textToSpeechApiKey = process.env.GOOGLE_TTS_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

// Initialize Twilio client only if credentials are properly configured
let client = null;
if (accountSid && accountSid.startsWith('AC') && authToken) {
  client = twilio(accountSid, authToken);
}
const VoiceResponse = twilio.twiml.VoiceResponse;

// Store active call sessions
const callSessions = new Map();

// Store active conference sessions
const conferenceSessions = new Map();

// Initiate outbound call
router.post('/initiate-call', async (req, res) => {
  try {
    const { phoneNumber, patientName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if we have a public URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
      return res.status(400).json({ 
        error: 'Public URL required', 
        message: 'Twilio requires a public URL. Please use ngrok or deploy to a public server.',
        instructions: 'Run: ngrok http 3000, then set BACKEND_URL to the ngrok URL in .env'
      });
    }

    console.log(`📞 Initiating call to: ${phoneNumber}`);
    console.log(`🌐 Using webhook URL: ${backendUrl}/api/voice-call/handle-call`);
    console.log(`📱 From number: ${twilioPhoneNumber}`);

    const call = await client.calls.create({
      url: `${backendUrl}/api/voice-call/handle-call`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${backendUrl}/api/voice-call/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    console.log(`✅ Call initiated successfully to ${phoneNumber}`);
    console.log(`📋 Call SID: ${call.sid}`);
    console.log(`📊 Call Status: ${call.status}`);

    callSessions.set(call.sid, {
      patientName: patientName || 'Patient',
      conversationHistory: [],
      startTime: new Date()
    });

    res.json({ 
      success: true, 
      callSid: call.sid,
      status: call.status,
      message: 'Call initiated successfully. You will receive a call shortly.'
    });
  } catch (error) {
    console.error('❌ Error initiating call:', error.message);
    console.error('📋 Error details:', error);
    
    // Check for specific Twilio errors
    let errorMessage = 'Failed to initiate call';
    let errorType = 'unknown';
    
    if (error.message && error.message.includes('unverified')) {
      errorType = 'unverified_number';
      errorMessage = 'Phone number not verified for Twilio trial account';
    } else if (error.message && error.message.includes('not valid')) {
      errorType = 'invalid_number';
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 21201) {
      errorType = 'invalid_number';
      errorMessage = 'Invalid phone number';
    } else if (error.code === 21212) {
      errorType = 'invalid_country';
      errorMessage = 'Invalid phone number format or country code';
    } else if (error.code === 21608) {
      errorType = 'unverified_number';
      errorMessage = 'Unverified number - Twilio trial account limitation';
    }
    
    res.status(400).json({ 
      success: false,
      error: errorMessage,
      errorType: errorType,
      details: error.message,
      twilioCode: error.code || null,
      help: errorType === 'unverified_number' 
        ? 'Trial accounts can only call verified numbers. Verify your number at: https://www.twilio.com/console/phone-numbers/verified'
        : null
    });
  }
});

// Handle incoming call (Twilio webhook)
router.post('/handle-call', async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎤 HANDLE-CALL WEBHOOK RECEIVED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CallSid:', req.body.CallSid);
    console.log('📋 From:', req.body.From);
    console.log('📋 To:', req.body.To);
    console.log('📋 CallStatus:', req.body.CallStatus);
    console.log('📋 Full Request Body:', JSON.stringify(req.body, null, 2));
    
    const twiml = new VoiceResponse();
    const callSid = req.body.CallSid;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    // Initialize session if doesn't exist
    if (!callSessions.has(callSid)) {
      callSessions.set(callSid, {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0
      });
      console.log('✅ New call session created for:', callSid);
    }
    
    // Hindi welcome greeting - No echo, speech input only
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
      hints: 'bukhar,sar dard,dard,dawai,doctor,symptoms,khansi,thanda,pet dard,diabetes,blood pressure,dil,chest,saans'
      // CRITICAL: NO record=true to prevent echo
    });

    gather.say(
      {
        voice: 'Polly.Aditi',
        language: 'hi-IN'
      },
      'Namaste, main MediSaarthi hoon, aapki health assistant. Main aapki kya seva kar sakti hoon? Kripya apni health concern batayein.'
    );

    // Fallback if no speech detected - ask again in Hindi
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Mujhe kuch sunayi nahi diya. Kripya dobara bolein.'
    );
    twiml.redirect(`${backendUrl}/api/voice-call/handle-call`);

    console.log('📤 Sending TwiML response');
    console.log('📄 TwiML:', twiml.toString());
    
    res.type('text/xml');
    res.send(twiml.toString());
    
    console.log('✅ TwiML response sent successfully');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌❌❌ CRITICAL ERROR in handle-call ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Emergency fallback - always return valid TwiML
    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Aditi', language: 'en-IN' },
      'Sorry, I am facing a technical issue. Please try calling again later.'
    );
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Process speech input
router.post('/process-speech', async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🗣️ PROCESS-SPEECH WEBHOOK RECEIVED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 Full Request Body:', JSON.stringify(req.body, null, 2));
    
    const speechResult = req.body.SpeechResult;
    const callSid = req.body.CallSid;
    const confidence = parseFloat(req.body.Confidence || 0);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    console.log(`🎯 Speech: "${speechResult}"`);
    console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`📱 CallSid: ${callSid}`);

    // Validate speech input
    if (!speechResult || speechResult.trim() === '') {
      console.warn('⚠️ Empty speech result received');
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe aapki baat saaf saaf sunai nahi di. Kripya thoda zor se bolein.'
      );
      
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
        // NO record=true - prevents echo
      });
      
      gather.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Aapki health problem kya hai?');
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Low confidence handling - Hindi response
    if (confidence < 0.4) {
      console.warn(`⚠️ Low confidence (${(confidence * 100).toFixed(1)}%), asking user to repeat`);
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe aapki baat samajh nahi aayi. Kripya dobara bolein.'
      );
      
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
        // NO record to avoid echo
      });
      
      gather.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Kripya phir se batayein.');
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Get or create session
    let session = callSessions.get(callSid);
    if (!session) {
      console.warn('⚠️ Session not found, creating new one');
      session = {
        conversationHistory: [],
        patientName: 'Patient',
        startTime: new Date(),
        turnCount: 0
      };
      callSessions.set(callSid, session);
    }
    
    session.turnCount = (session.turnCount || 0) + 1;
    console.log(`📈 Conversation turn: ${session.turnCount}`);

    // Check for emergency keywords
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'cant breathe', 'cannot breathe', 'suicide', 'severe bleeding', 'heavy bleeding'];
    const isEmergency = emergencyKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      console.log('🚨🚨🚨 EMERGENCY DETECTED 🚨🚨🚨');
      console.log('Emergency keywords found in:', speechResult);
      
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Yeh emergency situation hai. Kripya turant 102 par ambulance bulayein ya najdeeki hospital jaayein. Der mat karein. Apna khayal rakhein.'
      );
      twiml.hangup();
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Add user message to conversation history
    session.conversationHistory.push({
      role: 'user',
      content: speechResult,
      timestamp: new Date()
    });
    
    console.log(`📝 Added to history (total messages: ${session.conversationHistory.length})`);

    // Get AI response from Gemini with timeout protection
    console.log('🤖 Requesting AI response from Gemini...');
    let aiResponse;
    let retryCount = 0;
    const maxRetries = 1; // Reduced retries for faster failure
    const responseStartTime = Date.now();
    
    while (retryCount <= maxRetries) {
      try {
        // Add timeout wrapper for Gemini call
        const responsePromise = getGeminiResponse(speechResult, session.conversationHistory);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini response timeout')), 15000) // 15s max for Twilio compatibility
        );
        
        aiResponse = await Promise.race([responsePromise, timeoutPromise]);
        
        if (aiResponse && aiResponse.trim().length > 0) {
          const responseTime = Date.now() - responseStartTime;
          console.log(`✅ AI Response received successfully in ${responseTime}ms`);
          console.log('📝 Response:', aiResponse);
          break;
        }
      } catch (aiError) {
        retryCount++;
        const attemptTime = Date.now() - responseStartTime;
        console.error(`❌ Gemini API attempt ${retryCount} failed after ${attemptTime}ms:`, aiError.message);
        if (retryCount > maxRetries) {
          console.error('❌ All retry attempts exhausted, using fallback');
          aiResponse = 'Mujhe maaf karein, response aane mein time lag raha hai. Kripya apna sawal short rakhein. Kya main kuch specific bata sakti hoon?';
        } else {
          console.log(`🔄 Retrying immediately... (${retryCount}/${maxRetries})`);
        }
      }
    }

    // Add AI response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Update session
    callSessions.set(callSid, session);
    console.log('💾 Session updated');

    // Create TwiML response with Hindi conversation flow - NO ECHO
    const twiml = new VoiceResponse();
    
    // Say the AI response in Hindi
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      aiResponse
    );
    
    // Add a brief pause for natural conversation
    twiml.pause({ length: 1 });
    
    // Continue listening for follow-up without asking explicitly - NO record to prevent echo
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
      hints: 'haan,nahi,bukhar,sar dard,dard,dawai,doctor,symptoms,shukriya,alvida,dhanyavaad'
      // CRITICAL: NO record=true - this prevents user audio echo playback
    });

    // No explicit "Kya aapko kuch aur poochna hai?" after every response
    // Let the user speak naturally if they have more questions

    // Fallback - end call gracefully in Hindi after silence/timeout
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Dhanyavaad MediSaarthi use karne ke liye. Apna khayal rakhein. Namaste.'
    );
    twiml.hangup();

    console.log('📤 Sending TwiML response with AI answer');
    console.log('📄 TwiML length:', twiml.toString().length);
    
    res.type('text/xml');
    res.send(twiml.toString());
    
    console.log('✅ Response sent successfully');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌❌❌ CRITICAL ERROR in process-speech ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    // Emergency fallback with valid TwiML
    try {
      const twiml = new VoiceResponse();
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe maaf karein, mujhe technical problem ho rahi hai. Kripya thodi der baad dobara call karein, ya doctor se consult karein.'
      );
      
      twiml.pause({ length: 1 });
      twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Dhanyavaad.');
      twiml.hangup();
      
      res.type('text/xml');
      res.send(twiml.toString());
      
      console.log('📤 Emergency fallback TwiML sent');
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError.message);
      // Last resort - minimal valid TwiML
      res.type('text/xml');
      res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error</Say><Hangup/></Response>');
    }
  }
});

// Initiate conference call - Host gets called first
router.post('/initiate-conference', async (req, res) => {
  try {
    const { phoneNumber, conferenceName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Your phone number is required to start conference' });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
      return res.status(400).json({ 
        error: 'Public URL required', 
        message: 'Twilio requires a public URL. Please use ngrok or deploy to a public server.'
      });
    }

    const confName = conferenceName || `MediConf-${Date.now()}`;
    
    // Initialize conference session
    conferenceSessions.set(confName, {
      hostNumber: phoneNumber,
      participants: [],
      conversationHistory: [],
      startTime: new Date(),
      aiJoined: false
    });

    // Call the host first
    const call = await client.calls.create({
      url: `${backendUrl}/api/voice-call/conference-host?conferenceName=${encodeURIComponent(confName)}`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${backendUrl}/api/voice-call/conference-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    
    conferenceSessions.get(confName).participants.push({
      phoneNumber,
      callSid: call.sid,
      status: 'calling',
      role: 'host'
    });

    console.log(`✅ Conference ${confName} initiated - calling host ${phoneNumber}`);

    res.json({ 
      success: true, 
      conferenceName: confName,
      callSid: call.sid,
      message: 'Conference started - you will receive a call',
      addParticipantUrl: `${backendUrl}/api/voice-call/add-to-conference`
    });
  } catch (error) {
    console.error('Error initiating conference:', error);
    res.status(500).json({ error: 'Failed to initiate conference', details: error.message });
  }
});

// Add participant to existing conference
router.post('/add-to-conference', async (req, res) => {
  try {
    const { conferenceName, phoneNumber, participantName } = req.body;

    if (!conferenceName || !phoneNumber) {
      return res.status(400).json({ error: 'Conference name and phone number required' });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    if (!conferenceSessions.has(conferenceName)) {
      return res.status(404).json({ error: 'Conference not found or already ended' });
    }

    // Call the new participant
    const call = await client.calls.create({
      url: `${backendUrl}/api/voice-call/join-conference?conferenceName=${encodeURIComponent(conferenceName)}`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${backendUrl}/api/voice-call/conference-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    const session = conferenceSessions.get(conferenceName);
    session.participants.push({
      phoneNumber,
      callSid: call.sid,
      status: 'calling',
      role: 'participant',
      name: participantName
    });

    console.log(`✅ Added ${phoneNumber} to conference ${conferenceName}`);

    res.json({
      success: true,
      message: `Calling ${participantName || phoneNumber}`,
      callSid: call.sid
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant', details: error.message });
  }
});

// Conference host endpoint - first person to join
router.post('/conference-host', async (req, res) => {
  const conferenceName = req.query.conferenceName;
  const callSid = req.body.CallSid;
  
  console.log(`🎤 Host joining conference: ${conferenceName}, CallSid: ${callSid}`);
  
  const twiml = new VoiceResponse();
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  // Greet the host
  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Namaste! Aap Medi Saarthi Conference Call mein hain. Main aapka medical assistant hoon. Aap aur aapke friends ya family ke members, sabhi log apne medical questions pooch sakte hain. Main sabka jawab dungi.'
  );

  twiml.pause({ length: 1 });

  // Join conference with AI listening and continuous interaction
  const dial = twiml.dial();
  const conf = dial.conference({
    startConferenceOnEnter: true,
    endConferenceOnExit: true,
    waitUrl: '',
    beep: false,
    coach: callSid, // Allow this participant to hear everything
    statusCallback: `${backendUrl}/api/voice-call/conference-event`,
    statusCallbackEvent: ['start', 'end', 'join', 'leave', 'speaker']
  }, conferenceName);

  // After joining, immediately start listening for questions
  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Aap apna question pooch sakte hain.'
  );
  
  // Redirect to speech processing for continuous interaction
  twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(conferenceName)}&callSid=${callSid}`);

  res.type('text/xml');
  res.send(twiml.toString());
});

// Join conference call - for additional participants
router.post('/join-conference', async (req, res) => {
  const conferenceName = req.query.conferenceName;
  const callSid = req.body.CallSid;
  
  console.log(`🎤 Participant joining conference: ${conferenceName}, CallSid: ${callSid}`);
  
  const twiml = new VoiceResponse();
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Namaste! Aap Medi Saarthi conference call mein shamil ho rahe hain. Main sabhi participants ke questions ka jawab dungi.'
  );

  // Join conference
  const dial = twiml.dial();
  dial.conference({
    startConferenceOnEnter: false, // Don't start for participants
    endConferenceOnExit: false,
    beep: 'false',
    statusCallback: `${backendUrl}/api/voice-call/conference-event`,
    statusCallbackEvent: ['start', 'end', 'join', 'leave', 'speaker']
  }, conferenceName);

  res.type('text/xml');
  res.send(twiml.toString());
});

// Conference wait music/message
router.post('/conference-wait', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN', loop: 3 },
    'Kripya pratiksha karein. Baaki participants jald hi shamil honge.'
  );
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Conference listen - continuous speech gathering for all participants
router.post('/conference-listen', async (req, res) => {
  const conferenceName = req.query.conferenceName;
  const callSid = req.query.callSid || req.body.CallSid;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  console.log(`👂 Conference ${conferenceName} - Listening for speech from any participant`);
  
  const twiml = new VoiceResponse();
  
  // Gather speech from anyone in the conference
  const gather = twiml.gather({
    input: 'speech',
    action: `${backendUrl}/api/voice-call/process-conference-speech?conferenceName=${encodeURIComponent(conferenceName)}`,
    method: 'POST',
    speechTimeout: 'auto',
    timeout: 5,
    language: 'hi-IN,en-IN',
    profanityFilter: false,
    speechModel: 'phone_call',
    enhanced: true,
    hints: 'bukhar,fever,headache,dard,pain,medicine,doctor,symptoms,pet dard,sar dard,cough,cold,diabetes,blood pressure'
  });

  gather.pause({ length: 2 });

  // If no speech detected, loop back
  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Koi aur question? Sabhi log pooch sakte hain.'
  );
  twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(conferenceName)}&callSid=${callSid}`);
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Conference event handler
router.post('/conference-event', async (req, res) => {
  const event = req.body.StatusCallbackEvent;
  const conferenceName = req.body.FriendlyName;
  const callSid = req.body.CallSid;
  
  console.log(`📞 Conference ${conferenceName} - Event: ${event}, CallSid: ${callSid}`);

  if (event === 'conference-start' && conferenceSessions.has(conferenceName)) {
    const session = conferenceSessions.get(conferenceName);
    
    // Add AI assistant when conference starts (only once)
    if (!session.aiJoined) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      
      try {
        await client.calls.create({
          url: `${backendUrl}/api/voice-call/ai-participant?conferenceName=${encodeURIComponent(conferenceName)}`,
          from: twilioPhoneNumber,
          to: twilioPhoneNumber,
          statusCallback: `${backendUrl}/api/voice-call/conference-status`
        });
        
        session.aiJoined = true;
        console.log(`🤖 AI assistant added to conference ${conferenceName}`);
      } catch (error) {
        console.error('Error adding AI to conference:', error);
      }
    }
  }

  if (event === 'participant-join' && conferenceSessions.has(conferenceName)) {
    const session = conferenceSessions.get(conferenceName);
    const participant = session.participants.find(p => p.callSid === callSid);
    if (participant) {
      participant.status = 'joined';
    }
  }

  if (event === 'participant-leave' && conferenceSessions.has(conferenceName)) {
    const session = conferenceSessions.get(conferenceName);
    const participant = session.participants.find(p => p.callSid === callSid);
    if (participant) {
      participant.status = 'left';
    }
  }

  res.sendStatus(200);
});

// AI participant handler
router.post('/ai-participant', async (req, res) => {
  const conferenceName = req.query.conferenceName;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  console.log(`🤖 AI joining conference: ${conferenceName}`);
  
  const twiml = new VoiceResponse();
  
  // Greet all participants
  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Namaste sabhi ko. Main Medi Call Sarthi hoon. Aap sabhi apne medical questions pooch sakte hain. Ek baar mein ek vyakti bolein.'
  );

  // Join conference and listen
  const dial = twiml.dial();
  const conference = dial.conference({
    startConferenceOnEnter: false,
    endConferenceOnExit: false,
    waitUrl: '',
    statusCallback: `${backendUrl}/api/voice-call/conference-event`,
    statusCallbackEvent: ['start', 'end', 'join', 'leave']
  }, conferenceName);

  // Gather speech from anyone in conference
  const gather = twiml.gather({
    input: 'speech',
    action: `${backendUrl}/api/voice-call/process-conference-speech?conferenceName=${encodeURIComponent(conferenceName)}`,
    method: 'POST',
    speechTimeout: 'auto',
    timeout: 10,
    language: 'hi-IN,en-IN',
    profanityFilter: false,
    speechModel: 'phone_call',
    enhanced: true
  });

  gather.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Aap apna question pooch sakte hain.'
  );

  res.type('text/xml');
  res.send(twiml.toString());
});

// Process speech from conference - responds to all participants
router.post('/process-conference-speech', async (req, res) => {
  console.log('🗣️ CONFERENCE SPEECH received from any participant!');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const speechResult = req.body.SpeechResult;
    const conferenceName = req.query.conferenceName;
    const callSid = req.body.CallSid;
    const confidence = parseFloat(req.body.Confidence || 0);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    console.log(`🎯 Conference: ${conferenceName} | Speaker: ${callSid} | Speech: "${speechResult}" | Confidence: ${confidence}`);

    if (!speechResult || confidence < 0.3) {
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Mujhe samajh nahi aaya. Jo bhi bola, kripya phir se thoda loud aur clear bolein.'
      );
      twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(conferenceName)}&callSid=${callSid}`);
      return res.type('text/xml').send(twiml.toString());
    }

    // Get or create conference session
    let session = conferenceSessions.get(conferenceName) || {
      participants: [],
      conversationHistory: [],
      startTime: new Date()
    };

    // Check for goodbye/end keywords
    const endKeywords = ['bye', 'goodbye', 'thank you', 'dhanyavaad', 'alvida', 'shukriya', 'khatam', 'end'];
    const wantsToEnd = endKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    );

    if (wantsToEnd && speechResult.split(' ').length <= 3) {
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Dhanyavaad sabhi ko! Apna aur apne family ka khayal rakhein. Agar zaroorat ho toh doctor se milein. Namaste!'
      );
      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Check for emergency
    const emergencyKeywords = ['chest pain', 'breathing problem', 'sans nahi aa rahi', 'dil ka dard', 'bleeding', 'heart attack', 'stroke', 'emergency', 'ambulance', 'behosh', 'unconscious'];
    const isEmergency = emergencyKeywords.some(keyword => 
      speechResult.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      const twiml = new VoiceResponse();
      twiml.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'Yeh emergency situation lag raha hai! Sabhi participants kripya turant 102 par ambulance call karein ya najdeeki hospital jaayein. Deri mat karein!'
      );
      
      // Continue conference for other questions
      twiml.pause({ length: 2 });
      twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(conferenceName)}&callSid=${callSid}`);
      return res.type('text/xml').send(twiml.toString());
    }

    // Add to conversation history with caller identification
    session.conversationHistory.push({
      role: 'user',
      content: speechResult,
      timestamp: new Date(),
      callSid: callSid,
      participantNumber: session.participants.findIndex(p => p.callSid === callSid) + 1
    });

    // Get AI response with conference context
    console.log('🤖 Getting Gemini response for conference question...');
    const contextMessage = `Conference call with ${session.participants.length} participants. Question: ${speechResult}`;
    const aiResponse = await getGeminiResponse(contextMessage, session.conversationHistory);
    console.log('✅ AI Response:', aiResponse);

    // Add AI response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Update session
    conferenceSessions.set(conferenceName, session);

    // Respond to everyone in conference
    const twiml = new VoiceResponse();
    
    // Acknowledge the speaker and answer
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      aiResponse
    );
    
    // Pause and ask for more questions from anyone
    twiml.pause({ length: 1 });
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Koi aur question? Sabhi log pooch sakte hain.'
    );
    
    // Continue listening for more questions
    twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(conferenceName)}&callSid=${callSid}`);

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('❌ Error processing conference speech:', error);
    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Maaf kijiye, technical problem hai. Koi aur question? Phir se boliye.'
    );
    twiml.redirect(`${backendUrl}/api/voice-call/conference-listen?conferenceName=${encodeURIComponent(req.query.conferenceName)}&callSid=${req.body.CallSid}`);
    res.type('text/xml').send(twiml.toString());
  }
});

// Conference status callback
router.post('/conference-status', (req, res) => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;
  
  console.log(`Conference call ${callSid} status: ${callStatus}`);

  if (callStatus === 'completed' || callStatus === 'failed') {
    // Check if this was the last participant
    for (const [confName, session] of conferenceSessions.entries()) {
      const participant = session.participants.find(p => p.callSid === callSid);
      if (participant) {
        participant.status = 'completed';
        
        // If all participants left, clean up
        const allLeft = session.participants.every(p => 
          p.status === 'completed' || p.status === 'left' || p.status === 'failed'
        );
        
        if (allLeft) {
          console.log(`🧹 Cleaning up conference ${confName}`);
          conferenceSessions.delete(confName);
        }
      }
    }
  }

  res.sendStatus(200);
});

// Call status callback - improved with detailed logging
router.post('/call-status', (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;
    const callDuration = req.body.CallDuration;
    const from = req.body.From;
    const to = req.body.To;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📞 CALL STATUS UPDATE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📱 CallSid: ${callSid}`);
    console.log(`📊 Status: ${callStatus}`);
    console.log(`⏱️ Duration: ${callDuration || 0} seconds`);
    console.log(`📞 From: ${from} → To: ${to}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up session on call end
    if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer' || callStatus === 'canceled') {
      if (callSessions.has(callSid)) {
        const session = callSessions.get(callSid);
        console.log(`🗑️ Cleaning up session for ${callSid}`);
        console.log(`   - Conversation turns: ${session.turnCount || 0}`);
        console.log(`   - Messages exchanged: ${session.conversationHistory?.length || 0}`);
        callSessions.delete(callSid);
        console.log('✅ Session cleaned up successfully\n');
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error in call-status handler:', error.message);
    res.sendStatus(200); // Still return 200 to Twilio
  }
});

// Get AI response from Gemini with robust error handling
async function getGeminiResponse(userMessage, conversationHistory = []) {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 GEMINI AI REQUEST STARTED');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📞 User message:', userMessage);
  console.log('📚 Conversation history length:', conversationHistory.length);
  
  try {
    // Validate API key
    if (!geminiApiKey || geminiApiKey === 'your_key_here') {
      console.error('❌ Gemini API key not configured');
      throw new Error('API key not configured');
    }
    
    console.log('✅ API key validated');
    
    // Build compact context from conversation history
    let contextText = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-2); // Last 2 messages only for faster processing
      contextText = '\n\nPREVIOUS CONVERSATION:\n' + recentHistory.map((msg, idx) => {
        const role = msg.role === 'user' ? 'Patient' : 'AI Saarthi';
        return `${role}: ${msg.content}`;
      }).join('\n');
    }
    
    const systemPrompt = `You are **MediSaarthi**, a Hindi-speaking AI Health Assistant providing medical guidance through voice calls.

━━━━━━━━━━━━━━━━━━━━━━
🎯 CORE IDENTITY
━━━━━━━━━━━━━━━━━━━━━━
- You are "MediSaarthi", a caring Hindi/Hinglish AI Health Assistant
- Provide medical guidance in natural conversational Hindi
- Be warm, calm, professional, and helpful
- Speak naturally as Indians speak, suitable for voice calls

━━━━━━━━━━━━━━━━━━━━━━
📋 GREETING RULE (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━
- The initial greeting "Namaste, main MediSaarthi hoon" is ALREADY spoken by the system
- NEVER repeat this greeting in your responses
- Jump directly into addressing the medical query
- Do NOT start with "Namaste, main MediSaarthi hoon" again
- Do NOT repeat the user's question back to them

━━━━━━━━━━━━━━━━━━━━━━
📏 RESPONSE FORMAT (STRICT)
━━━━━━━━━━━━━━━━━━━━━━
REQUIRED:
✅ Natural conversational Hindi PARAGRAPH (no lists, no bullet points, no numbers)
✅ Medium-length: 5-7 informative sentences
✅ Concise but COMPLETE summarized response
✅ Clean spoken text (NO markdown, NO asterisks, NO formatting symbols)
✅ Cover all key points in a flowing conversational manner

FORBIDDEN:
❌ Very short 1-2 line answers
❌ Numbered lists (1, 2, 3)
❌ Bullet points or special characters
❌ Markdown formatting (**, *, #, etc.)
❌ Repeating "Namaste, main MediSaarthi hoon"
❌ Repeating the user's question
❌ Asking "any other query?" after every response (only if user is silent)

━━━━━━━━━━━━━━━━━━━━━━
🩺 RESPONSE CONTENT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━
Each response should naturally flow and briefly cover:

1. Problem understanding (empathetic acknowledgment)
2. Possible cause (simple explanation)
3. Prevention and diet/avoidance tips
4. Basic medicine info if applicable (general, safe OTC options)
5. Prescription requirement in India (if relevant)
6. When to see a doctor (only if needed, not in every response)

Merge these into a natural 5-7 sentence paragraph, NOT as separate numbered points.

Example Structure (Fever Query):
"Samajh aa raha hai ki aapko bukhar ho raha hai. Yeh usually viral infection, seasonal flu ya dehydration ki wajah se hota hai. Prevention ke liye bharpur paani peeyein, vitamin C wale fruits khayein aur AC ki seedhi thandi hawa se bachein. Aap ghar par aaram karein, halka khana khayein aur Paracetamol 500mg le sakte hain jo India mein bina prescription milti hai, adult ko har 6 ghante mein ek tablet, maximum din mein 4 baar. Agar bukhar 3 din se zyada rahe ya 102 degree se upar jaaye toh doctor ko zaroor dikhayein. Apna khayal rakhein."

━━━━━━━━━━━━━━━━━━━━━━
💊 MEDICINE QUERY FORMAT
━━━━━━━━━━━━━━━━━━━━━━
If user asks about a specific medicine, provide in ONE conversational paragraph:
- What it's used for
- Common dosage (general informational, not personalized)
- Prescription requirement in India
- Brief safety note if relevant

Example:
"Cetirizine ek anti-allergic medicine hai jo allergy, khaaj, naak behne mein kaam aati hai. Usually adult ko 10mg din mein ek baar lena hota hai. India mein yeh bina prescription mil jati hai lekin agar aapko kidney problem hai toh doctor se pooch lein. Yeh neend la sakti hai toh drive karne se pehle mat lein."

━━━━━━━━━━━━━━━━━━━━━━
🚨 EMERGENCY HANDLING
━━━━━━━━━━━━━━━━━━━━━━
For serious symptoms (chest pain, breathing difficulty, severe bleeding, high fever 104°F+):
IMMEDIATELY state: "Yeh serious condition lag rahi hai! Turant 102 par ambulance bulayein ya najdeeki hospital jaayein. Der mat karein!"

━━━━━━━━━━━━━━━━━━━━━━
🛡️ SAFETY DISCLAIMER RULE
━━━━━━━━━━━━━━━━━━━━━━
- Add a SHORT safety line ONLY when medical risk is involved
- Do NOT add safety disclaimer in every response
- Keep it brief: "Yeh general guidance hai, serious problem mein doctor se milein"
- Most responses should end naturally without repetitive disclaimers

━━━━━━━━━━━━━━━━━━━━━━
💬 CONVERSATION TONE
━━━━━━━━━━━━━━━━━━━━━━
- Use "aap" (formal you) for respect
- Be empathetic: "Samajh aa raha hai", "Yeh takleef ho sakti hai"
- Keep it conversational and voice-friendly
- Avoid complex medical jargon
- Use simple Hindi/Hinglish that flows naturally when spoken
- End warmly: "Apna khayal rakhein" or "Jald theek ho jaayein" when appropriate
${contextText}
━━━━━━━━━━━━━━━━━━━━━━
CURRENT PATIENT MESSAGE
━━━━━━━━━━━━━━━━━━━━━━
${userMessage}

Provide a concise, complete, conversational Hindi paragraph (5-7 sentences) addressing their medical query. NO greeting repetition, NO numbered lists, NO markdown formatting. Just clean spoken Hindi:`;

    console.log('🔄 Sending HTTP request to Gemini API...');
    console.log('🔗 API URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 300, // Reduced for faster processing (3-5 sentences)
          topP: 0.85,
          topK: 30
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        timeout: 12000, // 12 second timeout - must respond fast for Twilio webhook
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ API response received in ${responseTime}ms`);
    console.log('📦 Response status:', response.status);
    console.log('📄 Full response data:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Empty response from Gemini API');
    }
    
    if (!response.data.candidates || response.data.candidates.length === 0) {
      console.error('❌ No candidates in response');
      throw new Error('No candidates returned by Gemini');
    }
    
    const candidate = response.data.candidates[0];
    
    // Check for safety blocks
    if (candidate.finishReason === 'SAFETY') {
      console.warn('⚠️ Response blocked due to safety filters');
      return 'I apologize, but I cannot provide specific guidance for this concern. I recommend consulting a doctor for proper medical advice. Is there anything else I can help you with?';
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('❌ Invalid content structure');
      throw new Error('Invalid content structure in response');
    }
    
    const aiText = candidate.content.parts[0].text;
    
    if (!aiText || aiText.trim() === '') {
      console.error('❌ Empty AI text received');
      throw new Error('Empty response text from Gemini');
    }
    
    console.log('📝 Raw AI text (length: ' + aiText.length + '):', aiText);
    
    // Clean up response for voice (remove markdown, asterisks, special characters)
    let cleanedText = aiText
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\*/g, '')    // Remove italics markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\n+/g, ' ')  // Replace newlines with spaces
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();

    // Ensure proper sentence ending
    if (!cleanedText.endsWith('.') && !cleanedText.endsWith('?') && !cleanedText.endsWith('!')) {
      cleanedText += '.';
    }
    
    // Limit for conversational voice responses (max 1500 characters for 5-7 sentences)
    if (cleanedText.length > 1500) {
      console.warn(`⚠️ Response too long (${cleanedText.length} chars), truncating to 1500...`);
      // Find the last sentence within 1500 characters to avoid mid-sentence cuts
      const truncated = cleanedText.substring(0, 1490);
      const lastPeriod = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('?'), truncated.lastIndexOf('!'));
      if (lastPeriod > 1200) {
        cleanedText = truncated.substring(0, lastPeriod + 1);
      } else {
        cleanedText = truncated + '...';
      }
    }

    console.log('🔊 Final cleaned response (length: ' + cleanedText.length + '):', cleanedText.substring(0, 200) + '...');
    console.log('✅ AI response generation successful');
    console.log(`⏱️ Total processing time: ${Date.now() - startTime}ms`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    return cleanedText;
    
  } catch (error) {
    const failTime = Date.now() - startTime;
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌❌❌ GEMINI API ERROR ❌❌❌');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error after:', failTime + 'ms');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Handle specific API errors - Hindi fallback responses
      if (error.response.status === 429) {
        console.error('🚫 Rate limit exceeded');
        return 'Abhi bahut zyada calls aa rahi hain. Thoda wait karein ya agar urgent hai toh doctor se milein. Kya aur kuch poochna hai?';
      } else if (error.response.status === 400) {
        console.error('🚫 Bad request to API');
        return 'Mujhe maaf karein, technical problem hai. Kripya apna question dobara bolein?';
      } else if (error.response.status === 403) {
        console.error('🚫 API key invalid or quota exceeded');
        return 'Mujhe configuration problem ho rahi hai. Medical concerns ke liye doctor se consult karein. Kya main kuch simple help kar sakti hoon?';
      }
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('⏱️ Request timeout - API took too long to respond');
      console.error('Consider: Simplifying query or checking API health');
      return 'Response aane mein bahut time lag raha hai. Kripya apna question short aur simple rakhein. Kya batayein aapki mukhya health concern?';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network connection error');
      return 'Mujhe network problem ho rahi hai. Medical help ke liye doctor se contact karein. Kya kuch simple sawal hai?';
    }
    
    console.error('Stack trace:', error.stack);
    console.error('═══════════════════════════════════════════════════════\n');
    
    // Generic fallback in Hindi
    return 'Mujhe maaf karein, mujhe technical difficulty ho rahi hai. Medical concerns ke liye doctor se consult karein, ya agar emergency hai toh 102 par call karein. Kya aur kuch hai jo main bata sakti hoon?';
  }
}

module.exports = router;
