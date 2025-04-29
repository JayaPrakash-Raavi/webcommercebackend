const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { Customer_UserName, Customer_Password, Customer_First_Name, Customer_Last_Name, Customer_Phone, Customer_Email, Customer_City, Customer_State, Customer_Zip_Code } = req.body;
  const hash = await bcrypt.hash(Customer_Password, 10);

  await db.query(
    `INSERT INTO Customer_Table (Customer_First_Name, Customer_Last_Name, Customer_UserName, Customer_Password, Customer_Phone, Customer_Email, Customer_City, Customer_State, Customer_Zip_Code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [Customer_First_Name, Customer_Last_Name, Customer_UserName, hash, Customer_Phone, Customer_Email, Customer_City, Customer_State, Customer_Zip_Code]
  );

  res.status(201).send('Registered Successfully');
};

exports.login = async (req, res) => {
  const { Customer_UserName, Customer_Password } = req.body;
  const [users] = await db.query('SELECT * FROM Customer_Table WHERE Customer_UserName = ?', [Customer_UserName]);

  if (users.length === 0) return res.status(400).send('User not found');
  const user = users[0];

  const match = await bcrypt.compare(Customer_Password, user.Customer_Password);
  if (!match) return res.status(401).send('Invalid credentials');

  const token = jwt.sign({ id: user.Customer_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user });
};


exports.getCustomerById = async (req, res) => {
  const customerId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT Customer_id, Customer_First_Name, Customer_Last_Name, Customer_Email, Customer_Phone
       FROM Customer_Table WHERE Customer_id = ?`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { Customer_First_Name, Customer_Last_Name, Customer_Email, Customer_Phone } = req.body;

    console.log(req.body); // Log the request body for debugging
    if (!Customer_First_Name || !Customer_Last_Name || !Customer_Email || !Customer_Phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await db.query(`
      UPDATE Customer_Table
      SET Customer_First_Name = ?, Customer_Last_Name = ?, Customer_Email = ?, Customer_Phone = ?
      WHERE Customer_id = ?
    `, [Customer_First_Name, Customer_Last_Name, Customer_Email, Customer_Phone, customerId]);

    res.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};


exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [orders] = await db.query(`
      SELECT o.Order_id, o.order_date, cod.Delivery_code, p.Product_name, p.Product_Price, op.quantity
      FROM \`Order\` o
      JOIN ordered_products op ON o.Order_id = op.Order_Order_id
      JOIN Product_table p ON op.Product_table_Product_id = p.Product_id
      JOIN Customer_order_delivery cod ON o.Order_id = cod.Order_Order_id
      WHERE o.Customer_Table_Customer_id = ?
      ORDER BY o.order_date DESC
    `, [customerId]);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Failed to fetch customer orders" });
  }
};
