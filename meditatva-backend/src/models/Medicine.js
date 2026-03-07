const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  genericName: { 
    type: String,
    trim: true 
  },
  brand: { 
    type: String,
    trim: true 
  },
  dosage: String,
  strength: String, // e.g., "500mg", "10mg/ml"
  form: { 
    type: String, 
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    default: 'tablet'
  },
  activeIngredients: [String], // Array of active ingredients
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  requiresPrescription: { 
    type: Boolean, 
    default: false 
  },
  description: String,
  uses: [String], // Array of medical uses
  dosageInstructions: String, // How to take the medicine
  sideEffects: [String], // Array of common side effects
  manufacturer: String,
  category: String,
  therapeuticClass: String, // e.g., "Antibiotic", "Analgesic", "Antihypertensive"
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Index for faster searches
MedicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);
