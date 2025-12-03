const express = require('express');
const router = express.Router();
const controller = require('../controllers/menuItemController');

router.post('/new', controller.createMenuItem);
router.get('/view', controller.viewMyMenu);
router.get('/view/:itemId', controller.viewMenuItem);
router.put('/edit/:itemId', controller.editMenuItem);
router.delete('/delete/:itemId', controller.deleteMenuItem);

// Public browse routes (customer)
router.get('/truck/:truckId', async (req,res)=>{
  const knex = require('knex')(require('../knexfile').development);
  try{
    const items = await knex('FoodTruck.MenuItems').where({ truckId: req.params.truckId, status: 'available' }).orderBy('itemId');
    return res.status(200).json(items);
  }catch(err){ console.error(err); return res.status(500).json({ error: 'Internal Server Error' }); }
});

router.get('/truck/:truckId/category/:category', async (req,res)=>{
  const knex = require('knex')(require('../knexfile').development);
  try{
    const items = await knex('FoodTruck.MenuItems').where({ truckId: req.params.truckId, category: req.params.category, status: 'available' }).orderBy('itemId');
    return res.status(200).json(items);
  }catch(err){ console.error(err); return res.status(500).json({ error: 'Internal Server Error' }); }
});

module.exports = router;
