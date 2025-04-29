const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Updated routes (DON'T repeat /cart here)
router.post('/', cartController.addToCart);
router.get('/:customerId', cartController.getCart);
router.delete('/remove', cartController.removeFromCart);
router.put('/', cartController.updateQuantity); // ✅ Add this


module.exports = router;
