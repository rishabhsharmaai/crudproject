const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"]
    },
    quantity: {
        type: Number,
        required: [true

        ], // Check this line
        min: [0, 'Quantity cannot be negative']
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pdfUrl: {
        type: String,
        default: null,
    },

}, {
    timestamps: true
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
