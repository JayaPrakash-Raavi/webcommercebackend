const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const [products] = await db.query('SELECT * FROM Product_table');
  res.json(products);
});

module.exports = router;
