const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken");

const getSellerProducts = asyncHandler(async (req, res) => {
    try {
        let decodedUser;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        } else {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }


        const products = await Product.find({ user: decodedUser.id });

        if (!products || products.length === 0) {
            console.log("No products found for user ID:", decodedUser.id);
        }

        res.status(200).json({
            message: 'Seller products fetched successfully',
            products,
        });
    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = { getSellerProducts };
