const Inventory = require('../models/Inventory');
const Medicine = require('../models/Medicine');
const realtimeService = require('../services/realtimeService');

/**
 * Get all inventory items with medicine details
 * GET /api/inventory
 */
exports.getAllInventory = async (req, res) => {
  console.log('📦 GET /api/inventory - Request received');
  try {
    const { page = 1, limit = 50, lowStock } = req.query;
    console.log('📦 Query params:', { page, limit, lowStock });
    
    let query = {};
    if (lowStock === 'true') {
      // Find items where current_stock <= reorderLevel
      const allInventory = await Inventory.find().lean();
      const lowStockIds = allInventory
        .filter(inv => inv.current_stock <= inv.reorderLevel)
        .map(inv => inv._id);
      query._id = { $in: lowStockIds };
    }

    const inventory = await Inventory.find(query)
      .populate('medicine', 'name genericName brand price category')
      .sort({ current_stock: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Inventory.countDocuments(query);
    console.log(`✅ Found ${inventory.length} inventory items (total: ${total})`);

    res.json({
      success: true,
      count: inventory.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: inventory
    });
  } catch (error) {
    console.error('❌ Get inventory error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory',
      message: error.message
    });
  }
};

/**
 * Get inventory for specific medicine
 * GET /api/inventory/medicine/:medicineId
 */
exports.getInventoryByMedicine = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ 
      medicine: req.params.medicineId 
    }).populate('medicine');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found for this medicine'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory by medicine error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory',
      message: error.message
    });
  }
};

/**
 * Update inventory stock (restock operation)
 * PUT /api/inventory/:id/restock
 * Body: { quantity, notes }
 */
exports.restockInventory = async (req, res) => {
  try {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    // Add to current stock
    inventory.current_stock += parseInt(quantity);
    inventory.lastRestocked = new Date();
    if (notes) inventory.notes = notes;

    await inventory.save();

    const updated = await Inventory.findById(inventory._id)
      .populate('medicine', 'name genericName brand');

    // Broadcast realtime update
    realtimeService.broadcastInventoryUpdate({
      action: 'restock',
      inventory: updated
    });

    res.json({
      success: true,
      message: `Added ${quantity} units to inventory`,
      data: updated
    });
  } catch (error) {
    console.error('Restock inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restock inventory',
      message: error.message
    });
  }
};

/**
 * Adjust inventory stock (manual correction)
 * PUT /api/inventory/:id/adjust
 * Body: { newStock, reason }
 */
exports.adjustInventory = async (req, res) => {
  try {
    const { newStock, reason } = req.body;

    if (newStock === undefined || newStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'New stock must be a non-negative number'
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    const oldStock = inventory.current_stock;
    inventory.current_stock = parseInt(newStock);
    inventory.notes = reason || `Stock adjusted from ${oldStock} to ${newStock}`;

    await inventory.save();

    const updated = await Inventory.findById(inventory._id)
      .populate('medicine', 'name genericName brand');

    // Broadcast realtime update
    realtimeService.broadcastInventoryUpdate({
      action: 'adjust',
      inventory: updated
    });

    res.json({
      success: true,
      message: `Stock adjusted from ${oldStock} to ${newStock}`,
      data: updated
    });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adjust inventory',
      message: error.message
    });
  }
};

/**
 * Get low stock alerts
 * GET /api/inventory/alerts/low-stock
 */
exports.getLowStockAlerts = async (req, res) => {
  try {
    const allInventory = await Inventory.find()
      .populate('medicine', 'name genericName brand category')
      .lean();

    const lowStockItems = allInventory.filter(
      inv => inv.current_stock <= inv.reorderLevel
    );

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get low stock alerts',
      message: error.message
    });
  }
};

/**
 * Create inventory record for new medicine
 * POST /api/inventory
 */
exports.createInventory = async (req, res) => {
  console.log('📝 POST /api/inventory - Create inventory request');
  console.log('📦 Request body:', req.body);
  
  try {
    const { medicineId, initialStock = 0, reorderLevel = 10, location } = req.body;

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      console.error('❌ Medicine not found:', medicineId);
      return res.status(404).json({
        success: false,
        error: 'Medicine not found'
      });
    }

    // Check if inventory already exists
    const existing = await Inventory.findOne({ medicine: medicineId });
    if (existing) {
      console.warn('⚠️ Inventory already exists for medicine:', medicineId);
      return res.status(409).json({
        success: false,
        error: 'Inventory record already exists for this medicine'
      });
    }

    const inventory = new Inventory({
      medicine: medicineId,
      current_stock: initialStock,
      reorderLevel,
      location: location || 'Main Store',
      lastRestocked: initialStock > 0 ? new Date() : null
    });

    await inventory.save();
    console.log('✅ Inventory created:', inventory._id);

    const created = await Inventory.findById(inventory._id)
      .populate('medicine', 'name genericName brand');

    // Broadcast realtime update
    realtimeService.broadcastInventoryUpdate({
      action: 'create',
      inventory: created
    });

    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    console.error('❌ Create inventory error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({
      success: false,
      error: 'Failed to create inventory record',
      message: error.message
    });
  }
};
