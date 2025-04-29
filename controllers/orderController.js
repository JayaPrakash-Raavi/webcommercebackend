const db = require('../config/db');

exports.placeOrder = async (req, res) => {
  const { customerId } = req.body;
  
  if (!customerId) return res.status(400).json({ error: 'Customer ID is required' });

  const connection = await db.getConnection(); // If using mysql2/promise
  await connection.beginTransaction();

  try {
    // 1. Get cart items
    const [cartItems] = await connection.query(`
      SELECT Product_table_Product_id, quantity
      FROM Cart
      WHERE Customer_Table_Customer_id = ?
    `, [customerId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Choose a seller randomly (simple logic for now)
    const [sellers] = await connection.query(`SELECT Seller_id FROM Seller ORDER BY RAND() LIMIT 1`);
    const sellerId = sellers[0].Seller_id;

    // 3. Choose a payment method randomly (or later from user selection)
    const [payments] = await connection.query(`SELECT Payment_id FROM Payment_details ORDER BY RAND() LIMIT 1`);
    const paymentId = payments[0].Payment_id;

    // 4. Insert new order
    const [orderResult] = await connection.query(`
      INSERT INTO \`Order\` (Customer_Table_Customer_id, order_date, seller_Seller_id, Payment_details_Payment_id)
      VALUES (?, NOW(), ?, ?)
    `, [customerId, sellerId, paymentId]);

    const newOrderId = orderResult.insertId;

    // 5. Insert ordered products
    const orderedProductValues = cartItems.map(item => [newOrderId, item.Product_table_Product_id, item.quantity]);
    await connection.query(`
      INSERT INTO ordered_products (Order_Order_id, Product_table_Product_id, quantity)
      VALUES ?
    `, [orderedProductValues]);

    // 6. Insert delivery status
    await connection.query(`
      INSERT INTO Customer_order_delivery (Order_Order_id, Delivery_code)
      VALUES (?, 'shipped')
    `, [newOrderId]);

    // 7. Clear the cart
    await connection.query(`
      DELETE FROM Cart WHERE Customer_Table_Customer_id = ?
    `, [customerId]);

    await connection.commit();

    res.status(201).json({ message: 'Order placed successfully' });

  } catch (err) {
    console.error('Order placement error:', err);
    await connection.rollback();
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    connection.release();
  }
};
