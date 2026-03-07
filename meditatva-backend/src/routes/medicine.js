const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Search medicines (with stock info)
router.get('/search', medicineController.searchMedicines);

// Get all medicines
router.get('/', medicineController.getAllMedicines);

// Get single medicine
router.get('/:id', medicineController.getMedicine);

// Create medicine (admin only - add auth middleware as needed)
router.post('/', medicineController.createMedicine);

// Update medicine (admin only - add auth middleware as needed)
router.put('/:id', medicineController.updateMedicine);

module.exports = router;
