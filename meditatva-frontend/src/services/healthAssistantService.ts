import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("🔑 Health Service - API Key present:", !!apiKey);
  console.log("🔑 API Key length:", apiKey?.length || 0);
  if (apiKey && apiKey.length > 20) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ Gemini AI initialized for Health Service");
  } else {
    console.error("❌ Invalid or missing API key in Health Service");
  }
} catch (error) {
  console.error("❌ Health Service API initialization failed:", error);
}

// Enhanced system prompt for health assistance with medicine substitutes
export const HEALTH_ASSISTANT_PROMPT = `You are MediTatva — an advanced, multilingual AI Health Assistant specializing in medical guidance and medicine information.

Your core capabilities:
1. **Symptom Analysis**: Understand user symptoms and suggest possible conditions
2. **Medicine Information**: Provide detailed medicine information and SUBSTITUTES
3. **Health Advice**: Give practical health advice and home remedies
4. **Language Support**: Respond in the SAME language as user input (auto-detect)

CRITICAL RULES FOR MEDICINE SUBSTITUTES:
When a user asks about a medicine or alternative medicines:
- Provide 3-5 GENERIC SUBSTITUTES with the same active ingredient
- Include both BRAND NAME and GENERIC NAME
- Mention KEY DIFFERENCES (price, manufacturer, availability)
- State dosage equivalence
- Mention if substitute is cheaper/more affordable
- Only suggest OTC medicines unless specifically asked

RESPONSE FORMAT:

When asked about medicine/substitute:
💊 **Original Medicine:**
[Name, generic composition, typical use]

🔄 **Recommended Substitutes:**
1. **[Brand Name]** (Generic: [Active Ingredient])
   - Price: ₹[X] (vs original ₹[Y])
   - Manufacturer: [Company]
   - Availability: [Common/Prescription needed]
   - Key difference: [Brief note]

2. [Repeat for 3-5 alternatives]

⚕️ **Important Notes:**
- All substitutes contain the same active ingredient
- Consult pharmacist before switching brands
- Prescription required: [Yes/No]

For symptom-based queries:
🩺 **Possible Conditions:**
[List 2-3 likely conditions]

🔍 **Related Symptoms:**
[3-4 common associated symptoms]

💊 **Recommended Medicines (with alternatives):**
1. [Medicine Name] OR substitute: [Alternative] - [Dosage]
2. [Repeat for each recommendation]

🏡 **Home Remedies:**
[Natural care tips]

⚕️ **When to See Doctor:**
[Clear guidance on seeking medical help]

⚠️ **Medical Disclaimer:**
This is AI-generated medical information for educational purposes only. Always consult a qualified healthcare professional before taking any medication or making health decisions.

SAFETY RULES:
- NEVER recommend prescription drugs without doctor consultation warning
- ALWAYS mention side effects for common medicines
- ALWAYS include price ranges when suggesting alternatives
- Focus on AFFORDABLE and ACCESSIBLE options
- Warn about drug interactions for common conditions

Remember: 
- Respond in user's language (Hindi, English, Tamil, etc.)
- Be empathetic and supportive
- Prioritize safety and accessibility
- Provide practical, actionable advice`;

export interface MedicineSubstitute {
  brandName: string;
  genericName: string;
  price: string;
  manufacturer: string;
  availability: string;
  keyDifference: string;
}

export interface HealthResponse {
  originalQuery: string;
  response: string;
  substitutes?: MedicineSubstitute[];
  confidence: number;
}

/**
 * Get health advice and medicine substitutes from AI
 */
export async function getHealthAdvice(userQuery: string): Promise<HealthResponse> {
  console.log("🏥 Health Assistant Query:", userQuery);
  
  try {
    if (!genAI) {
      throw new Error("Gemini AI not configured");
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: HEALTH_ASSISTANT_PROMPT
    });

    const result = await model.generateContent(userQuery);
    const response = result.response.text();
    
    console.log("✅ Health Assistant Response received");

    return {
      originalQuery: userQuery,
      response: response,
      confidence: 85, // High confidence for AI responses
    };
  } catch (error) {
    console.error("❌ Health Assistant Service Error:", error);
    console.error("Error details:", {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("quota") || msg.includes("429")) {
        throw new Error("API quota exceeded. The free tier limit has been reached. Please wait or upgrade your API plan.");
      } else if (msg.includes("api") && msg.includes("key")) {
        throw new Error("API key authentication failed. Please check your Gemini API key configuration.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        throw new Error("Network connection error. Please check your internet connection and try again.");
      }
    }
    
    throw error;
  }
}

/**
 * Get medicine substitutes specifically
 */
export async function getMedicineSubstitutes(medicineName: string): Promise<HealthResponse> {
  const query = `What are the best affordable substitute medicines for ${medicineName}? Please provide:
1. Generic name and composition
2. At least 3-5 alternative brands with prices
3. Key differences between substitutes
4. Availability information (OTC or prescription)
5. Price comparison`;

  return getHealthAdvice(query);
}

/**
 * Get symptom-based medicine recommendations
 */
export async function getSymptomBasedAdvice(symptoms: string): Promise<HealthResponse> {
  const query = `I am experiencing: ${symptoms}. Please provide:
1. Possible medical conditions
2. Recommended medicines with affordable alternatives
3. Home remedies
4. When to see a doctor`;

  return getHealthAdvice(query);
}

/**
 * Get multilingual health advice
 */
export async function getMultilingualHealthAdvice(query: string, language?: string): Promise<HealthResponse> {
  const languageHint = language ? `[Please respond in ${language}] ` : "";
  return getHealthAdvice(languageHint + query);
}

// Export for use in components
export default {
  getHealthAdvice,
  getMedicineSubstitutes,
  getSymptomBasedAdvice,
  getMultilingualHealthAdvice,
};
