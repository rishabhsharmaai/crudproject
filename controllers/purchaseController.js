const Product = require('../models/productModel');
const User = require("../models/userModel")
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken")

const purchaseProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.body
        let decodedUser
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            decodedUser = decode = jwt.decode(token, process.env.JWT_SECRET)
        }

        if (!decodedUser || decodedUser.role != 'buyer') {
            return res.status(403).json({ message: 'Access forbidden: only buyers can purchase products' });
        }
        const userDetails = await User.findById(decodedUser.id)
        const product = await Product.findById(productId).populate('user');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.isSold) {
            return res.status(400).json({ message: 'Product already sold' });
        }

        if (product.buyer) {
            return res.status(400).json({ message: 'Product already purchased' });
        }

        product.isSold = true;
        product.buyer = decodedUser._id;

        await product.save();

        res.status(200).json({
            message: 'Purchase successful',
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                image: product.image,
                buyer: {
                    id: userDetails._id,
                    name: userDetails.name,
                    email: userDetails.email,
                },
                message: 'The product will be delivered soon to your address.',
            },
        });

    } catch (error) {
        console.log(error)
    }
});

module.exports = { purchaseProduct };


