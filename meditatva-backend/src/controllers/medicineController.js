const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const realtimeService = require('../services/realtimeService');

/**
 * Search medicines with stock information
 * GET /api/medicines/search?q=searchTerm
 */
exports.searchMedicines = async (req, res) => {
  try {
    const { q = '', limit = 50 } = req.query;
    
    // Search by name, generic name, or brand
    const searchRegex = new RegExp(q, 'i');
    const medicines = await Medicine.find({
      $or: [
        { name: searchRegex },
        { genericName: searchRegex },
        { brand: searchRegex }
      ],
      isActive: true
    })
    .limit(parseInt(limit))
    .lean();

    // Get inventory data for found medicines
    const medicineIds = medicines.map(m => m._id);
    const inventoryRecords = await Inventory.find({ 
      medicine: { $in: medicineIds } 
    }).lean();

    // Create a map of medicine ID to stock
    const stockMap = {};
    inventoryRecords.forEach(inv => {
      stockMap[inv.medicine.toString()] = inv.current_stock;
    });

    // Attach stock information to each medicine
    const results = medicines.map(medicine => ({
      ...medicine,
      current_stock: stockMap[medicine._id.toString()] || 0,
      inStock: (stockMap[medicine._id.toString()] || 0) > 0
    }));

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search medicines',
      message: error.message
    });
  }
};

/**
 * Get single medicine with stock
 * GET /api/medicines/:id
 */
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).lean();
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    // Get inventory
    const inventory = await Inventory.findOne({ medicine: medicine._id }).lean();
    
    res.json({
      success: true,
      data: {
        ...medicine,
        current_stock: inventory ? inventory.current_stock : 0,
        inStock: inventory && inventory.current_stock > 0
      }
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medicine',
      message: error.message
    });
  }
};

/**
 * Create new medicine (admin only)
 * POST /api/medicines
 */
exports.createMedicine = async (req, res) => {
  console.log('📝 POST /api/medicines - Create medicine request');
  console.log('📦 Request body:', req.body);
  
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    console.log('✅ Medicine saved:', medicine._id);

    // Create initial inventory record
    const inventory = new Inventory({
      medicine: medicine._id,
      current_stock: req.body.initialStock || 0,
      reorderLevel: Math.max(10, Math.floor((req.body.initialStock || 0) * 0.2)),
      location: 'Main Store',
      lastRestocked: req.body.initialStock > 0 ? new Date() : null
    });
    await inventory.save();
    console.log('✅ Inventory created:', inventory._id);

    // Populate medicine data for broadcast
    const inventoryWithMedicine = await Inventory.findById(inventory._id)
      .populate('medicine', 'name genericName brand price category')
      .lean();

    // Broadcast realtime update to all connected clients
    realtimeService.broadcastInventoryUpdate({
      action: 'create',
      inventory: inventoryWithMedicine
    });
    console.log('📡 Broadcasted inventory creation to connected clients');

    res.status(201).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('❌ Create medicine error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({
      success: false,
      error: 'Failed to create medicine',
      message: error.message
    });
  }
};

/**
 * Update medicine (admin only)
 * PUT /api/medicines/:id
 */
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update medicine',
      message: error.message
    });
  }
};

/**
 * Get all medicines (with pagination)
 * GET /api/medicines
 */
exports.getAllMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, requiresPrescription } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (requiresPrescription !== undefined) {
      query.requiresPrescription = requiresPrescription === 'true';
    }

    const medicines = await Medicine.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Medicine.countDocuments(query);

    // Get inventory for all medicines
    const medicineIds = medicines.map(m => m._id);
    const inventoryRecords = await Inventory.find({ 
      medicine: { $in: medicineIds } 
    }).lean();

    const stockMap = {};
    inventoryRecords.forEach(inv => {
      stockMap[inv.medicine.toString()] = inv.current_stock;
    });

    const results = medicines.map(medicine => ({
      ...medicine,
      current_stock: stockMap[medicine._id.toString()] || 0
    }));

    res.json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: results
    });
  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medicines',
      message: error.message
    });
  }
};
