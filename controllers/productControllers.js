const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler')
//getallproducts
const getAllproducts =  asyncHandler(async(req, res) => {
    try{
      const products = await Product.find({});
     res.status(200)
     throw new Error(products)
    }catch(error){
        res.status(500)
        throw new Error(error.message);
    }
 })

 //get product by id
 const getProductByID =asyncHandler(async(req,res)=>{
    try{
        const{id} =req.params;
        const product = await Product.findById(id);
        res.status(200)
        throw new Error(product)
    }catch(error){    
        res.status(500)
        throw new Error(error.message);
    }
 })

//createProduct
const createProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.create(req.body); // Use the correct model name
        res.status(200)
        throw new Error(product)
    } catch (error) {
        console.error(error.message); // Log error
        res.status(500)
        throw new Error(error.message);
    }
})

//updatebyId
const updatebyId = asyncHandler (async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { 
            new: true, // Return the updated document
            runValidators: true // Ensure validation rules are applied
        });

        if (product) {
            res.status(200)
            throw new Error(product)
        } else {
            res.status(404)
            throw new Error("Product not found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message);
    }
})
//deletebyID
const deletebyId =  asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (product) {
            res.status(200)
            throw new Error("Product deleted successfully")
        } else {
            res.status(404)
            throw new Error("Product not found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message);
    }
})

 module.exports = {
    getAllproducts,
    getProductByID,
    createProduct,
    updatebyId,
    deletebyId,
 }