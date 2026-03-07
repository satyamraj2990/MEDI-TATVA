const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  medicine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine', 
    required: true, 
    unique: true 
  },
  current_stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  reorderLevel: { 
    type: Number, 
    default: 10 
  },
  location: { 
    type: String,
    default: 'Main Store'
  },
  lastRestocked: Date,
  notes: String
}, { 
  timestamps: true 
});

// Index for quick lookups
InventorySchema.index({ medicine: 1 });

// Virtual to check if reorder needed
InventorySchema.virtual('needsReorder').get(function() {
  return this.current_stock <= this.reorderLevel;
});

// Virtual to check if expired
InventorySchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Method to check if available for billing
InventorySchema.methods.isAvailableForBilling = function() {
  // Not available if no stock
  if (this.current_stock <= 0) return false;
  
  // Not available if expired
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  
  return true;
};

module.exports = mongoose.model('Inventory', InventorySchema);
