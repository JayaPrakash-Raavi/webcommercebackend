const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

router.post('/register', sellerController.register);
router.post('/login', sellerController.login);
router.post('/add-product', sellerController.addProduct);
router.get('/my-products', sellerController.getMyProducts);

router.get('/:id', sellerController.getSellerById);
router.put('/:id', sellerController.updateSeller);

module.exports = router;
