const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Compare two medicines using Gemini AI
 * @param {Object} medicine1 - First medicine details
 * @param {Object} medicine2 - Second medicine details
 * @returns {Promise<Object>} Structured comparison data
 */
async function compareMedicinesWithAI(medicine1, medicine2) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a medical information assistant. Compare the following two medicines and provide a detailed, accurate comparison.

**Medicine 1:**
- Name: ${medicine1.name}
- Composition: ${medicine1.composition1}${medicine2.composition2 ? ', ' + medicine1.composition2 : ''}
- Manufacturer: ${medicine1.manufacturer}
- Type: ${medicine1.type}
- Pack Size: ${medicine1.packSize}
- Price: ₹${medicine1.price}

**Medicine 2:**
- Name: ${medicine2.name}
- Composition: ${medicine2.composition1}${medicine2.composition2 ? ', ' + medicine2.composition2 : ''}
- Manufacturer: ${medicine2.manufacturer}
- Type: ${medicine2.type}
- Pack Size: ${medicine2.packSize}
- Price: ₹${medicine2.price}

Provide a comprehensive comparison covering:
1. Generic/Active ingredients
2. Drug class/category
3. Primary uses and indications
4. Strength/dosage details
5. Dosage form (tablet, capsule, syrup, etc.)
6. Common side effects
7. Prescription requirement
8. Price comparison and value
9. Key differences between them
10. When to choose one over the other

**IMPORTANT:** Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "medicine1": {
    "name": "${medicine1.name}",
    "genericName": "extracted generic name",
    "drugClass": "drug class/category",
    "primaryUses": ["use 1", "use 2", "use 3"],
    "strength": "strength details",
    "dosageForm": "tablet/capsule/etc",
    "sideEffects": ["effect 1", "effect 2", "effect 3"],
    "prescriptionRequired": true/false,
    "manufacturer": "${medicine1.manufacturer}",
    "price": ${medicine1.price},
    "packSize": "${medicine1.packSize}"
  },
  "medicine2": {
    "name": "${medicine2.name}",
    "genericName": "extracted generic name",
    "drugClass": "drug class/category",
    "primaryUses": ["use 1", "use 2", "use 3"],
    "strength": "strength details",
    "dosageForm": "tablet/capsule/etc",
    "sideEffects": ["effect 1", "effect 2", "effect 3"],
    "prescriptionRequired": true/false,
    "manufacturer": "${medicine2.manufacturer}",
    "price": ${medicine2.price},
    "packSize": "${medicine2.packSize}"
  },
  "comparison": [
    {
      "aspect": "Generic Name",
      "medicine1": "value",
      "medicine2": "value",
      "difference": "explanation of difference"
    },
    {
      "aspect": "Drug Class",
      "medicine1": "value",
      "medicine2": "value",
      "difference": "explanation"
    },
    {
      "aspect": "Primary Uses",
      "medicine1": "uses list",
      "medicine2": "uses list",
      "difference": "explanation"
    },
    {
      "aspect": "Strength",
      "medicine1": "strength",
      "medicine2": "strength",
      "difference": "explanation"
    },
    {
      "aspect": "Dosage Form",
      "medicine1": "form",
      "medicine2": "form",
      "difference": "explanation"
    },
    {
      "aspect": "Side Effects",
      "medicine1": "effects",
      "medicine2": "effects",
      "difference": "explanation"
    },
    {
      "aspect": "Prescription",
      "medicine1": "required/not required",
      "medicine2": "required/not required",
      "difference": "explanation"
    },
    {
      "aspect": "Price & Value",
      "medicine1": "₹${medicine1.price}",
      "medicine2": "₹${medicine2.price}",
      "difference": "value comparison"
    }
  ],
  "keyDifferences": [
    "Major difference 1",
    "Major difference 2",
    "Major difference 3"
  ],
  "recommendations": {
    "medicine1BetterFor": ["situation 1", "situation 2"],
    "medicine2BetterFor": ["situation 1", "situation 2"],
    "generalAdvice": "Overall recommendation"
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
      data: comparisonData
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return error with details
    return {
      success: false,
      error: 'Failed to generate AI comparison',
      details: error.message
    };
  }
}

/**
 * Get basic comparison without AI (fallback)
 * @param {Object} medicine1 - First medicine
 * @param {Object} medicine2 - Second medicine
 * @returns {Object} Basic comparison
 */
function getBasicComparison(medicine1, medicine2) {
  return {
    success: true,
    data: {
      medicine1: {
        name: medicine1.name,
        genericName: medicine1.composition1 || 'N/A',
        drugClass: medicine1.type || 'N/A',
        primaryUses: ['Consult healthcare provider'],
        strength: medicine1.composition1 || 'N/A',
        dosageForm: medicine1.packSize || 'N/A',
        sideEffects: ['Check package insert'],
        prescriptionRequired: true,
        manufacturer: medicine1.manufacturer,
        price: medicine1.price,
        packSize: medicine1.packSize
      },
      medicine2: {
        name: medicine2.name,
        genericName: medicine2.composition1 || 'N/A',
        drugClass: medicine2.type || 'N/A',
        primaryUses: ['Consult healthcare provider'],
        strength: medicine2.composition1 || 'N/A',
        dosageForm: medicine2.packSize || 'N/A',
        sideEffects: ['Check package insert'],
        prescriptionRequired: true,
        manufacturer: medicine2.manufacturer,
        price: medicine2.price,
        packSize: medicine2.packSize
      },
      comparison: [
        {
          aspect: 'Composition',
          medicine1: medicine1.composition1,
          medicine2: medicine2.composition1,
          difference: medicine1.composition1 === medicine2.composition1 ? 'Same' : 'Different'
        },
        {
          aspect: 'Manufacturer',
          medicine1: medicine1.manufacturer,
          medicine2: medicine2.manufacturer,
          difference: medicine1.manufacturer === medicine2.manufacturer ? 'Same' : 'Different'
        },
        {
          aspect: 'Price',
          medicine1: `₹${medicine1.price}`,
          medicine2: `₹${medicine2.price}`,
          difference: `Difference: ₹${Math.abs(medicine1.price - medicine2.price)}`
        }
      ],
      keyDifferences: ['AI comparison unavailable. Showing basic data only.'],
      recommendations: {
        medicine1BetterFor: ['Consult healthcare provider'],
        medicine2BetterFor: ['Consult healthcare provider'],
        generalAdvice: 'Always consult a healthcare professional before choosing medicines.'
      }
    }
  };
}

module.exports = {
  compareMedicinesWithAI,
  getBasicComparison
};
