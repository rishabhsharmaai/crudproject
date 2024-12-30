const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const Purchase = require('../models/purchaseModel');

const addReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Comment is required.' });
    }

    let decodedUser;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    } else {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    if (!decodedUser || decodedUser.role !== 'buyer') {
        return res.status(403).json({ message: 'Access forbidden: only buyers can review products.' });
    }

    try {
        const purchase = await Purchase.findOne({
            buyer: decodedUser.id,
            product: productId,
            status: 'Completed',
        });

        if (!purchase) {
            return res.status(403).json({ message: 'You can only review products you have purchased.' });
        }

        const existingReview = await Review.findOne({
            product: productId,
            buyer: decodedUser.id,
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const review = await Review.create({
            product: productId,
            buyer: decodedUser.id,
            rating,
            comment,
        });

        res.status(201).json({
            message: 'Review added successfully',
            review,
        });
    } catch (error) {
        console.error('Error in addReview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const getReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format.' });
    }

    try {
        const reviews = await Review.find({ product: productId })
            .populate('buyer', 'name email') 
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error in getReviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});




module.exports = { addReview, getReviews };
