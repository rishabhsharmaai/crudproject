const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    isSold: { type: Boolean, default: false }, 
    isWishlisted:{type: Boolean, default :false},
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
    parentCategory:{type:mongoose.Schema.Types.ObjectId },
    subCategory:{type:mongoose.Schema.Types.ObjectId},
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Product', productSchema);