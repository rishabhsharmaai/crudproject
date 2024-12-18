const Category = require('../models/categoryModel');

const createCategory = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;

        const category = await Category.create({ name, parentCategory });
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).populate('parentCategory', 'name');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const getSubcategories = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const subcategories = await Category.find({ parentCategory: categoryId });
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const deleteCategoryAndSubcategories = async (categoryId) => {
            const subcategories = await Category.find({ parentCategory: categoryId });

            for (const subcategory of subcategories) {
                await deleteCategoryAndSubcategories(subcategory._id);
            }

            await Category.findByIdAndDelete(categoryId);
        };

        await deleteCategoryAndSubcategories(id);

        res.status(200).json({ message: 'Category and its subcategories deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getSubcategories,
    deleteCategory, 
};