const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const realtimeService = require('../services/realtimeService');

/**
 * Get all available medicines for billing
 * GET /api/invoices/available-medicines
 * Returns only in-stock, non-expired medicines
 */
exports.getAvailableMedicines = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    // Get all inventory items with stock > 0
    const inventoryQuery = { current_stock: { $gt: 0 } };
    
    const inventoryItems = await Inventory.find(inventoryQuery)
      .populate('medicine')
      .lean();
    
    // Filter out expired medicines and apply search
    const now = new Date();
    let availableMedicines = inventoryItems.filter(inv => {
      // Filter expired
      if (inv.expiryDate && inv.expiryDate < now) return false;
      
      // Filter inactive medicines
      if (inv.medicine && !inv.medicine.isActive) return false;
      
      return true;
    });
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      availableMedicines = availableMedicines.filter(inv => {
        const med = inv.medicine;
        return (
          med.name.toLowerCase().includes(searchLower) ||
          (med.genericName && med.genericName.toLowerCase().includes(searchLower)) ||
          (med.brand && med.brand.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Transform to billing-friendly format
    const results = availableMedicines.map(inv => ({
      medicineId: inv.medicine._id,
      name: inv.medicine.name,
      genericName: inv.medicine.genericName,
      brand: inv.medicine.brand,
      dosage: inv.medicine.dosage,
      form: inv.medicine.form,
      price: inv.medicine.price,
      availableStock: inv.current_stock,
      batchNumber: inv.batchNumber,
      expiryDate: inv.expiryDate,
      requiresPrescription: inv.medicine.requiresPrescription,
      category: inv.medicine.category
    }));
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Get available medicines error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available medicines',
      message: error.message
    });
  }
};

/**
 * Preview invoice (validate without creating)
 * POST /api/invoices/preview
 * Body: { items: [{ medicineId, quantity }] }
 * Returns: validation results, calculations, stock warnings
 */
exports.previewInvoice = async (req, res) => {
  try {
    const { items = [] } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No items provided for preview'
      });
    }
    
    const validationResults = [];
    const previewItems = [];
    let subtotal = 0;
    let hasErrors = false;
    
    for (const item of items) {
      const { medicineId, quantity } = item;
      
      if (!medicineId || !quantity || quantity <= 0) {
        validationResults.push({
          medicineId,
          valid: false,
          error: 'Invalid medicine ID or quantity'
        });
        hasErrors = true;
        continue;
      }
      
      // Get medicine and inventory
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        validationResults.push({
          medicineId,
          valid: false,
          error: 'Medicine not found'
        });
        hasErrors = true;
        continue;
      }
      
      const inventory = await Inventory.findOne({ medicine: medicineId });
      if (!inventory) {
        validationResults.push({
          medicineId,
          medicineName: medicine.name,
          valid: false,
          error: 'No inventory record found'
        });
        hasErrors = true;
        continue;
      }
      
      // Check expiry
      if (inventory.expiryDate && inventory.expiryDate < new Date()) {
        validationResults.push({
          medicineId,
          medicineName: medicine.name,
          valid: false,
          error: 'Medicine has expired',
          expiryDate: inventory.expiryDate
        });
        hasErrors = true;
        continue;
      }
      
      // Check stock availability
      if (inventory.current_stock < quantity) {
        validationResults.push({
          medicineId,
          medicineName: medicine.name,
          valid: false,
          error: 'Insufficient stock',
          requestedQuantity: quantity,
          availableStock: inventory.current_stock
        });
        hasErrors = true;
        continue;
      }
      
      // Valid item
      const lineTotal = medicine.price * quantity;
      subtotal += lineTotal;
      
      validationResults.push({
        medicineId,
        medicineName: medicine.name,
        valid: true,
        quantity,
        unitPrice: medicine.price,
        lineTotal,
        availableStock: inventory.current_stock,
        stockAfterSale: inventory.current_stock - quantity
      });
      
      previewItems.push({
        medicine: medicineId,
        medicineName: medicine.name,
        quantity,
        unitPrice: medicine.price,
        lineTotal
      });
    }
    
    // Calculate totals
    const tax = subtotal * 0; // Configure tax rate as needed
    const discount = 0;
    const total = subtotal + tax - discount;
    
    res.json({
      success: !hasErrors,
      valid: !hasErrors,
      validationResults,
      preview: hasErrors ? null : {
        items: previewItems,
        subtotal,
        tax,
        discount,
        total
      },
      message: hasErrors 
        ? 'Validation failed for one or more items' 
        : 'Invoice preview generated successfully'
    });
    
  } catch (error) {
    console.error('Preview invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview invoice',
      message: error.message
    });
  }
};

