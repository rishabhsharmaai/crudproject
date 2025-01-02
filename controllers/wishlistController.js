const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/wishlistModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const wishlistProduct = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId } = req.params;

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
            return res.status(403).json({ message: 'Access forbidden: Only buyers can wishlist products.' });
        }

        const userDetails = await User.findById(decodedUser.id);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const existingWishlist = await Wishlist.findOne({
            buyer: decodedUser.id,
            product: productId,
        }).session(session);

        if (existingWishlist) {
            return res.status(400).json({ message: 'Product is already wishlisted.' });
        }

        const wishlistData = {
            buyer: decodedUser.id,
            product: productId,
            status: 'wishlisted',
            productName: product.name,
            productPrice: product.price,
            productAddress: product.address,
        };
        const newWishlist = await Wishlist.create([wishlistData], { session });

        product.isWishlisted = true;
        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Product Wishlisted',
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in wishlisting Product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


const deleteWishlistProduct = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId } = req.params;

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
            return res.status(403).json({ message: 'Access forbidden: Only buyers can delete wishlist products.' });
        }
        const userDetails = await User.findById(decodedUser.id);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const wishlistItem = await Wishlist.findOne({
            buyer: decodedUser.id,
            product: productId,
        }).session(session);

        if (!wishlistItem) {
            return res.status(404).json({ message: 'Product not found in wishlist.' });
        }

        const deletedWishlistItem = await Wishlist.deleteOne({ _id: wishlistItem._id }, { session });

        const product = await Product.findById(productId).session(session);
        if (product) {
            product.isWishlisted = false;
            await product.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Product removed from wishlist.' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in deleting wishlist product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



module.exports = { wishlistProduct, deleteWishlistProduct }