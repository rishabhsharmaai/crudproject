const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null 
    },
}, {
    timestamps: true 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
