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

  // ===============================
  // EDIT MENU ITEM
  // PUT /api/v1/menuItem/edit/:itemId
  // ===============================
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      const itemId = parseInt(req.params.itemId);
      const { name, price, category, description } = req.body;

      if (!user || !user.truckId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Validate itemId
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid itemId' });
      }

      // Build update object with only provided fields
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = price;
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
      }

      const updated = await db('FoodTruck.MenuItems')
        .where({
          itemId: itemId,
          truckId: user.truckId
        })
        .update(updateData);

      if (!updated) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      return res.status(200).json({
        message: 'menu item updated successfully'
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // ==================================================
  // DELETE MENU ITEM (Soft Delete)
  // DELETE /api/v1/menuItem/delete/:itemId
  // ==================================================
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
  try {
    // get logged in user
    const user = await getUser(req);
    const { itemId } = req.params;

    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // update status to unavailable (soft delete)
    const updatedRows = await db('FoodTruck.MenuItems')
      .where({
        itemId: itemId,
        truckId: user.truckId
      })
      .update({
        status: 'unavailable'
      });

    if (updatedRows === 0) {
      return res.status(404).json({
        message: 'Menu item not found or not authorized'
      });
    }

    return res.status(200).json({
      message: 'menu item deleted successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
  });

  // ==================================================
// View All Available Trucks
// GET /api/v1/trucks/view
// ==================================================
app.get('/api/v1/trucks/view', async (req, res) => {
  try {
    const trucks = await db('FoodTruck.Trucks')
      .select(
        'truckId',
        'truckName',
        'truckLogo',
        'ownerId',
        'truckStatus',
        'orderStatus',
        'createdAt'
      )
      .where({
        truckStatus: 'available',
        orderStatus: 'available'
      })
      .orderBy('truckId', 'asc');

    return res.status(200).json(trucks);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// ==================================================
// View Menu Items for a Specific Truck
// GET /api/v1/menuItem/truck/:truckId
// ==================================================
app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
  try {
    const { truckId } = req.params;

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
      .where({
        truckId: truckId,
        status: 'available'
      })
      .orderBy('itemId', 'asc');

    return res.status(200).json(menuItems);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// ==================================================
// ADD MENU ITEM TO CART
// POST /api/v1/cart/new
// ==================================================
app.post('/api/v1/cart/new', async (req, res) => {
  try {
    const user = await getUser(req);
    const { itemId, quantity, price } = req.body;

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // 1️⃣ Get menu item to check availability and truckId
    const menuItem = await db('FoodTruck.MenuItems')
      .select('itemId', 'truckId', 'status')
      .where({ itemId })
      .first();

    if (!menuItem || menuItem.status !== 'available') {
      return res.status(400).json({
        message: 'Menu item is not available'
      });
    }

    // 2️⃣ Check existing cart items (must be same truck)
    const existingCartItem = await db('FoodTruck.Carts')
      .join(
        'FoodTruck.MenuItems',
        'FoodTruck.Carts.itemId',
        'FoodTruck.MenuItems.itemId'
      )
      .select('FoodTruck.MenuItems.truckId')
      .where('FoodTruck.Carts.userId', user.userId)
      .first();

    if (
      existingCartItem &&
      existingCartItem.truckId !== menuItem.truckId
    ) {
      return res.status(400).json({
        message: 'Cannot order from multiple trucks'
      });
    }

    // 3️⃣ Insert into cart
    await db('FoodTruck.Carts').insert({
      userId: user.userId,
      itemId,
      quantity,
      price
    });

    return res.status(200).json({
      message: 'item added to cart successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW CART
// GET /api/v1/cart/view
// ==================================================
app.get('/api/v1/cart/view', async (req, res) => {
  try {
    const user = await getUser(req);

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const cartItems = await db('FoodTruck.Carts')
      .join(
        'FoodTruck.MenuItems',
        'FoodTruck.Carts.itemId',
        'FoodTruck.MenuItems.itemId'
      )
      .select(
        'FoodTruck.Carts.cartId',
        'FoodTruck.Carts.userId',
        'FoodTruck.Carts.itemId',
        'FoodTruck.MenuItems.name as itemName',
        'FoodTruck.Carts.price',
        'FoodTruck.Carts.quantity'
      )
      .where('FoodTruck.Carts.userId', user.userId)
      .orderBy('FoodTruck.Carts.cartId', 'asc');

    return res.status(200).json(cartItems);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// DELETE ITEM FROM CART
// DELETE /api/v1/cart/delete/:cartId
// ==================================================
app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    const { cartId } = req.params;

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // Verify cart item belongs to user
    const cartItem = await db('FoodTruck.Carts')
      .where({
        cartId: cartId,
        userId: user.userId
      })
      .first();

    if (!cartItem) {
      return res.status(404).json({
        message: 'Cart item not found'
      });
    }

    // Delete cart item
    await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .del();

    return res.status(200).json({
      message: 'item removed from cart successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// EDIT CART ITEM QUANTITY
// PUT /api/v1/cart/edit/:cartId
// ==================================================
app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: 'Invalid quantity'
      });
    }

    // Verify cart item belongs to current user
    const cartItem = await db('FoodTruck.Carts')
      .where({
        cartId: cartId,
        userId: user.userId
      })
      .first();

    if (!cartItem) {
      return res.status(404).json({
        message: 'Cart item not found'
      });
    }

    // Update cart item quantity
    await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .update({
        quantity: quantity
      });

    return res.status(200).json({
      message: 'cart updated successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// PLACE AN ORDER
// POST /api/v1/order/new
// ==================================================
app.post('/api/v1/order/new', async (req, res) => {
  try {
    const user = await getUser(req);
    const { scheduledPickupTime } = req.body;

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // 1️⃣ Get all cart items for user
    const cartItems = await db('FoodTruck.Carts')
      .join(
        'FoodTruck.MenuItems',
        'FoodTruck.Carts.itemId',
        'FoodTruck.MenuItems.itemId'
      )
      .select(
        'FoodTruck.Carts.itemId',
        'FoodTruck.Carts.quantity',
        'FoodTruck.Carts.price',
        'FoodTruck.MenuItems.truckId'
      )
      .where('FoodTruck.Carts.userId', user.userId);

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    // 2️⃣ Verify all cart items belong to same truck
    const truckId = cartItems[0].truckId;
    const multipleTrucks = cartItems.some(
      item => item.truckId !== truckId
    );

    if (multipleTrucks) {
      return res.status(400).json({
        error: 'Cannot order from multiple trucks'
      });
    }

    // 3️⃣ Calculate total price
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    // 4️⃣ Insert order
    const insertedOrder = await db('FoodTruck.Orders')
      .insert({
        userId: user.userId,
        truckId: truckId,
        orderStatus: 'pending',
        totalPrice: totalPrice,
        scheduledPickupTime: scheduledPickupTime,
        estimatedEarliestPickup: scheduledPickupTime
      })
      .returning('orderId');

    const orderId = insertedOrder[0].orderId;

    // 5️⃣ Insert order items
    const orderItemsData = cartItems.map(item => ({
      orderId: orderId,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price
    }));

    await db('FoodTruck.OrderItems').insert(orderItemsData);

    // 6️⃣ Clear cart
    await db('FoodTruck.Carts')
      .where('userId', user.userId)
      .del();

    return res.status(200).json({
      message: 'order placed successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW MY ORDERS
// GET /api/v1/order/myOrders
// ==================================================
app.get('/api/v1/order/myOrders', async (req, res) => {
  try {
    const user = await getUser(req);

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const orders = await db('FoodTruck.Orders')
      .join(
        'FoodTruck.Trucks',
        'FoodTruck.Orders.truckId',
        'FoodTruck.Trucks.truckId'
      )
      .select(
        'FoodTruck.Orders.orderId',
        'FoodTruck.Orders.userId',
        'FoodTruck.Orders.truckId',
        'FoodTruck.Trucks.truckName',
        'FoodTruck.Orders.orderStatus',
        'FoodTruck.Orders.totalPrice',
        'FoodTruck.Orders.scheduledPickupTime',
        'FoodTruck.Orders.estimatedEarliestPickup',
        'FoodTruck.Orders.createdAt'
      )
      .where('FoodTruck.Orders.userId', user.userId)
      .orderBy('FoodTruck.Orders.orderId', 'desc');

    return res.status(200).json(orders);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW ORDER DETAILS (CUSTOMER)
// GET /api/v1/order/details/:orderId
// ==================================================
app.get('/api/v1/order/details/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    const { orderId } = req.params;

    if (!user || !user.userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // 1️⃣ Get order and verify ownership
    const order = await db('FoodTruck.Orders')
      .join(
        'FoodTruck.Trucks',
        'FoodTruck.Orders.truckId',
        'FoodTruck.Trucks.truckId'
      )
      .select(
        'FoodTruck.Orders.orderId',
        'FoodTruck.Trucks.truckName',
        'FoodTruck.Orders.orderStatus',
        'FoodTruck.Orders.totalPrice',
        'FoodTruck.Orders.scheduledPickupTime',
        'FoodTruck.Orders.estimatedEarliestPickup',
        'FoodTruck.Orders.createdAt'
      )
      .where({
        'FoodTruck.Orders.orderId': orderId,
        'FoodTruck.Orders.userId': user.userId
      })
      .first();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // 2️⃣ Get order items
    const items = await db('FoodTruck.OrderItems')
      .join(
        'FoodTruck.MenuItems',
        'FoodTruck.OrderItems.itemId',
        'FoodTruck.MenuItems.itemId'
      )
      .select(
        'FoodTruck.MenuItems.name as itemName',
        'FoodTruck.OrderItems.quantity',
        'FoodTruck.OrderItems.price'
      )
      .where('FoodTruck.OrderItems.orderId', orderId);

    // 3️⃣ Build response object
    const orderDetails = {
      ...order,
      items: items
    };

    return res.status(200).json(orderDetails);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW ORDERS FOR MY TRUCK (TRUCK OWNER)
// GET /api/v1/order/truckOrders
// ==================================================
app.get('/api/v1/order/truckOrders', async (req, res) => {
  try {
    const user = await getUser(req);

    // Must be truck owner with a truck
    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const orders = await db('FoodTruck.Orders')
      .join(
        'FoodTruck.Users',
        'FoodTruck.Orders.userId',
        'FoodTruck.Users.userId'
      )
      .select(
        'FoodTruck.Orders.orderId',
        'FoodTruck.Orders.userId',
        'FoodTruck.Orders.truckId',
        'FoodTruck.Users.name as customerName',
        'FoodTruck.Orders.orderStatus',
        'FoodTruck.Orders.totalPrice',
        'FoodTruck.Orders.scheduledPickupTime',
        'FoodTruck.Orders.estimatedEarliestPickup',
        'FoodTruck.Orders.createdAt'
      )
      .where('FoodTruck.Orders.truckId', user.truckId)
      .orderBy('FoodTruck.Orders.orderId', 'desc');

    return res.status(200).json(orders);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// UPDATE ORDER STATUS (TRUCK OWNER)
// PUT /api/v1/order/updateStatus/:orderId
// ==================================================
app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    const { orderId } = req.params;
    const { orderStatus, estimatedEarliestPickup } = req.body;

    // Must be truck owner with a truck
    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // Validate orderStatus
    const allowedStatuses = [
      'pending',
      'preparing',
      'ready',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: 'Invalid order status'
      });
    }

    // Verify order belongs to owner's truck
    const order = await db('FoodTruck.Orders')
      .where({
        orderId: orderId,
        truckId: user.truckId
      })
      .first();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Build update object
    const updateData = {
      orderStatus: orderStatus
    };

    if (estimatedEarliestPickup) {
      updateData.estimatedEarliestPickup = estimatedEarliestPickup;
    }

    // Update order
    await db('FoodTruck.Orders')
      .where('orderId', orderId)
      .update(updateData);

    return res.status(200).json({
      message: 'order status updated successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW ORDER DETAILS (TRUCK OWNER)
// GET /api/v1/order/truckOwner/:orderId
// ==================================================
app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    const { orderId } = req.params;

    // Must be truck owner with a truck
    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // 1️⃣ Get order and verify it belongs to this truck owner
    const order = await db('FoodTruck.Orders')
      .join(
        'FoodTruck.Trucks',
        'FoodTruck.Orders.truckId',
        'FoodTruck.Trucks.truckId'
      )
      .select(
        'FoodTruck.Orders.orderId',
        'FoodTruck.Trucks.truckName',
        'FoodTruck.Orders.orderStatus',
        'FoodTruck.Orders.totalPrice',
        'FoodTruck.Orders.scheduledPickupTime',
        'FoodTruck.Orders.estimatedEarliestPickup',
        'FoodTruck.Orders.createdAt'
      )
      .where({
        'FoodTruck.Orders.orderId': orderId,
        'FoodTruck.Orders.truckId': user.truckId
      })
      .first();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // 2️⃣ Get order items
    const items = await db('FoodTruck.OrderItems')
      .join(
        'FoodTruck.MenuItems',
        'FoodTruck.OrderItems.itemId',
        'FoodTruck.MenuItems.itemId'
      )
      .select(
        'FoodTruck.MenuItems.name as itemName',
        'FoodTruck.OrderItems.quantity',
        'FoodTruck.OrderItems.price'
      )
      .where('FoodTruck.OrderItems.orderId', orderId);

    // 3️⃣ Build response object
    const orderDetails = {
      ...order,
      items: items
    };

    return res.status(200).json(orderDetails);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// UPDATE TRUCK ORDER AVAILABILITY (TRUCK OWNER)
// PUT /api/v1/trucks/updateOrderStatus
// ==================================================
app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
  try {
    const user = await getUser(req);
    const { orderStatus } = req.body;

    // Must be truck owner with a truck
    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    // Validate orderStatus
    const allowedStatuses = ['available', 'unavailable'];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: 'Invalid order status'
      });
    }

    // Update truck order status
    await db('FoodTruck.Trucks')
      .where('truckId', user.truckId)
      .update({
        orderStatus: orderStatus
      });

    return res.status(200).json({
      message: 'truck order status updated successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// SEARCH MENU ITEMS BY CATEGORY (CUSTOMER)
// GET /api/v1/menuItem/truck/:truckId/category/:category
// ==================================================
app.get('/api/v1/menuItem/truck/:truckId/category/:category', async (req, res) => {
  try {
    const { truckId, category } = req.params;

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
      .where({
        truckId: truckId,
        category: category,
        status: 'available'
      })
      .orderBy('itemId', 'asc');

    return res.status(200).json(menuItems);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});
// ==================================================
// VIEW MY TRUCK INFORMATION (TRUCK OWNER)
// GET /api/v1/trucks/myTruck
// ==================================================
app.get('/api/v1/trucks/myTruck', async (req, res) => {
  try {
    const user = await getUser(req);

    // Must be truck owner with a truck
    if (!user || !user.truckId) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const truck = await db('FoodTruck.Trucks')
      .select(
        'truckId',
        'truckName',
        'truckLogo',
        'ownerId',
        'truckStatus',
        'orderStatus',
        'createdAt'
      )
      .where('truckId', user.truckId)
      .first();

    if (!truck) {
      return res.status(404).json({
        message: 'Truck not found'
      });
    }

    return res.status(200).json(truck);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});




   










 
   
  























}



module.exports = { handlePrivateBackendApi };

