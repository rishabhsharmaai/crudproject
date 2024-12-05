const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// User routes
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Login a user
router.get('/profile', protect, getUserProfile); // Get the logged-in user's profile

// Password reset routes
router.post('/forgot-password', forgotPassword); // Initiate password reset
router.post('/reset-password', resetPassword); // Reset user password

module.exports = router;
