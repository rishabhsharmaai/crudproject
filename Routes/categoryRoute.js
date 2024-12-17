const express = require('express');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const {
    createCategory,
    getAllCategories,
    getSubcategories,
    deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.post(
    '/create',
    protect, roleAuth(['admin']), 
    createCategory
);

router.get('/', protect, getAllCategories);

router.get('/:categoryId/subcategories', protect, getSubcategories);

router.delete(
    '/:id',
    protect,
    roleAuth(['admin']),
    deleteCategory
);

module.exports = router;