/**
 * Finalize invoice and update inventory (atomic operation)
 * POST /api/invoices/finalize
 * Body: {
 *   customerName, customerPhone, pharmacistId, paymentMethod,
 *   items: [{ medicineId, quantity, unitPrice }]
 * }
 * 
 * NOTE: Uses atomic findOneAndUpdate for concurrent safety
 * Works with standalone MongoDB (no replica set required)
 */
exports.finalizeInvoice = async (req, res) => {
  
  try {
    const { 
      customerName, 
      customerPhone, 
      pharmacistId, 
      paymentMethod = 'cash',
      items = [],
      notes,
      prescriptionUrl
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invoice must contain at least one item'
      });
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.medicineId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'All items must have medicineId and positive quantity'
        });
      }
    }

    // Process each item and update inventory atomically
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      
      // Get medicine details
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        throw new Error(`Medicine not found: ${item.medicineId}`);
      }

      // Check if medicine is active
      if (!medicine.isActive) {
        throw new Error(`Medicine is inactive: ${medicine.name}`);
      }

      // Atomic stock deduction with validation
      // This ensures stock is checked and decremented in a single atomic operation
      const updatedInventory = await Inventory.findOneAndUpdate(
        { 
          medicine: item.medicineId,
          current_stock: { $gte: quantity } // Only update if enough stock exists
        },
        { 
          $inc: { current_stock: -quantity } // Atomically decrement stock
        },
        { 
          new: true // Return updated document
        }
      );

      // If update failed, stock was insufficient
      if (!updatedInventory) {
        // Get current stock for error message
        const currentInventory = await Inventory.findOne({ 
          medicine: item.medicineId 
        });
        
        const available = currentInventory ? currentInventory.current_stock : 0;
        
        // Rollback: restore stock for previously processed items
        for (const processedItem of processedItems) {
          await Inventory.findOneAndUpdate(
            { medicine: processedItem.medicine },
            { $inc: { current_stock: processedItem.quantity } }
          );
        }
        
        throw new Error(
          `Insufficient stock for ${medicine.name}. ` +
          `Available: ${available}, Requested: ${quantity}`
        );
      }

      // Check expiry date
      if (updatedInventory.expiryDate && updatedInventory.expiryDate < new Date()) {
        // Rollback stock
        await Inventory.findOneAndUpdate(
          { medicine: item.medicineId },
          { $inc: { current_stock: quantity } }
        );
        
        // Rollback other items
        for (const processedItem of processedItems) {
          await Inventory.findOneAndUpdate(
            { medicine: processedItem.medicine },
            { $inc: { current_stock: processedItem.quantity } }
          );
        }
        
        throw new Error(`Medicine has expired: ${medicine.name}`);
      }

      // Calculate line total
      const unitPrice = item.unitPrice || medicine.price;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    // Calculate totals
    const tax = subtotal * 0; // Configure tax rate as needed
    const discount = 0; // Apply discount logic if needed
    const total = subtotal + tax - discount;

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      pharmacist: pharmacistId,
      customerName,
      customerPhone,
      items: processedItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      notes,
      prescriptionUrl
    });

    await invoice.save();

    // Populate invoice with medicine details
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('items.medicine', 'name genericName brand')
      .populate('pharmacist', 'name email');

    // Broadcast realtime inventory update
    realtimeService.broadcastInventoryUpdate({
      action: 'sale',
      invoice: populatedInvoice,
      affectedMedicines: processedItems.map(item => ({
        medicineId: item.medicine,
        medicineName: item.medicineName,
        quantitySold: item.quantity
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created and inventory updated successfully',
      data: populatedInvoice
    });

  } catch (error) {
    console.error('Finalize invoice error:', error);

    // Check for specific error types
    if (error.message.includes('Insufficient stock')) {
      return res.status(409).json({
        success: false,
        error: 'Out of stock',
        message: error.message
      });
    }

    if (error.message.includes('expired')) {
      return res.status(409).json({
        success: false,
        error: 'Medicine expired',
        message: error.message
      });
    }

    if (error.message.includes('not found') || error.message.includes('inactive')) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to finalize invoice',
      message: error.message
    });
  }
};

/**
 * Get all invoices (with pagination)
 * GET /api/invoices
 */
exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('pharmacist', 'name email')
      .populate('items.medicine', 'name genericName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      count: invoices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invoices',
      message: error.message
    });
  }
};

/**
 * Get single invoice
 * GET /api/invoices/:id
 */
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('pharmacist', 'name email')
      .populate('items.medicine', 'name genericName brand dosage');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invoice',
      message: error.message
    });
  }
};

/**
 * Get invoice statistics
 * GET /api/invoices/stats
 */
exports.getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgInvoiceValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || { totalInvoices: 0, totalRevenue: 0, avgInvoiceValue: 0 }
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invoice statistics',
      message: error.message
    });
  }
};
