const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Get available medicines for billing (must be before /:id route)
router.get('/available-medicines', invoiceController.getAvailableMedicines);

// Preview invoice (validate without creating)
router.post('/preview', invoiceController.previewInvoice);

// Finalize invoice (create and update inventory)
router.post('/finalize', invoiceController.finalizeInvoice);

// Get invoice statistics
router.get('/stats', invoiceController.getInvoiceStats);

// Get all invoices
router.get('/', invoiceController.getAllInvoices);

// Get single invoice
router.get('/:id', invoiceController.getInvoice);

module.exports = router;
