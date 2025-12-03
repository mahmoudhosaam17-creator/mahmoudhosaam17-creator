const knex = require('knex')(require('../knexfile').development);
const { getUser } = require('../utils/session');

exports.addToCart = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const { itemId, quantity, price } = req.body;
    if (!itemId || !quantity || price == null) return res.status(400).json({ error: 'Missing fields' });

    // verify that all existing cart items belong to same truck
    const item = await knex('FoodTruck.MenuItems').where({ itemId, status: 'available' }).first();
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const cartItems = await knex('FoodTruck.Carts').where({ userId: user.userId });
    if (cartItems.length > 0) {
      const firstItem = await knex('FoodTruck.MenuItems').where({ itemId: cartItems[0].itemId }).first();
      if (firstItem.truckId !== item.truckId) return res.status(400).json({ message: 'Cannot order from multiple trucks' });
    }
    await knex('FoodTruck.Carts').insert({ userId: user.userId, itemId, quantity, price });
    return res.status(200).json({ message: 'item added to cart successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.viewCart = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const items = await knex('FoodTruck.Carts as c')
      .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
      .select('c.cartId','c.userId','c.itemId','m.name as itemName','c.price','c.quantity')
      .where({ 'c.userId': user.userId })
      .orderBy('c.cartId');
    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const { cartId } = req.params;
    const cart = await knex('FoodTruck.Carts').where({ cartId }).first();
    if (!cart || cart.userId !== user.userId) return res.status(403).json({ error: 'Forbidden' });
    await knex('FoodTruck.Carts').where({ cartId }).del();
    return res.status(200).json({ message: 'item removed from cart successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.editCartItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const { cartId } = req.params;
    const { quantity } = req.body;
    const cart = await knex('FoodTruck.Carts').where({ cartId }).first();
    if (!cart || cart.userId !== user.userId) return res.status(403).json({ error: 'Forbidden' });
    await knex('FoodTruck.Carts').where({ cartId }).update({ quantity });
    return res.status(200).json({ message: 'cart updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
