// cartController.js
const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const [rows] = await db.query(
      `SELECT c.Product_table_Product_id AS productId, c.quantity, p.Product_name, p.Product_Price
       FROM Cart c
       JOIN Product_table p ON c.Product_table_Product_id = p.Product_id
       WHERE c.Customer_Table_Customer_id = ?`,
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { customerId, productId } = req.body;
    const [existing] = await db.query(
      `SELECT * FROM Cart WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?`,
      [customerId, productId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE Cart SET quantity = quantity + 1 WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?`,
        [customerId, productId]
      );
    } else {
      await db.query(
        `INSERT INTO Cart (Customer_Table_Customer_id, Product_table_Product_id, quantity) VALUES (?, ?, 1)`,
        [customerId, productId]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

exports.removeFromCart = async (req, res) => {
    try {
      const { customerId, productId } = req.body;
  
      await db.query(
        'DELETE FROM Cart WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?',
        [customerId, productId]
      );
  
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing item:', error);
      res.status(500).json({ error: 'Failed to remove item' });
    }
  };

  exports.updateQuantity = async (req, res) => {
    try {
      const { customerId, productId, delta } = req.body;
  
      // Fetch current quantity
      const [existing] = await db.query(
        'SELECT quantity FROM Cart WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?',
        [customerId, productId]
      );
  
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
  
      const currentQuantity = existing[0].quantity;
      const newQuantity = currentQuantity + delta;
  
      if (newQuantity <= 0) {
        // If quantity falls to 0 or below, remove item
        await db.query(
          'DELETE FROM Cart WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?',
          [customerId, productId]
        );
      } else {
        // Otherwise, update quantity
        await db.query(
          'UPDATE Cart SET quantity = ? WHERE Customer_Table_Customer_id = ? AND Product_table_Product_id = ?',
          [newQuantity, customerId, productId]
        );
      }
  
      res.status(200).json({ message: 'Quantity updated' });
    } catch (err) {
      console.error('Failed to update quantity:', err);
      res.status(500).json({ error: 'Failed to update quantity' });
    }
  };
  
  