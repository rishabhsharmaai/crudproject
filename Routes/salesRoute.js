const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController'); 

router.post('/sales-by-month', salesController.getSalesData);

module.exports = router;
