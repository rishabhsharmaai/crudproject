const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({}).populate('category', 'name');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getProductByID = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category', 'name');

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const createProduct = asyncHandler(async (req, res) => {
    try {
        const { name, price, quantity, user, parentCategory, subCategory } = req.body;

        

        if (!name || !price || !quantity || !user || !parentCategory || !subCategory) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const parent = await Category.findById(parentCategory);
        if (!parent) {
            return res.status(404).json({ message: 'Parent category not found' });
        }

        const subcategory = await Category.findOne({
            _id: subCategory,
            parentCategory: parentCategory,
        });
        if (!subcategory) {
            return res.status(400).json({
                message: 'Invalid subcategory or it does not belong to the specified parent category',
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const pdfUrl = `${req.protocol}://${req.get('host')}/pdfs/${name}_product.pdf`;

        const product = await Product.create({
            name,
            price,
            quantity,
            image: imageUrl,
            user: req.user._id,
            pdfUrl,
            parentCategory,
            subCategory
        });

        res.status(201).json({
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        console.error('Error creating product:', error.message);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

const updateById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const deleteById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (product) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




module.exports = {
    getAllProducts,
    getProductByID,
    createProduct,
    updateById,
    deleteById
};
