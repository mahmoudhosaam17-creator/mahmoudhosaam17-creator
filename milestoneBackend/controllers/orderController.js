const knex = require('knex')(require('../knexfile').development);
const { getUser } = require('../utils/session');

exports.placeOrder = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const { scheduledPickupTime } = req.body;
    const cartItems = await knex('FoodTruck.Carts').where({ userId: user.userId });
    if (!cartItems.length) return res.status(400).json({ error: 'Cart empty' });
    // verify same truck
    const firstMenu = await knex('FoodTruck.MenuItems').where({ itemId: cartItems[0].itemId }).first();
    const truckId = firstMenu.truckId;
    for (let ci of cartItems) {
      const menu = await knex('FoodTruck.MenuItems').where({ itemId: ci.itemId }).first();
      if (menu.truckId !== truckId) return res.status(400).json({ error: 'Cannot order from multiple trucks' });
    }
    // total price
    let totalPrice = 0;
    for (let ci of cartItems) totalPrice += parseFloat(ci.price) * ci.quantity;
    // insert order
    const [orderId] = await knex('FoodTruck.Orders').insert({
      userId: user.userId,
      truckId,
      orderStatus: 'pending',
      totalPrice,
      scheduledPickupTime,
      estimatedEarliestPickup: scheduledPickupTime ? scheduledPickupTime : null
    }).returning('orderId');
    // insert order items
    for (let ci of cartItems) {
      await knex('FoodTruck.OrderItems').insert({ orderId, itemId: ci.itemId, quantity: ci.quantity, price: ci.price });
    }
    // delete cart
    await knex('FoodTruck.Carts').where({ userId: user.userId }).del();
    return res.status(200).json({ message: 'order placed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const orders = await knex('FoodTruck.Orders as o')
      .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
      .select('o.orderId','o.userId','o.truckId','t.truckName','o.orderStatus','o.totalPrice','o.scheduledPickupTime','o.estimatedEarliestPickup','o.createdAt')
      .where({ 'o.userId': user.userId })
      .orderBy('o.orderId','desc');
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.orderDetailsCustomer = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { orderId } = req.params;
    const order = await knex('FoodTruck.Orders').where({ orderId }).first();
    if (!order || order.userId !== user.userId) return res.status(403).json({ error: 'Forbidden' });
    const items = await knex('FoodTruck.OrderItems as oi')
      .join('FoodTruck.MenuItems as m','oi.itemId','m.itemId')
      .select('m.name as itemName','oi.quantity','oi.price')
      .where({ 'oi.orderId': orderId });
    return res.status(200).json({ orderId: order.orderId, truckName: (await knex('FoodTruck.Trucks').where({ truckId: order.truckId }).first()).truckName, orderStatus: order.orderStatus, totalPrice: order.totalPrice, scheduledPickupTime: order.scheduledPickupTime, estimatedEarliestPickup: order.estimatedEarliestPickup, createdAt: order.createdAt, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.truckOrders = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const orders = await knex('FoodTruck.Orders as o')
      .join('FoodTruck.Users as u','o.userId','u.userId')
      .select('o.orderId','o.userId','u.name as customerName','o.orderStatus','o.totalPrice','o.scheduledPickupTime','o.estimatedEarliestPickup','o.createdAt')
      .where({ 'o.truckId': user.truckId })
      .orderBy('o.orderId','desc');
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { orderId } = req.params;
    const { orderStatus, estimatedEarliestPickup } = req.body;
    const order = await knex('FoodTruck.Orders').where({ orderId }).first();
    if (!order || order.truckId !== user.truckId) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending','preparing','ready','completed','cancelled'].includes(orderStatus)) return res.status(400).json({ error: 'Invalid status' });
    await knex('FoodTruck.Orders').where({ orderId }).update({ orderStatus, estimatedEarliestPickup: estimatedEarliestPickup || order.estimatedEarliestPickup });
    return res.status(200).json({ message: 'order status updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.orderDetailsTruckOwner = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { orderId } = req.params;
    const order = await knex('FoodTruck.Orders').where({ orderId }).first();
    if (!order || order.truckId !== user.truckId) return res.status(403).json({ error: 'Forbidden' });
    const items = await knex('FoodTruck.OrderItems as oi')
      .join('FoodTruck.MenuItems as m','oi.itemId','m.itemId')
      .select('m.name as itemName','oi.quantity','oi.price')
      .where({ 'oi.orderId': orderId });

    return res.status(200).json({ orderId: order.orderId, truckName: (await knex('FoodTruck.Trucks').where({ truckId: order.truckId }).first()).truckName, orderStatus: order.orderStatus, totalPrice: order.totalPrice, scheduledPickupTime: order.scheduledPickupTime, estimatedEarliestPickup: order.estimatedEarliestPickup, createdAt: order.createdAt, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
