const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const Purchase = require('../models/purchaseModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('../utils/nodemailer');

const purchaseProduct = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId } = req.body;

        // if (!mongoose.isValidObjectId(productId)) {
        //     return res.status(400).json({ message: "Invalid product ID format." });
        // }

        let decodedUser;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                decodedUser = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        if (decodedUser.role !== 'buyer') {
            return res.status(403).json({ message: 'Access forbidden: Only buyers can purchase products.' });
        }

        const userDetails = await User.findById(decodedUser.id);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (product.isSold) {
            return res.status(400).json({ message: 'Product is already sold.' });
        }

        if (product.quantity <= 0) {
            return res.status(400).json({ message: 'Product is out of stock.' });
        }

        product.quantity -= 1;
        product.buyer=decodedUser.id
        if (product.quantity <= 0) {
            product.quantity = 0;
            product.isSold = true;
        }

        await product.save({ session });

        if (product.quantity < 5) {
            const seller = await User.findById(product.user);
            if (seller && seller.email) {
                const subject = 'Product Quantity Low: Restock Needed';
                const text = `Dear ${seller.name}, your product "${product.name}" is running low on stock. Please restock it soon.`;
                try {
                    await nodemailer.sendEmail(seller.email, subject, text);
                } catch (emailError) {
                    console.error("Error sending email:", emailError.message);
                }
            }
        }

        const purchaseData = {
            buyer: decodedUser.id,
            product: productId,
            status: 'Completed',
            productName: product.name, 
            productPrice: product.price,
            productAddress: product.address
        };
        const newPurchase = await Purchase.create([purchaseData], { session });

        await session.commitTransaction();
        session.endSession();

        const message = product.quantity === 0 
            ? 'This product is now sold out.' 
            : 'The product will be delivered soon to your address.';

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
                    address : userDetails.address,
                },
                message: message,
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
