const express = require('express');
const { getBuyerProducts } = require('../controllers/buyerController');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, roleAuth(['buyer']), getBuyerProducts);

module.exports = router;
