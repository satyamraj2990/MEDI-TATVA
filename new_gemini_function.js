// ════════════════════════════════════════════════════════════════════
// NEW AI RESPONSE GENERATOR - ALWAYS LIVE LLM WITH RETRY & ANTI-LOOP  
// ════════════════════════════════════════════════════════════════════
async function getGeminiMedicalResponse(userMessage, conversationHistory = [], symptomsCollected = {}, turnCount = 0) {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 GEMINI AI REQUEST (ALWAYS LIVE LLM - NO TEMPLATES)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('💬 TRANSCRIPTION:', userMessage);
  console.log('📚 History length:', conversationHistory.length);
  console.log('🔢 Turn count:', turnCount);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // Get last response for anti-loop comparison
  const lastResponse = conversationHistory.length > 0 
    ? conversationHistory[conversationHistory.length - 1]?.content 
    : null;
  
  if (lastResponse) {
    console.log('🔄 Last response (for anti-loop check):', lastResponse.substring(0, 80) + '...');
  }
  
  const apiKey = process.env.GEMINI_API_KEY || '';
  let aiResponse = null;
  let attempt = 0;
  const MAX_ATTEMPTS = 2;
  
  // Build concise context (last 2 exchanges only for freshness)
  let contextText = '';
  if (conversationHistory.length > 1) {
    const recentHistory = conversationHistory.slice(-4, -1); // Last 2 exchanges, exclude current
    if (recentHistory.length > 0) {
      contextText = '\n\nपिछली बातचीत:\n' + recentHistory.map(msg => {
        const role = msg.role === 'user' ? 'मरीज' : 'सहायक';
        return `${role}: ${msg.content}`;
      }).join('\n');
    }
  }
  
  // Simple, focused system prompt - HINDI ONLY, 4-6 sentences, NO greeting after turn 0
  const systemPrompt = `तुम MediSaarthi हो, एक हिंदी medical voice assistant। 

महत्वपूर्ण निर्देश:
1. केवल यूज़र के सवाल का जवाब दो - कुछ और नहीं
2. ${turnCount > 0 ? 'सीधे medical जवाब से शुरू करो - कोई "नमस्ते", "मैं MediSaarthi हूँ" मत कहो' : 'संक्षिप्त स्वागत के साथ शुरू करो'}
3. 4-6 वाक्यों में पूरी जानकारी दो (कारण, बचाव, घरेलू उपाय, दवाई अगर जरूरी हो)
4. हमेशा अंत में पूछो: "क्या मैं आपकी और किसी स्वास्थ्य संबंधित सहायता कर सकती हूं?"
5. अगर non-medical सवाल (मौसम, joke, calculator) तो कहो: "मैं केवल स्वास्थ्य और दवा से संबंधित प्रश्नों में मदद करती हूं"
6. एक flowing paragraph में जवाब दो - bullets या numbering नहीं
7. सरल, बातचीत जैसी हिंदी में लिखो
8. कोई markdown formatting नहीं - सिर्फ plain text

${contextText}

अब इस सवाल का जवाब दो: "${userMessage}"`;

  console.log('📝 LLM REQUEST PAYLOAD:');
  console.log({
    model: 'gemini-2.0-flash-exp',
    transcription: userMessage,
    turnCount: turnCount,
    promptLength: systemPrompt.length,
    temperature: 0.7,
    maxTokens: 400
  });
  
  // ATTEMPT 1 & 2: Try with retry logic
  while (attempt < MAX_ATTEMPTS && !aiResponse) {
    attempt++;
    const attemptStart = Date.now();
    
    try {
      console.log(`🔄 ATTEMPT ${attempt}/${MAX_ATTEMPTS} - Calling Gemini API...`);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            temperature: 0.7 + (attempt - 1) * 0.1,  // Slight variation on retry
            maxOutputTokens: 400,
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
          timeout: 8000,  // 8 second timeout per attempt
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const attemptTime = Date.now() - attemptStart;
      console.log(`⏱️  API responded in ${attemptTime}ms`);
      
      // Validate response structure
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }
      
      const candidate = response.data.candidates[0];
      
      // Check for safety blocks
      if (candidate.finishReason === 'SAFETY') {
        console.warn('⚠️  Response blocked by safety filters');
        throw new Error('Safety block - retry needed');
      }
      
      let rawText = candidate.content.parts[0].text;
      
      console.log('📥 RAW LLM RESPONSE:');
      console.log(rawText);
      
      // Clean response for voice (remove markdown, bullets, etc.)
      let cleanedText = rawText
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^\s*[-•]\s+/gm, '')  // Remove bullet points
        .replace(/^\s*\d+\.\s+/gm, '')  // Remove numbered lists
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Ensure sentence ending
      if (!/[.?!।]$/.test(cleanedText)) {
        cleanedText += '.';
      }
      
      // CRITICAL VALIDATION 1: Response must be > 15 characters
      if (cleanedText.length < 15) {
        console.warn(`⚠️  Response too short (${cleanedText.length} chars) - regenerating`);
        throw new Error('Response too short');
      }
      
      // CRITICAL VALIDATION 2: Anti-loop - compare with last response
      if (lastResponse && attempt === 1) {
        const similarity = calculateSimilarity(cleanedText, lastResponse);
        if (similarity > 0.7) {  // 70% similar = loop detected
          console.warn(`⚠️  Loop detected (${Math.round(similarity * 100)}% similar to last) - regenerating`);
          throw new Error('Loop detected');
        }
      }
      
      // CRITICAL VALIDATION 3: Must NOT be a greeting/introduction if turnCount > 0
      const greetingWords = ['नमस्ते', 'main medisaarthi', 'मैं मेडीसारथी', 'मैं आपकी मदद'];
      if (turnCount > 0 && greetingWords.some(word => cleanedText.toLowerCase().includes(word))) {
        console.warn('⚠️  Unwanted greeting detected in turn', turnCount, '- regenerating');
        throw new Error('Unwanted greeting');
      }
      
      // Limit length for voice clarity (max 1000 chars = ~150 words)
      if (cleanedText.length > 1000) {
        const truncated = cleanedText.substring(0, 980);
        const lastPunctuation = Math.max(
          truncated.lastIndexOf('.'),
          truncated.lastIndexOf('?'),
          truncated.lastIndexOf('!'),
          truncated.lastIndexOf('।')
        );
        
        cleanedText = lastPunctuation > 900 
          ? truncated.substring(0, lastPunctuation + 1)
          : truncated + '...';
      }
      
      console.log('✅ VALIDATED & CLEANED RESPONSE:');
      console.log(cleanedText);
      console.log(`📏 Length: ${cleanedText.length} chars`);
      
      aiResponse = cleanedText;
      
    } catch (error) {
      const attemptTime = Date.now() - attemptStart;
      console.error(`❌ ATTEMPT ${attempt} FAILED (${attemptTime}ms):`, error.message);
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data?.error?.message || error.response.data, null, 2));
      }
      
      // If this was the last attempt, break loop
      if (attempt >= MAX_ATTEMPTS) {
        console.error('❌ ALL ATTEMPTS EXHAUSTED');
        break;
      }
      
      // Wait briefly before retry (500ms backoff)
      console.log('   ⏳ Retrying in 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // FAILSAFE: If all attempts failed, return proper error message (NOT blank/null)
  if (!aiResponse) {
    console.error('❌ FAILSAFE TRIGGERED - Using error message');
    aiResponse = 'माफ कीजिए, technical दिक्कत आ रही है। कृपया फिर से अपना सवाल बताएं या 102 पर ambulance बुलाएं अगर emergency है। क्या मैं आपकी और किसी स्वास्थ्य संबंधित सहायता कर सकती हूं?';
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return aiResponse;
}

// Helper function to calculate similarity (simple word-level Jaccard similarity)
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
