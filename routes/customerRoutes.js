const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const {
    getCustomerById,
    updateCustomer,
    getCustomerOrders, // ✅ Make sure this is added
  } = require('../controllers/customerController');

router.post('/register', customerController.register);
router.post('/login', customerController.login);

// ✅ ADD this route to fetch customer by ID
router.get('/:id', customerController.getCustomerById);

// ✅ Optional: Add update route if not added already
router.put('/:id', customerController.updateCustomer);

router.get('/orders/:customerId', getCustomerOrders);


module.exports = router;
