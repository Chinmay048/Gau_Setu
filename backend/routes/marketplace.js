const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Public: browse products (no auth required — for customer page)
router.get('/public/products', marketplaceController.getProducts);

// Authenticated: browse products
router.get('/products', auth, marketplaceController.getProducts);

// Farmer-only routes
router.use(auth, rbac(['farmer']));

router.post('/products', marketplaceController.listProduct);
router.get('/products/my', marketplaceController.getMyProducts);
router.put('/products/:productId', marketplaceController.updateProduct);

// Orders
router.post('/orders', marketplaceController.placeOrder);
router.get('/orders/my', marketplaceController.getMyOrders);
router.put('/orders/:orderId/status', marketplaceController.updateOrderStatus);

// Reputation
router.get('/reputation', marketplaceController.getReputation);
router.get('/reputation/:farmerId', marketplaceController.getReputation);

module.exports = router;
