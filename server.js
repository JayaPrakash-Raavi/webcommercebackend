const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const customerRoutes = require('./routes/customerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cart'); 
const orderRoutes = require('./routes/order');


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/customers', customerRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/seller', sellerRoutes);


app.use('/api/order', orderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
