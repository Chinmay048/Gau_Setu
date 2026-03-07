const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth, rbac(['farmer']));

// Initiate transfer
router.post('/initiate', transferController.initiateTransfer);

// Complete transfer
router.put('/:transferId/complete', transferController.completeTransfer);

// Get pending transfers
router.get('/pending', transferController.getPendingTransfers);

module.exports = router;
