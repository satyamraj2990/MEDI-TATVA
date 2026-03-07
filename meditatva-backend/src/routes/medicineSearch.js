const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// In-memory medicine storage
let medicines = [];
let isLoaded = false;

/**
 * Load medicines from CSV on server startup
 */
function loadMedicines() {
  if (isLoaded) {
    console.log('✅ Medicines already loaded');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, '../../../A_Z_medicines_dataset_of_India.csv');
    
    console.log('📦 Loading medicine dataset from CSV...');
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean and normalize the data
        medicines.push({
          id: data.id,
          name: data.name?.trim() || '',
          price: parseFloat(data['price(₹)']) || 0,
          discontinued: data.Is_discontinued === 'True',
          manufacturer: data.manufacturer_name?.trim() || '',
          type: data.type?.trim() || '',
          packSize: data.pack_size_label?.trim() || '',
          composition1: data.short_composition1?.trim() || '',
          composition2: data.short_composition2?.trim() || ''
        });
      })
      .on('end', () => {
        isLoaded = true;
        console.log(`✅ Medicine dataset loaded: ${medicines.length} medicines`);
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error loading medicine dataset:', error);
        reject(error);
      });
  });
}

/**
 * GET /api/medicines/search?q=paracetamol
 * Search medicines by name or composition
 */
router.get('/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase()?.trim();
    
    if (!query) {
      return res.json([]);
    }

    if (!isLoaded || medicines.length === 0) {
      return res.status(503).json({ 
        error: 'Medicine database is loading. Please try again in a moment.' 
      });
    }

    // Search by name or composition
    const results = medicines
      .filter(medicine => {
        const nameMatch = medicine.name?.toLowerCase().includes(query);
        const comp1Match = medicine.composition1?.toLowerCase().includes(query);
        const comp2Match = medicine.composition2?.toLowerCase().includes(query);
        const manufacturerMatch = medicine.manufacturer?.toLowerCase().includes(query);
        
        return nameMatch || comp1Match || comp2Match || manufacturerMatch;
      })
      .filter(medicine => !medicine.discontinued) // Exclude discontinued medicines
      .slice(0, 10); // Return top 10 results

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.json([]); // Return empty array instead of error
  }
});

/**
 * GET /api/medicines/substitutes?name=paracetamol
 * Find substitute medicines with same composition
 */
router.get('/substitutes', (req, res) => {
  try {
    const name = req.query.name?.toLowerCase()?.trim();
    
    if (!name) {
      return res.json([]);
    }

    if (!isLoaded || medicines.length === 0) {
      return res.status(503).json({ 
        error: 'Medicine database is loading. Please try again in a moment.' 
      });
    }

    // Find the target medicine
    const targetMedicine = medicines.find(medicine => 
      medicine.name?.toLowerCase().includes(name)
    );

    if (!targetMedicine) {
      return res.json([]); // Medicine not found
    }

    // Find substitutes with same composition
    const substitutes = medicines
      .filter(medicine => {
        // Must have same primary composition
        const sameComposition = 
          medicine.composition1 === targetMedicine.composition1 &&
          medicine.composition1 !== '';
        
        // Exclude the original medicine and discontinued ones
        const isDifferent = medicine.name !== targetMedicine.name;
        const isActive = !medicine.discontinued;
        
        return sameComposition && isDifferent && isActive;
      })
      .sort((a, b) => a.price - b.price) // Sort by price (cheapest first)
      .slice(0, 5); // Return top 5 substitutes

    // Add savings information
    const substitutesWithSavings = substitutes.map(sub => ({
      ...sub,
      savings: targetMedicine.price > 0 
        ? Math.round(((targetMedicine.price - sub.price) / targetMedicine.price) * 100)
        : 0,
      originalPrice: targetMedicine.price
    }));

    res.json(substitutesWithSavings);
  } catch (error) {
    console.error('Substitute finder error:', error);
    res.json([]); // Return empty array instead of error
  }
});

/**
 * POST /api/medicines/compare
 * Compare multiple medicines by their names or IDs
 */
router.post('/compare', (req, res) => {
  try {
    const { medicines: medicineNames } = req.body;
    
    if (!medicineNames || !Array.isArray(medicineNames) || medicineNames.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide medicine names in the request body' 
      });
    }

    if (!isLoaded || medicines.length === 0) {
      return res.status(503).json({ 
        error: 'Medicine database is loading. Please try again in a moment.' 
      });
    }

    // Find each medicine in the database
    const foundMedicines = [];
    const notFound = [];

    medicineNames.forEach(searchName => {
      const name = searchName.toLowerCase().trim();
      const medicine = medicines.find(m => 
        m.name?.toLowerCase() === name || 
        m.name?.toLowerCase().includes(name)
      );
      
      if (medicine) {
        foundMedicines.push(medicine);
      } else {
        notFound.push(searchName);
      }
    });

    if (foundMedicines.length === 0) {
      return res.status(404).json({
        error: 'No medicines found',
        notFound
      });
    }

    // Return the medicines for comparison
    res.json({
      success: true,
      medicines: foundMedicines,
      notFound: notFound.length > 0 ? notFound : undefined
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ 
      error: 'Failed to compare medicines. Please try again.' 
    });
  }
});

/**
 * GET /api/medicines/stats
 * Get database statistics
 */
router.get('/stats', (req, res) => {
  res.json({
    loaded: isLoaded,
    totalMedicines: medicines.length,
    activeMedicines: medicines.filter(m => !m.discontinued).length
  });
});

// Export router and loader function
module.exports = { router, loadMedicines };
