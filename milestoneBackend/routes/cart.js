const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');

router.post('/new', ctrl.addToCart);
router.get('/view', ctrl.viewCart);
router.put('/edit/:cartId', ctrl.editCartItem);
router.delete('/delete/:cartId', ctrl.deleteCartItem);

module.exports = router;
