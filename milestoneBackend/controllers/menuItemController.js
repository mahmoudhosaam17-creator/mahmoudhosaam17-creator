const knex = require('knex')(require('../knexfile').development);
const { getUser } = require('../utils/session');

exports.createMenuItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const truckId = user.truckId;
    const { name, price, description, category } = req.body;
    if (!name || price == null || !category) return res.status(400).json({ error: 'Missing fields' });
    await knex('FoodTruck.MenuItems').insert({ truckId, name, price, description, category });
    return res.status(200).json({ message: 'menu item was created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.viewMyMenu = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const items = await knex('FoodTruck.MenuItems').where({ truckId: user.truckId, status: 'available' }).orderBy('itemId');
    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.viewMenuItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { itemId } = req.params;
    const item = await knex('FoodTruck.MenuItems').where({ itemId, truckId: user.truckId }).first();
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.editMenuItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { itemId } = req.params;
    const payload = (({ name, price, category, description }) => ({ name, price, category, description }))(req.body);
    await knex('FoodTruck.MenuItems').where({ itemId, truckId: user.truckId }).update(payload);
    return res.status(200).json({ message: 'menu item updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { itemId } = req.params;
    await knex('FoodTruck.MenuItems').where({ itemId, truckId: user.truckId }).update({ status: 'unavailable' });
    return res.status(200).json({ message: 'menu item deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
