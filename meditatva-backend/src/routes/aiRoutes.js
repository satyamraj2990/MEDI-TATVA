const express = require('express');
const router = express.Router();
const { compareAnyMedicines } = require('../services/aiMedicineCompare');

/**
 * POST /api/ai/compare-medicines
 * AI-powered medicine comparison using MediTatva AI Engine
 * No database validation - compares ANY medicine names using AI
 * 
 * Body: {
 *   medicine1: "Dolo 650",
 *   medicine2: "Paracetamol"
 * }
 */
router.post('/compare-medicines', async (req, res) => {
  try {
    const { medicine1, medicine2 } = req.body;

    // Validate input
    if (!medicine1 || !medicine2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both medicine names',
        aiEngine: 'MediTatva AI Engine'
      });
    }

    if (medicine1.trim().length < 2 || medicine2.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Medicine names must be at least 2 characters',
        aiEngine: 'MediTatva AI Engine'
      });
    }

    console.log(`🤖 MediTatva AI: Comparing "${medicine1}" vs "${medicine2}"`);

    // Get AI comparison - NO database lookup required
    const comparisonResult = await compareAnyMedicines(medicine1, medicine2);

    if (!comparisonResult.success) {
      return res.status(500).json({
        success: false,
        error: comparisonResult.error || 'Failed to generate comparison',
        details: comparisonResult.details,
        aiEngine: 'MediTatva AI Engine'
      });
    }

    // Return successful comparison
    res.json({
      success: true,
      data: comparisonResult.data,
      aiEngine: 'MediTatva AI Engine',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Comparison Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare medicines',
      details: error.message,
      aiEngine: 'MediTatva AI Engine'
    });
  }
});

/**
 * GET /api/ai/health
 * Check if MediTatva AI Engine is available
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    aiEngine: 'MediTatva AI Engine',
    capabilities: [
      'Medicine Comparison',
      'Medical Report Analysis',
      'Health Recommendations'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
