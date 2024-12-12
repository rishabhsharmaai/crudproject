const express = require('express');
const {
    getAllProducts,
    getProductByID,
    createProduct,
    updateById,
    deleteById,
} = require('../controllers/productController');
const {generatePDF} = require("../controllers/pdfController");
const upload = require('../middleware/upload'); 
const router = express.Router();

// Define routes for products
router.get('/getAllproducts', getAllProducts); // GET all products
router.get('/getProduct/:id', getProductByID); // POST to create a product
router.post('/createProduct', upload.single('image'), createProduct);  // Correct route for product creation
router.put('/update/:id', updateById); // PUT to update a product by ID
router.delete('/delete/:id', deleteById); // DELETE a product by 
router.get('/generate-pdf/:proId', generatePDF);


module.exports = router;