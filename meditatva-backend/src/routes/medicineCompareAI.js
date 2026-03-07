const express = require('express');
const router = express.Router();
const { compareMedicinesWithAI, getBasicComparison } = require('../services/geminiMedicineCompare');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// In-memory medicine database (loaded from CSV)
let medicines = [];
let medicinesLoaded = false;

// Load medicines from CSV
function loadMedicines() {
  if (medicinesLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, '..', '..', '..', 'A_Z_medicines_dataset_of_India.csv');
    
    medicines = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        medicines.push({
          id: row.id || row.srno,
          name: row.name,
          manufacturer: row.manufacturer || row.Manufacturer,
          price: parseFloat(row.price) || 0,
          discontinued: row.Is_discontinued === '1' || row.discontinued === 'true',
          type: row.type,
          packSize: row.pack_size_label || row.packSize,
          composition1: row.short_composition1 || row.composition1,
          composition2: row.short_composition2 || row.composition2
        });
      })
      .on('end', () => {
        medicinesLoaded = true;
        console.log(`✅ Loaded ${medicines.length} medicines for AI comparison`);
        resolve();
      })
      .on('error', reject);
  });
}

// Load medicines on server start
loadMedicines().catch(console.error);

/**
 * POST /api/medicines/compare-ai
 * AI-powered medicine comparison using Gemini
 * 
 * Body: {
 *   medicine1: "Dolo 650 Tablet",
 *   medicine2: "Crocin Advance Tablet"
 * }
 */
router.post('/compare-ai', async (req, res) => {
  try {
    const { medicine1Name, medicine2Name } = req.body;

    if (!medicine1Name || !medicine2Name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both medicine1Name and medicine2Name'
      });
    }

    // Ensure medicines are loaded
    if (!medicinesLoaded) {
      await loadMedicines();
    }

    // Find medicine details from database
    const med1 = medicines.find(m => 
      m.name.toLowerCase() === medicine1Name.toLowerCase()
    );
    
    const med2 = medicines.find(m => 
      m.name.toLowerCase() === medicine2Name.toLowerCase()
    );

    if (!med1 || !med2) {
      return res.status(404).json({
        success: false,
        error: 'One or both medicines not found in database',
        found: {
          medicine1: !!med1,
          medicine2: !!med2
        }
      });
    }

    // Get AI comparison
    const comparisonResult = await compareMedicinesWithAI(med1, med2);

    if (!comparisonResult.success) {
      // Fall back to basic comparison if AI fails
      console.warn('AI comparison failed, using basic comparison');
      const basicResult = getBasicComparison(med1, med2);
      return res.json(basicResult);
    }

    // Add original medicine data to response
    comparisonResult.data.originalData = {
      medicine1: med1,
      medicine2: med2
    };

    res.json(comparisonResult);

  } catch (error) {
    console.error('Compare AI Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare medicines',
      details: error.message
    });
  }
});

/**
 * GET /api/medicines/compare-ai/test
 * Test endpoint to verify AI comparison works
 */
router.get('/compare-ai/test', async (req, res) => {
  try {
    // Test with two common medicines
    const med1 = medicines.find(m => m.name.toLowerCase().includes('dolo 650'));
    const med2 = medicines.find(m => m.name.toLowerCase().includes('crocin'));

    if (!med1 || !med2) {
      return res.json({
        success: false,
        error: 'Test medicines not found',
        medicinesCount: medicines.length
      });
    }

    const result = await compareMedicinesWithAI(med1, med2);
    
    res.json({
      success: true,
      testResult: result,
      medicine1: med1.name,
      medicine2: med2.name
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
