const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const {
    First_Name, Last_Name, Seller_UserName, Seller_Password, Mobile,
    Email, City, State, Zip_Code
  } = req.body;

  const hash = await bcrypt.hash(Seller_Password, 10);

  await db.query(
    `INSERT INTO Seller (First_Name, Last_Name, Seller_UserName, Seller_Password, Mobile, Email, City, State, Zip_Code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [First_Name, Last_Name, Seller_UserName, hash, Mobile, Email, City, State, Zip_Code]
  );

  res.status(201).send('Seller registered successfully');
};

exports.login = async (req, res) => {
  const { Seller_UserName, Seller_Password } = req.body;
  const [rows] = await db.query('SELECT * FROM Seller WHERE Seller_UserName = ?', [Seller_UserName]);

  if (rows.length === 0) return res.status(400).send('Seller not found');

  const seller = rows[0];
  const match = await bcrypt.compare(Seller_Password, seller.Seller_Password);
  if (!match) return res.status(401).send('Invalid credentials');

  const token = jwt.sign({ id: seller.Seller_id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, seller });
};


exports.addProduct = async (req, res) => {
  const { Product_name, Product_Description, Product_Price, Product_Category, Seller_id } = req.body;

  try {
    // Insert into Product_table
    const [result] = await db.execute(
      'INSERT INTO Product_table (Product_name, Product_Description, Product_Price, Product_Category) VALUES (?, ?, ?, ?)',
      [Product_name, Product_Description, Product_Price, Product_Category]
    );

    const insertedProductId = result.insertId;

    // Insert into SellerInventory
    await db.execute(
      'INSERT INTO SellerInventory (Productid, Product_quantity, Seller_Seller_id) VALUES (?, ?, ?)',
      [insertedProductId, 100, Seller_id]
    );

    res.status(201).json({ message: 'Product added successfully', Product_id: insertedProductId });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// In sellerController.js

exports.getMyProducts = async (req, res) => {
  const { sellerId } = req.query;
  if (!sellerId) {
    return res.status(400).json({ message: "Seller ID required" });
  }

  try {
    const [products] = await db.execute(`
      SELECT 
        p.Product_id, p.Product_name, p.Product_Description, 
        p.Product_Price, p.Product_Category, si.Product_quantity
      FROM 
        SellerInventory si
      JOIN 
        Product_table p ON si.Productid = p.Product_id
      WHERE 
        si.Seller_Seller_id = ?
    `, [sellerId]);

    res.json(products);
  } catch (err) {
    console.error('Get My Products Error:', err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch seller details by ID
exports.getSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM Seller WHERE Seller_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get Seller Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update seller details by ID
exports.updateSeller = async (req, res) => {
  const { id } = req.params;
  const { First_Name, Last_Name, Email, Mobile } = req.body;

  try {
    await db.query(
      'UPDATE Seller SET First_Name = ?, Last_Name = ?, Email = ?, Mobile = ? WHERE Seller_id = ?',
      [First_Name, Last_Name, Email, Mobile, id]
    );
    res.json({ message: 'Seller updated successfully' });
  } catch (err) {
    console.error('Update Seller Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
