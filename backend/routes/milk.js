const express = require('express');
const router = express.Router();
const milkController = require('../controllers/milkController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Public QR verification (no auth needed)
router.get('/batch/:batchCode', milkController.verifyBatch);

// Farmer-only routes
router.use(auth, rbac(['farmer']));

router.post('/log', milkController.logProduction);
router.get('/records', milkController.getRecords);
router.get('/stats', milkController.getStats);

module.exports = router;
