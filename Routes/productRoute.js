const express = require('express')
const Product = require('../models/productModel');
const {getAllproducts, deletebyID} = require('../controllers/productControllers')
const {getProductByID} = require('../controllers/productControllers')
const {createProduct} = require('../controllers/productControllers')
const {updatebyId} = require('../controllers/productControllers')
const {deletebyId} = require('../controllers/productControllers')

const router = express.Router()
// Routes  
router.get('/getAllproducts',getAllproducts);
 
 //get by id
 router.get('/getProduct/:id',getProductByID);
 
 router.post('/createProduct',createProduct);
 
 // Update product by ID
 router.put('/update/:id',updatebyId);
 
 // Delete product by ID
 router.delete('/delete/:id',deletebyId);

 module.exports=router;