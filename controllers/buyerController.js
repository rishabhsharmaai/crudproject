const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken");

const getBuyerProducts = asyncHandler(async (req, res) => {
    try {
        let decodedUser;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            decodedUser = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Buyer:", decodedUser);
        } else {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        const products = await Product.find({ buyer: decodedUser.id });

        if (products.length > 0) {
            res.status(200).json({
                message: 'Buyer products fetched successfully',
                products,
            });
        } else {
            res.status(200).json({
                message: 'No products found for this buyer',
                products: [],
            });
        }
    } catch (error) {
        console.error("Error fetching buyer products:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = { getBuyerProducts };
