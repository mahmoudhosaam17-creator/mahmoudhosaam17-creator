const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trucksController');

router.get('/view', ctrl.viewAvailableTrucks);
router.get('/myTruck', ctrl.myTruck);
router.put('/updateOrderStatus', ctrl.updateOrderStatus);

module.exports = router;
