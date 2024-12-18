const express = require('express');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const router = express.Router();

router.get('/users', protect, roleAuth(['admin']), getAllUsers);

router.delete('/users/:userId', protect, roleAuth(['admin']), deleteUser);

module.exports = router;
