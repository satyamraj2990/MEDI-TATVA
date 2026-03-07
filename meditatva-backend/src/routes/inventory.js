const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Get low stock alerts
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);

// Get inventory by medicine ID
router.get('/medicine/:medicineId', inventoryController.getInventoryByMedicine);

// Get all inventory
router.get('/', inventoryController.getAllInventory);

// Create inventory record
router.post('/', inventoryController.createInventory);

// Restock inventory
router.put('/:id/restock', inventoryController.restockInventory);

// Adjust inventory (manual correction)
router.put('/:id/adjust', inventoryController.adjustInventory);

module.exports = router;
