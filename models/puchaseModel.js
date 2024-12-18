const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
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
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending', 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);