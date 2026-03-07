const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// ════════════════════════════════════════════════════════════════════
// SIMPLE VOICE ASSISTANT - NO TWILIO, BROWSER-BASED
// ════════════════════════════════════════════════════════════════════

const geminiApiKey = process.env.GEMINI_API_KEY || '';

// Rate limiting for Gemini API
const geminiRateLimit = {
  calls: [],
  maxCallsPerMinute: 15,
  isAllowed() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < 60000);
    if (this.calls.length >= this.maxCallsPerMinute) {
      return false;
    }
    this.calls.push(now);
    return true;
  }
};

// ═══ PROCESS VOICE QUERY ═══
router.post('/query', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🎙️  VOICE ASSISTANT - QUERY PROCESSING                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const { query, conversationHistory = [] } = req.body;
    
    console.log(`🗣️  User Query: "${query}"`);
    console.log(`📜 History: ${conversationHistory.length} messages`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    // Validate query
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    // Check rate limit
    if (!geminiRateLimit.isAllowed()) {
      console.warn('⚠️  Rate limit exceeded');
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.',
        response: 'Thoda ruk jaiye, bahut queries aa rahi hain. Kripya kuch seconds baad dobara try karein.'
      });
    }
    
    // Generate AI response
    let aiResponse = '';
    
    try {
      aiResponse = await generateMedicalResponse(query, conversationHistory);
      console.log(`✅ AI Response generated (${aiResponse.length} chars)`);
      console.log(`📝 Preview: ${aiResponse.substring(0, 100)}...`);
      
    } catch (aiError) {
      console.error('❌ AI Error:', aiError.message);
      // Fallback to keyword-based response
      aiResponse = getFallbackResponse(query);
      console.log('📝 Using fallback response');
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️  Total processing time: ${processingTime}ms`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    res.json({
      success: true,
      response: aiResponse,
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR in voice assistant:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      response: 'Maaf kijiye, technical problem aa gayi hai. Kripya thodi der baad try karein.'
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// AI RESPONSE GENERATION
// ════════════════════════════════════════════════════════════════════
async function generateMedicalResponse(userQuery, conversationHistory = []) {
  const startTime = Date.now();
  
  console.log('🤖 Calling Gemini AI...');
  
  if (!geminiApiKey || geminiApiKey === 'your_key_here') {
    throw new Error('Gemini API key not configured');
  }
  
  // Build context from conversation history
  let contextText = '';
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-4); // Last 2 exchanges
    contextText = recentHistory.map(msg => 
      `${msg.role === 'user' ? 'Patient' : 'MediSaarthi'}: ${msg.text}`
    ).join('\n');
  }
  
  // Medical AI Prompt (Hindi + English support)
  const systemPrompt = `You are MediSaarthi, a friendly AI health assistant speaking to Indian users in Hindi/Hinglish.

RULES:
1. Answer in HINDI/HINGLISH mix (natural Indian speaking style)
2. Keep response SHORT (4-6 sentences max)
3. Be conversational and friendly
4. Format as SPOKEN PARAGRAPH (no bullets, no lists)
5. Cover: Main cause + Relief tips + Medicine info (if relevant) + When to see doctor

USER QUERY: "${userQuery}"

${contextText ? `\nRECENT CONVERSATION:\n${contextText}\n` : ''}

RESPOND IN HINDI (natural speaking style):`;

  try {
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
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Gemini API responded in ${responseTime}ms`);
    
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid AI response structure');
    }
    
    let aiText = response.data.candidates[0].content.parts[0].text;
    
    // Clean formatting for voice
    aiText = aiText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit length for voice output
    if (aiText.length > 1000) {
      const truncated = aiText.substring(0, 950);
      const lastPeriod = truncated.lastIndexOf('.');
      aiText = lastPeriod > 700 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
    }
    
    return aiText;
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════════
// FALLBACK RESPONSES (when AI fails)
// ════════════════════════════════════════════════════════════════════
function getFallbackResponse(query) {
  const queryLower = query.toLowerCase();
  
  // Common symptoms with fallback responses
  const fallbacks = {
    headache: 'Sir dard ke liye aaram karein, paani zyada peeyein, aur stress kam karein. Paracetamol 500mg le sakte hain. Agar 3 din mein sahi na ho toh doctor se milein.',
    
    fever: 'Bukhar mein complete aaram karein, liquid zyada lein, aur halka khana khayein. Paracetamol har 6 ghante mein le sakte hain. 102°F se zyada ya 3 din zyada ho toh doctor se consult zaroor karein.',
    
    stomach: 'Pet ki problem mein halka khana khayein, oily food avoid karein, aur paani zyada lein. Nimbu paani aur pudina helpful hai. 2-3 din tak problem rahe toh doctor ko dikhayein.',
    
    cough: 'Khansi ke liye garam paani peeyein, thanda avoid karein, aur shahad-haldi wala doodh helpful hai. 5-7 din mein sahi nahi ho toh doctor se consult karein.',
    
    cold: 'Thande mein garam kapde pahnein, garam paani peeyein, aur aaram karein. Steam lena bhi helpful hai. Normal cold 3-5 din mein theek ho jata hai.',
    
    diabetes: 'Diabetes mein regular exercise karein, sugar aur maida avoid karein, aur doctor ki advice follow karein. Regular blood sugar check karte rahein.',
    
    bp: 'Blood pressure ke liye namak kam khayein, daily walk karein, aur stress manage karein. Regular BP monitor zaroor karein aur doctor se consult karke medicine lein.',
    
    thyroid: 'Thyroid issues ke liye doctor ki medicine regular lein, healthy diet follow karein, aur regular checkup karwayein. Apne aap se medicine ka dose change na karein.'
  };
  
  // Check for symptom keywords
  for (const [keyword, response] of Object.entries(fallbacks)) {
    if (queryLower.includes(keyword) || 
        queryLower.includes(keyword === 'headache' ? 'sir' : '') ||
        queryLower.includes(keyword === 'headache' ? 'sar' : '') ||
        queryLower.includes(keyword === 'fever' ? 'bukhar' : '') ||
        queryLower.includes(keyword === 'stomach' ? 'pet' : '') ||
        queryLower.includes(keyword === 'cough' ? 'khansi' : '') ||
        queryLower.includes(keyword === 'cold' ? 'thanda' : '') ||
        queryLower.includes(keyword === 'diabetes' ? 'sugar' : '') ||
        queryLower.includes(keyword === 'diabetes' ? 'shakkar' : '')) {
      return response;
    }
  }
  
  // Generic fallback
  return `Aapne "${query.substring(0, 50)}" ke baare mein poocha. Main aapki madad karna chahta hoon. Kripya apna sawal thoda aur clearly batayein. Aap symptoms, dawai, ya health condition ke baare mein pooch sakte hain.`;
}

// ═══ TEST ENDPOINT ═══
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Voice Assistant API is operational',
    geminiConfigured: !!geminiApiKey && geminiApiKey !== 'your_key_here',
    features: [
      'Browser-based voice recognition',
      'AI medical responses in Hindi/Hinglish',
      'No Twilio - completely free',
      'Real-time conversation'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
