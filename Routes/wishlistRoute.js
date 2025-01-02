const express = require('express');
const { wishlistProduct, deleteWishlistProduct } = require('../controllers/wishlistController');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const wishlistModel = require('../models/wishlistModel');
const router = express.Router();


router.post('/delete-wishlist/:productId',protect,roleAuth(['buyer']),deleteWishlistProduct);
router.post('/wishlist/:productId', protect, roleAuth(['buyer']), wishlistProduct);

module.exports = router;