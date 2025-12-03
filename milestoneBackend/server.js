const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// routers
const menuItemRouter = require('./routes/menuItem');
const trucksRouter = require('./routes/trucks');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');

app.use('/api/v1/menuItem', menuItemRouter);
app.use('/api/v1/trucks', trucksRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);

app.get('/', (req, res) => res.json({message: 'GIU FoodTruck Backend Milestone 3 - Template'}));

app.listen(port, () => console.log('Server running on port', port));
