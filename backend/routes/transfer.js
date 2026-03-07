const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All transfer routes require farmer auth
router.use(auth, rbac(['farmer']));

router.post('/initiate', transferController.initiateTransfer);
router.put('/:transferId/accept', transferController.acceptTransfer);
router.put('/:transferId/reject', transferController.rejectTransfer);
router.get('/my', transferController.getMyTransfers);
router.get('/pending', transferController.getPendingTransfers);

module.exports = router;
