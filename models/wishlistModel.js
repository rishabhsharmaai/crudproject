const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true, 
        },
        WishlistDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['wishlisted', 'not-wishlisted'],
            default: 'wishlisted', 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);