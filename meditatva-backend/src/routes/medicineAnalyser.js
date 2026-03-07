const express = require('express');
const router = express.Router();
const axios = require('axios');
const Medicine = require('../models/Medicine');

// Rate limiting for AI requests
const rateLimit = require('express-rate-limit');
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes
  message: { error: 'Too many analysis requests. Please try again later.' }
});

// Gemini API Key
const geminiApiKey = process.env.GEMINI_API_KEY;

/**
 * Medicine Analyser Prompt Template
 */
function buildAnalysisPrompt(userData, primaryMedicine, comparisonMedicines, substituteCandidates, mode) {
  const comparisonBlock = comparisonMedicines && comparisonMedicines.length > 0 
    ? comparisonMedicines.map((med, idx) => `
Medicine ${idx + 1}:
Name: ${med.name}
Salt Composition: ${med.genericName || 'N/A'}
Dosage: ${med.dosage || 'N/A'}
Manufacturer: ${med.manufacturer || 'N/A'}
Price: ₹${med.price}
Pack Size: ${med.form || 'N/A'}
Price Per Unit: ₹${(med.price || 0)}
`).join('\n')
    : 'No comparison medicines provided.';

  const substituteBlock = substituteCandidates && substituteCandidates.length > 0
    ? substituteCandidates.map((med, idx) => `
Substitute ${idx + 1}:
Name: ${med.name}
Salt Composition: ${med.genericName || 'N/A'}
Dosage: ${med.dosage || 'N/A'}
Price: ₹${med.price}
Manufacturer: ${med.manufacturer || 'N/A'}
`).join('\n')
    : 'No substitute candidates found.';

  return `You are Meditatva Medicine Analyser AI.

You are an intelligent healthcare information assistant integrated into the Meditatva patient portal.

Your role is to analyze medicines using structured dataset inputs and help patients understand:

- Medicine comparisons
- True substitutes
- Cost effectiveness
- Composition differences

You must strictly follow safe medical communication.

--------------------------------------------------

🚨 SAFETY RULES (MANDATORY)

- Do NOT prescribe medicines.
- Do NOT tell users to replace prescribed drugs.
- Do NOT claim medical authority.
- Provide informational analysis only.
- Always include a doctor consultation disclaimer.
- Use simple patient-friendly language.
- Avoid heavy medical jargon.

--------------------------------------------------

👤 USER CONTEXT

User Name: ${userData.name || 'Patient'}
Age: ${userData.age || 'N/A'}
Known Conditions: ${userData.conditions || 'Not specified'}
Prescription Available: ${userData.hasPrescription ? 'Yes' : 'No'}

--------------------------------------------------

🔧 ANALYSER MODE

Mode: ${mode}

Possible values:
- full_analysis
- compare_only
- substitute_focus
- price_focus

--------------------------------------------------

💊 PRIMARY MEDICINE

Name: ${primaryMedicine.name}
Salt Composition: ${primaryMedicine.genericName || 'N/A'}
Dosage: ${primaryMedicine.dosage || 'N/A'}
Manufacturer: ${primaryMedicine.manufacturer || 'N/A'}
Price: ₹${primaryMedicine.price}
Pack Size: ${primaryMedicine.form || 'N/A'}
Price Per Unit: ₹${primaryMedicine.price}

--------------------------------------------------

📊 COMPARISON MEDICINES (if provided)

${comparisonBlock}

--------------------------------------------------

🔄 SUBSTITUTE CANDIDATES (dataset derived)

${substituteBlock}

--------------------------------------------------

🧠 ANALYSIS INSTRUCTIONS

When analyzing, follow this intelligence logic:

1. True Substitute Detection
A medicine is a TRUE substitute only if:
- Salt composition matches
- Dosage strength is same or clinically similar

2. Cost Effectiveness
- Compare using price per unit
- Highlight cheapest valid substitute
- Mention significant price gaps

3. Composition Safety Check
- Flag if salt differs
- Flag if strength differs

4. Patient-Friendly Insight
- Explain in very simple language
- Focus on decision clarity

--------------------------------------------------

📋 TASK BEHAVIOR BY MODE

If mode = full_analysis:
- Perform comparison
- Identify substitutes
- Rank by cost
- Highlight best value option
- Provide simple summary

If mode = compare_only:
- Focus on side-by-side comparison
- Highlight key differences
- Mention if substitutes or not

If mode = substitute_focus:
- Identify true substitutes
- Rank by affordability
- Flag dosage mismatches

If mode = price_focus:
- Compare price per unit
- Identify cheapest option
- Mention savings percentage

--------------------------------------------------

📦 OUTPUT FORMAT (STRICT — DO NOT CHANGE)

### 🧠 Key Insights
- bullet points

### 💰 Cost Effectiveness
- bullet points

### 🧪 Composition & Substitute Check
- bullet points

### 📊 Best Value Recommendation
(1–2 lines, informational tone only)

### 👤 Simple Summary for Patients
(3–4 lines, very easy language)

### ⚠️ Safety Note
(This tool provides informational analysis only. Always consult a qualified doctor before making medication decisions.)

--------------------------------------------------

✍️ STYLE GUIDELINES

- Keep under 230 words
- Use bullet points heavily
- Be clear and calm in tone
- If data missing → say "information not available"
- Do NOT hallucinate medical facts`;
}

