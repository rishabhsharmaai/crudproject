const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
    isSold: { type: Boolean, default: false },  // Ensure this is set to false
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Set default buyer to null
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Product', productSchema);


