const express = require('express');
const { purchaseProduct } = require('../controllers/purchaseController');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to purchase a product
router.post('/purchase/:productId', protect, roleAuth(['buyer']), purchaseProduct);

module.exports = router;

