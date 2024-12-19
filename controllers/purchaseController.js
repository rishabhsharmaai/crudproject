const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const Purchase = require('../models/puchaseModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const purchaseProduct = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId } = req.body;
        console.log("Received Product ID:", productId);

        if (!mongoose.isValidObjectId(productId)) {
            console.error("Invalid product ID format received:", productId);
            return res.status(400).json({ message: "Invalid product ID format." });
        }
        let decodedUser;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                decodedUser = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded User:", decodedUser);
            } catch (err) {
                console.error("Token verification failed:", err.message);
                return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        if (!decodedUser || decodedUser.role !== 'buyer') {
            console.error("Access denied: Only buyers can purchase products.");
            return res.status(403).json({ message: 'Access forbidden: only buyers can purchase products.' });
        }

        const userDetails = await User.findById(decodedUser.id);
        if (!userDetails) {
            console.error("User not found for ID:", decodedUser.id);
            return res.status(404).json({ message: 'User not found.' });
        }

        const product = await Product.findById(productId).session(session);
        console.log("Product Query Result:", product);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (product.isSold) {
            return res.status(400).json({ message: 'Product already sold.' });
        }

        const updatedProduct = await Product.updateOne(
            { _id: productId, isSold: false },
            { $set: { isSold: true, buyer: decodedUser.id } }
        ).session(session);

        if (updatedProduct.nModified === 0) {
            return res.status(400).json({ message: "Failed to update product. It may already be marked as sold." });
        }

        const purchaseData = {
            buyer: decodedUser.id,
            product: productId,
            status: "Completed"
        };
        const newPurchase = await Purchase.create([purchaseData], { session });
        console.log("Purchase Record Created:", newPurchase);

        await session.commitTransaction();
        session.endSession();

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
        await session.abortTransaction();
        session.endSession();

        console.error("Error in purchaseProduct:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = { purchaseProduct };
