const Inventory = require('../models/Inventory');
const Medicine = require('../models/Medicine');

/**
 * Stock Validation Service
 * Centralized service for all stock-related validations
 * Ensures consistency across the application
 */

class StockValidationService {
  /**
   * Validate if medicine is available for billing
   * @param {String} medicineId - Medicine ObjectId
   * @param {Number} requestedQuantity - Quantity to validate
   * @returns {Object} { valid, message, availableStock }
   */
  async validateAvailability(medicineId, requestedQuantity) {
    try {
      // Get medicine
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return {
          valid: false,
          message: 'Medicine not found',
          availableStock: 0
        };
      }

      // Check if medicine is active
      if (!medicine.isActive) {
        return {
          valid: false,
          message: 'Medicine is inactive',
          availableStock: 0
        };
      }

      // Get inventory
      const inventory = await Inventory.findOne({ medicine: medicineId });
      if (!inventory) {
        return {
          valid: false,
          message: 'No inventory record found',
          availableStock: 0
        };
      }

      // Check expiry date
      if (inventory.expiryDate && inventory.expiryDate < new Date()) {
        return {
          valid: false,
          message: 'Medicine has expired',
          availableStock: 0,
          expiryDate: inventory.expiryDate
        };
      }

      // Check stock quantity
      if (inventory.current_stock < requestedQuantity) {
        return {
          valid: false,
          message: `Insufficient stock. Available: ${inventory.current_stock}, Requested: ${requestedQuantity}`,
          availableStock: inventory.current_stock
        };
      }

      // All checks passed
      return {
        valid: true,
        message: 'Stock available',
        availableStock: inventory.current_stock,
        medicine,
        inventory
      };
    } catch (error) {
      console.error('Stock validation error:', error);
      return {
        valid: false,
        message: 'Validation error: ' + error.message,
        availableStock: 0
      };
    }
  }

  /**
   * Validate multiple items at once
   * @param {Array} items - Array of { medicineId, quantity }
   * @returns {Object} { valid, results, errors }
   */
  async validateBatch(items) {
    const results = [];
    const errors = [];

    for (const item of items) {
      const result = await this.validateAvailability(item.medicineId, item.quantity);
      
      results.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        ...result
      });

      if (!result.valid) {
        errors.push({
          medicineId: item.medicineId,
          error: result.message
        });
      }
    }

    return {
      valid: errors.length === 0,
      results,
      errors
    };
  }

  /**
   * Get all billable medicines (in stock, not expired, active)
   * @param {String} searchTerm - Optional search term
   * @returns {Array} Array of billable medicines with stock info
   */
  async getBillableMedicines(searchTerm = '') {
    try {
      // Find inventory items with stock
      const inventoryItems = await Inventory.find({
        current_stock: { $gt: 0 }
      }).populate('medicine').lean();

      const now = new Date();
      
      // Filter and transform
      let billableMedicines = inventoryItems
        .filter(inv => {
          // Filter out expired
          if (inv.expiryDate && inv.expiryDate < now) return false;
          
          // Filter inactive medicines
          if (!inv.medicine || !inv.medicine.isActive) return false;
          
          // Apply search filter
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const med = inv.medicine;
            const matches = 
              med.name.toLowerCase().includes(search) ||
              (med.genericName && med.genericName.toLowerCase().includes(search)) ||
              (med.brand && med.brand.toLowerCase().includes(search));
            
            if (!matches) return false;
          }
          
          return true;
        })
        .map(inv => ({
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

      return billableMedicines;
    } catch (error) {
      console.error('Get billable medicines error:', error);
      throw error;
    }
  }

  /**
   * Check for low stock items
   * @returns {Array} Array of low stock items
   */
  async getLowStockItems() {
    try {
      const inventoryItems = await Inventory.find()
        .populate('medicine', 'name genericName brand')
        .lean();

      return inventoryItems
        .filter(inv => inv.current_stock <= inv.reorderLevel)
        .map(inv => ({
          medicineId: inv.medicine._id,
          medicineName: inv.medicine.name,
          currentStock: inv.current_stock,
          reorderLevel: inv.reorderLevel,
          deficit: inv.reorderLevel - inv.current_stock
        }));
    } catch (error) {
      console.error('Get low stock items error:', error);
      throw error;
    }
  }

  /**
   * Check for expired medicines
   * @returns {Array} Array of expired medicines
   */
  async getExpiredMedicines() {
    try {
      const now = new Date();
      const inventoryItems = await Inventory.find({
        expiryDate: { $lt: now }
      }).populate('medicine', 'name genericName brand').lean();

      return inventoryItems.map(inv => ({
        medicineId: inv.medicine._id,
        medicineName: inv.medicine.name,
        expiryDate: inv.expiryDate,
        currentStock: inv.current_stock,
        batchNumber: inv.batchNumber
      }));
    } catch (error) {
      console.error('Get expired medicines error:', error);
      throw error;
    }
  }
}

module.exports = new StockValidationService();
