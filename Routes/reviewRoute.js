const express = require('express');
const { addReview, getReviews } = require('../controllers/reviewController');
const router = express.Router();

router.post('/add-review', addReview);
router.get('/:productId', getReviews);

module.exports = router;
