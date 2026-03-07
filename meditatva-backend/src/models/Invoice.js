const mongoose = require('mongoose');

const InvoiceLineSchema = new mongoose.Schema({
  medicine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine', 
    required: true 
  },
  medicineName: String,
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
  unitPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  lineTotal: { 
    type: Number, 
    required: true 
  }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  pharmacist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  customerName: String,
  customerPhone: String,
  items: [InvoiceLineSchema],
  subtotal: { 
    type: Number, 
    required: true,
    min: 0
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'upi', 'insurance', 'other'],
    default: 'cash'
  },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending', 'partial', 'refunded'],
    default: 'paid'
  },
  notes: String,
  prescriptionUrl: String
}, { 
  timestamps: true 
});

// Auto-generate invoice number if not provided
InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    this.invoiceNumber = `INV-${date.getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
