const express = require('express');
const { getSellerProducts } = require('../controllers/sellerController');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, roleAuth(['seller']), getSellerProducts);

module.exports = router;
