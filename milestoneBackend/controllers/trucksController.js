const knex = require('knex')(require('../knexfile').development);
const { getUser } = require('../utils/session');

exports.viewAvailableTrucks = async (req, res) => {
  try {
    const trucks = await knex('FoodTruck.Trucks').where({ truckStatus: 'available', orderStatus: 'available' }).orderBy('truckId');
    return res.status(200).json(trucks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.myTruck = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const truck = await knex('FoodTruck.Trucks').where({ truckId: user.truckId }).first();
    if (!truck) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(truck);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'truckOwner') return res.status(401).json({ error: 'Unauthorized' });
    const { orderStatus } = req.body;
    if (!['available','unavailable'].includes(orderStatus)) return res.status(400).json({ error: 'Invalid orderStatus' });
    await knex('FoodTruck.Trucks').where({ truckId: user.truckId }).update({ orderStatus });
    return res.status(200).json({ message: 'truck order status updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