/**
 * POST /api/medicine-analyser/analyze
 * Analyze medicine with AI assistance
 */
router.post('/analyze', analysisLimiter, async (req, res) => {
  try {
    const {
      primaryMedicineId,
      comparisonMedicineIds = [],
      userData = {},
      mode = 'full_analysis'
    } = req.body;

    // Validation
    if (!primaryMedicineId) {
      return res.status(400).json({
        success: false,
        error: 'Primary medicine ID is required'
      });
    }

    // Validate mode
    const validModes = ['full_analysis', 'compare_only', 'substitute_focus', 'price_focus'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid mode. Must be one of: ${validModes.join(', ')}`
      });
    }

    // Fetch primary medicine
    const primaryMedicine = await Medicine.findById(primaryMedicineId);
    if (!primaryMedicine) {
      return res.status(404).json({
        success: false,
        error: 'Primary medicine not found'
      });
    }

    // Fetch comparison medicines if provided
    let comparisonMedicines = [];
    if (comparisonMedicineIds.length > 0) {
      comparisonMedicines = await Medicine.find({
        _id: { $in: comparisonMedicineIds }
      });
    }

    // Find substitute candidates (same generic name)
    let substituteCandidates = [];
    if (primaryMedicine.genericName) {
      substituteCandidates = await Medicine.find({
        genericName: primaryMedicine.genericName,
        _id: { $ne: primaryMedicine._id }, // Exclude the primary medicine
        isActive: true
      }).limit(10).sort({ price: 1 }); // Sort by price (cheapest first)
    }

    // Build the AI prompt
    const prompt = buildAnalysisPrompt(
      userData,
      primaryMedicine,
      comparisonMedicines,
      substituteCandidates,
      mode
    );

    // Call Gemini AI using REST API (like voiceAssistant.js)
    let analysisText = '';
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.8,
            topK: 40
          }
        },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid AI response structure');
      }

      analysisText = response.data.candidates[0].content.parts[0].text;
    } catch (aiError) {
      console.error('❌ Gemini API Error:', aiError.message);
      throw aiError;
    }

    // Log the analysis request
    console.log(`📊 Medicine Analysis: ${primaryMedicine.name} (Mode: ${mode})`);

    // Return structured response
    res.json({
      success: true,
      analysis: {
        text: analysisText,
        primaryMedicine: {
          id: primaryMedicine._id,
          name: primaryMedicine.name,
          genericName: primaryMedicine.genericName,
          price: primaryMedicine.price,
          manufacturer: primaryMedicine.manufacturer
        },
        comparisonMedicines: comparisonMedicines.map(m => ({
          id: m._id,
          name: m.name,
          genericName: m.genericName,
          price: m.price,
          manufacturer: m.manufacturer
        })),
        substitutes: substituteCandidates.map(m => ({
          id: m._id,
          name: m.name,
          genericName: m.genericName,
          price: m.price,
          manufacturer: m.manufacturer,
          savings: ((primaryMedicine.price - m.price) / primaryMedicine.price * 100).toFixed(1)
        })),
        mode: mode,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Medicine analysis error:', error);
    
    // Handle Gemini API specific errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error. Please contact support.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to analyze medicine. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/medicine-analyser/search-medicines
 * Search medicines for analysis (with autocomplete support)
 */
router.get('/search-medicines', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .limit(parseInt(limit))
    .select('name genericName brand dosage price manufacturer form')
    .sort({ name: 1 });

    res.json({
      success: true,
      medicines: medicines.map(m => ({
        id: m._id,
        name: m.name,
        genericName: m.genericName,
        brand: m.brand,
        dosage: m.dosage,
        price: m.price,
        manufacturer: m.manufacturer,
        form: m.form
      })),
      count: medicines.length
    });

  } catch (error) {
    console.error('❌ Medicine search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search medicines'
    });
  }
});

/**
 * GET /api/medicine-analyser/medicine/:id
 * Get detailed medicine information for analysis
 */
router.get('/medicine/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    // Find potential substitutes
    let substitutes = [];
    if (medicine.genericName) {
      substitutes = await Medicine.find({
        genericName: medicine.genericName,
        _id: { $ne: medicine._id },
        isActive: true
      })
      .limit(10)
      .select('name genericName dosage price manufacturer')
      .sort({ price: 1 });
    }

    res.json({
      success: true,
      medicine: {
        id: medicine._id,
        name: medicine.name,
        genericName: medicine.genericName,
        brand: medicine.brand,
        dosage: medicine.dosage,
        form: medicine.form,
        price: medicine.price,
        manufacturer: medicine.manufacturer,
        description: medicine.description,
        requiresPrescription: medicine.requiresPrescription,
        category: medicine.category
      },
      substitutes: substitutes.map(s => ({
        id: s._id,
        name: s.name,
        genericName: s.genericName,
        dosage: s.dosage,
        price: s.price,
        manufacturer: s.manufacturer,
        savings: ((medicine.price - s.price) / medicine.price * 100).toFixed(1)
      }))
    });

  } catch (error) {
    console.error('❌ Medicine details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medicine details'
    });
  }
});

/**
 * POST /api/medicine-analyser/compare
 * Compare medicines side-by-side with detailed information
 */
router.post('/compare', async (req, res) => {
  try {
    const { medicineIds } = req.body;

    if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 medicine IDs are required for comparison'
      });
    }

    if (medicineIds.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 medicines can be compared at once'
      });
    }

    // Fetch all medicines
    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
      isActive: true
    });

    if (medicines.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Not enough valid medicines found for comparison'
      });
    }

    // Determine cost-effectiveness tags
    const prices = medicines.map(m => m.price).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const comparisonData = medicines.map(medicine => {
      // Calculate cost tag
      let costTag = 'Balanced';
      if (medicine.price <= minPrice + priceRange * 0.3) {
        costTag = 'Budget Friendly';
      } else if (medicine.price >= maxPrice - priceRange * 0.3) {
        costTag = 'Premium';
      }

      return {
        id: medicine._id,
        brandName: medicine.name,
        genericName: medicine.genericName || 'Not specified',
        activeIngredients: medicine.activeIngredients || [medicine.genericName || 'Not specified'],
        strength: medicine.strength || medicine.dosage || 'Not specified',
        dosageForm: medicine.form || 'Not specified',
        uses: medicine.uses || ['Information not available'],
        dosageInstructions: medicine.dosageInstructions || 'Consult doctor for dosage',
        sideEffects: medicine.sideEffects || ['Consult product information'],
        price: medicine.price,
        manufacturer: medicine.manufacturer || 'Not specified',
        requiresPrescription: medicine.requiresPrescription,
        therapeuticClass: medicine.therapeuticClass || 'Not specified',
        costTag,
        description: medicine.description || ''
      };
    });

    res.json({
      success: true,
      comparison: comparisonData,
      summary: {
        totalCompared: comparisonData.length,
        priceRange: { min: minPrice, max: maxPrice },
        budgetOption: comparisonData.find(m => m.costTag === 'Budget Friendly')?.brandName || 'None',
        premiumOption: comparisonData.find(m => m.costTag === 'Premium')?.brandName || 'None'
      }
    });

  } catch (error) {
    console.error('❌ Medicine comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare medicines'
    });
  }
});

/**
 * POST /api/medicine-analyser/find-substitutes
 * Find intelligent substitutes based on ingredients and therapeutic class
 */
router.post('/find-substitutes', async (req, res) => {
  try {
    const { medicineId, matchBy = 'both' } = req.body; // matchBy: 'ingredient', 'class', 'both'

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        error: 'Medicine ID is required'
      });
    }

    // Fetch the primary medicine
    const primaryMedicine = await Medicine.findById(medicineId);
    
    if (!primaryMedicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    let query = { 
      _id: { $ne: medicineId },
      isActive: true 
    };

    // Build query based on match criteria
    if (matchBy === 'ingredient' || matchBy === 'both') {
      if (primaryMedicine.genericName || primaryMedicine.activeIngredients?.length) {
        const ingredients = primaryMedicine.activeIngredients || [primaryMedicine.genericName];
        query.$or = [
          { genericName: primaryMedicine.genericName },
          { activeIngredients: { $in: ingredients } }
        ];
      }
    }

    if (matchBy === 'class' || matchBy === 'both') {
      if (primaryMedicine.therapeuticClass) {
        if (!query.$or) query.$or = [];
        query.$or.push({ therapeuticClass: primaryMedicine.therapeuticClass });
      }
    }

    // If no valid matching criteria, return empty
    if (!query.$or || query.$or.length === 0) {
      return res.json({
        success: true,
        primary: formatMedicineDetails(primaryMedicine),
        substitutes: [],
        message: 'No matching substitutes found. Try adding more medicine details.'
      });
    }

    // Find substitutes
    const substitutes = await Medicine.find(query).limit(20).sort({ price: 1 });

    // Categorize substitutes
    const exactMatches = [];
    const similarMatches = [];
    const classMatches = [];

    substitutes.forEach(sub => {
      // Calculate match score
      let matchType = 'class';
      
      // Exact match: same generic name or all active ingredients match
      if (sub.genericName === primaryMedicine.genericName) {
        matchType = 'exact';
      } else if (primaryMedicine.activeIngredients?.length && sub.activeIngredients?.length) {
        const commonIngredients = sub.activeIngredients.filter(ing => 
          primaryMedicine.activeIngredients.includes(ing)
        );
        if (commonIngredients.length > 0) {
          matchType = 'similar';
        }
      }

      // Calculate savings
      const savings = primaryMedicine.price > 0 
        ? ((primaryMedicine.price - sub.price) / primaryMedicine.price * 100).toFixed(1)
        : '0';

      const formattedSub = {
        ...formatMedicineDetails(sub),
        savings: parseFloat(savings),
        matchType,
        matchReason: getMatchReason(matchType, primaryMedicine, sub)
      };

      if (matchType === 'exact') exactMatches.push(formattedSub);
      else if (matchType === 'similar') similarMatches.push(formattedSub);
      else classMatches.push(formattedSub);
    });

    // Sort by savings within each category
    const sortBySavings = (a, b) => b.savings - a.savings;
    exactMatches.sort(sortBySavings);
    similarMatches.sort(sortBySavings);
    classMatches.sort(sortBySavings);

    res.json({
      success: true,
      primary: formatMedicineDetails(primaryMedicine),
      substitutes: {
        exact: exactMatches,
        similar: similarMatches,
        therapeutic: classMatches
      },
      summary: {
        totalFound: substitutes.length,
        exactMatches: exactMatches.length,
        similarMatches: similarMatches.length,
        therapeuticMatches: classMatches.length,
        bestSavings: exactMatches[0]?.savings || similarMatches[0]?.savings || 0
      }
    });

  } catch (error) {
    console.error('❌ Substitute finding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find substitutes'
    });
  }
});

// Helper function to format medicine details
function formatMedicineDetails(medicine) {
  // Determine cost tag
  let costTag = 'Balanced';
  if (medicine.price < 50) costTag = 'Budget Friendly';
  else if (medicine.price > 200) costTag = 'Premium';

  return {
    id: medicine._id,
    brandName: medicine.name,
    genericName: medicine.genericName || 'Not specified',
    activeIngredients: medicine.activeIngredients || [medicine.genericName || 'Not specified'],
    strength: medicine.strength || medicine.dosage || 'Not specified',
    dosageForm: medicine.form || 'tablet',
    uses: medicine.uses || ['Information not available'],
    dosageInstructions: medicine.dosageInstructions || 'Consult doctor for dosage',
    sideEffects: medicine.sideEffects || ['Consult product information'],
    price: medicine.price,
    manufacturer: medicine.manufacturer || 'Not specified',
    requiresPrescription: medicine.requiresPrescription || false,
    therapeuticClass: medicine.therapeuticClass || 'Not specified',
    costTag,
    description: medicine.description || ''
  };
}

// Helper function to get match reason
function getMatchReason(matchType, primary, substitute) {
  if (matchType === 'exact') {
    return `Same active ingredient: ${primary.genericName}`;
  } else if (matchType === 'similar') {
    const common = substitute.activeIngredients?.filter(ing => 
      primary.activeIngredients?.includes(ing)
    ) || [];
    return `Similar ingredients: ${common.join(', ')}`;
  } else {
    return `Same therapeutic class: ${primary.therapeuticClass}`;
  }
}

module.exports = router;
