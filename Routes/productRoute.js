const express = require('express');
const { protect, roleAuth } = require('../middleware/authMiddleware');
const {
    getAllProducts,
    getProductByID,
    createProduct,
    updateById,
    deleteById
} = require('../controllers/productController');
const { generatePDF } = require('../controllers/pdfController');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/getAllproducts', getAllProducts); 
router.get('/getProduct/:id', getProductByID); 
router.post('/createProduct',protect, roleAuth(['admin', 'seller']), upload.single('image'), createProduct); 
router.put('/update/:id',  protect, roleAuth(['admin', 'seller']),updateById); 
router.delete('/delete/:id',protect, roleAuth('admin'), deleteById);
router.get('/generate-pdf/:proId', protect, roleAuth(['seller', 'buyer','admin']), generatePDF);

module.exports = router;
