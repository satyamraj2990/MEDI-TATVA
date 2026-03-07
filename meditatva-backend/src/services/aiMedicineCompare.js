const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize MediTatva AI Engine (powered by Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Compare ANY two medicines using MediTatva AI Engine
 * No database lookup required - AI analyzes medicine names directly
 * @param {string} medicine1Name - First medicine name
 * @param {string} medicine2Name - Second medicine name
 * @returns {Promise<Object>} Structured comparison data
 */
async function compareAnyMedicines(medicine1Name, medicine2Name) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are the MediTatva AI Engine, a medical information assistant. Compare the following two medicines in a clinical and pharmaceutical context.

**Medicine 1:** ${medicine1Name}
**Medicine 2:** ${medicine2Name}

Provide a comprehensive comparison covering:
• Generic name / Active ingredients
• Drug class / Therapeutic category
• Chemical composition
• Primary uses and indications
• Dosage forms available (tablet, capsule, syrup, injection, etc.)
• Strength variants commonly available
• Common side effects
• Prescription requirement in India
• Typical adult dosage
• Manufacturer examples (if known)
• Approximate price range in India (₹)
• Key clinical differences
• Which situations each medicine is better for

**CRITICAL:** Return ONLY a valid JSON object (no markdown, no code blocks, no explanation text):

{
  "medicine1": {
    "name": "${medicine1Name}",
    "genericName": "active ingredient/generic name",
    "drugClass": "therapeutic/drug class",
    "composition": "chemical composition",
    "primaryUses": ["use 1", "use 2", "use 3"],
    "dosageForms": ["tablet", "capsule", "syrup"],
    "strengthVariants": ["100mg", "500mg"],
    "sideEffects": ["effect 1", "effect 2", "effect 3"],
    "prescriptionRequired": true,
    "typicalDosage": "dosage details",
    "manufacturers": ["manufacturer 1", "manufacturer 2"],
    "priceRange": "₹50-100"
  },
  "medicine2": {
    "name": "${medicine2Name}",
    "genericName": "active ingredient/generic name",
    "drugClass": "therapeutic/drug class",
    "composition": "chemical composition",
    "primaryUses": ["use 1", "use 2", "use 3"],
    "dosageForms": ["tablet", "capsule", "syrup"],
    "strengthVariants": ["200mg", "400mg"],
    "sideEffects": ["effect 1", "effect 2", "effect 3"],
    "prescriptionRequired": true,
    "typicalDosage": "dosage details",
    "manufacturers": ["manufacturer 1", "manufacturer 2"],
    "priceRange": "₹80-150"
  },
  "comparison": [
    {
      "aspect": "Generic Name",
      "med1": "value for medicine 1",
      "med2": "value for medicine 2",
      "difference": "explanation of difference"
    },
    {
      "aspect": "Drug Class",
      "med1": "value",
      "med2": "value",
      "difference": "explanation"
    },
    {
      "aspect": "Primary Uses",
      "med1": "uses list",
      "med2": "uses list",
      "difference": "explanation"
    },
    {
      "aspect": "Strength Variants",
      "med1": "strengths",
      "med2": "strengths",
      "difference": "explanation"
    },
    {
      "aspect": "Dosage Forms",
      "med1": "forms",
      "med2": "forms",
      "difference": "explanation"
    },
    {
      "aspect": "Side Effects",
      "med1": "effects",
      "med2": "effects",
      "difference": "explanation"
    },
    {
      "aspect": "Prescription Requirement",
      "med1": "required/not required",
      "med2": "required/not required",
      "difference": "explanation"
    },
    {
      "aspect": "Typical Dosage",
      "med1": "dosage",
      "med2": "dosage",
      "difference": "explanation"
    },
    {
      "aspect": "Price Range",
      "med1": "price range",
      "med2": "price range",
      "difference": "value comparison"
    }
  ],
  "keyDifferences": [
    "Major clinical difference 1",
    "Major clinical difference 2",
    "Major clinical difference 3"
  ],
  "clinicalRecommendations": {
    "medicine1BetterFor": ["situation 1", "situation 2"],
    "medicine2BetterFor": ["situation 1", "situation 2"],
    "generalAdvice": "Overall clinical recommendation"
  }
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    // Parse the JSON response
    const comparisonData = JSON.parse(cleanedText);
    
    return {
      success: true,
      data: comparisonData,
      aiEngine: 'MediTatva AI Engine'
    };

  } catch (error) {
    console.error('MediTatva AI Engine Error:', error);
    
    // Return error with details
    return {
      success: false,
      error: 'Unable to generate comparison. Please try again.',
      details: error.message,
      aiEngine: 'MediTatva AI Engine'
    };
  }
}

module.exports = {
  compareAnyMedicines
};
