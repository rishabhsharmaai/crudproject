const express = require('express');
const { 
    createCategory, 
    getAllCategories, 
    getSubcategories, 
    deleteCategory 
} = require('../controllers/categoryController');

const router = express.Router();

router.post('/create', createCategory);

router.get('/', getAllCategories);

router.get('/:categoryId/subcategories', getSubcategories);

router.delete('/:id', deleteCategory);

module.exports = router;

