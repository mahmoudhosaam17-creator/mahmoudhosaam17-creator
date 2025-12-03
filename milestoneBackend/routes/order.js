const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.post('/new', ctrl.placeOrder);
router.get('/myOrders', ctrl.myOrders);
router.get('/details/:orderId', ctrl.orderDetailsCustomer);
router.get('/truckOwner/:orderId', ctrl.orderDetailsTruckOwner);
router.get('/truckOrders', ctrl.truckOrders);
router.put('/updateStatus/:orderId', ctrl.updateOrderStatus);

module.exports = router;
