const db = require('../../connectors/db');
// check function getUser in milestone 3 description and session.js
const { getUser } = require('../../utils/session');
// getUser takes only one input of req
// await getUser(req);

function handlePrivateBackendApi(app) {

  // test endpoint
  app.get('/test', async (req, res) => {
    try {
      return res.status(200).send("succesful connection");
    } catch (err) {
      console.log("error message", err.message);
      return res.status(400).send(err.message);
    }
  });

  // ==========================================
  // Create Menu Item
  // POST /api/v1/menuItem/new
  // ==========================================
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      // get logged-in truck owner
      const user = await getUser(req);

      if (!user || !user.truckId) {
        return res.status(403).json({
          message: 'Unauthorized: truck owner only'
        });
      }

      const { name, price, description, category } = req.body;

      // basic validation
      if (!name || !price || !category) {
        return res.status(400).json({
          message: 'name, price, and category are required'
        });
      }

      await db('FoodTruck.MenuItems').insert({
        truckId: user.truckId,
        name,
        price,
        description,
        category
        // status and createdAt use DB default values
      });

      return res.status(200).json({
        message: 'menu item was created successfully'
      });

    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({
        message: err.message
      });
    }
  });


// ======================================
  // View My Truck’s Menu Items
  // GET /api/v1/menuItem/view
  // ======================================
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const user = await getUser(req);

      if (!user || !user.truckId) {
        return res.status(403).json({
          message: 'Unauthorized: truck owner only'
        });
      }

      const menuItems = await db('FoodTruck.MenuItems')
        .select(
          'itemId',
          'truckId',
          'name',
          'description',
          'price',
          'category',
          'status',
          'createdAt'
        )
        .where('truckId', user.truckId)
        .andWhere('status', 'available')
        .orderBy('itemId', 'asc');

      return res.status(200).json(menuItems);

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  });


  // =================================================
  // View a Specific Menu Item
  // GET /api/v1/menuItem/view/:itemId
  // =================================================
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      const { itemId } = req.params;
      console.log(itemId);
      if (!user || !user.truckId) {
        return res.status(403).json({
          message: 'Unauthorized'
        });
      }

      const menuItem = await db('FoodTruck.MenuItems')
        .select(
          'itemId',
          'truckId',
          'name',
          'description',
          'price',
          'category',
          'status',
          'createdAt'
        )
        .where({
          itemId: itemId,
          truckId: user.truckId
        })
        .first();

      if (!menuItem) {
        return res.status(404).json({
          message: 'Menu item not found'
        });
      }

      return res.status(200).json(menuItem);

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  });
















}

module.exports = { handlePrivateBackendApi };
