const express = require('express');
const { adminVerifyUser } = require('../controllers/userController');
const {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser); 
router.put('/admin/verify/userId:',adminVerifyUser)
router.post('/login', loginUser); 

router.get('/profile', protect, getUserProfile); 

router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword); 

module.exports = router;