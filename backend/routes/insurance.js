const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All insurance routes require farmer auth
router.use(auth, rbac(['farmer']));

router.get('/eligibility/:cowId', insuranceController.checkEligibility);
router.post('/purchase', insuranceController.purchasePolicy);
router.post('/claim', insuranceController.fileClaim);
router.get('/policies', insuranceController.getMyPolicies);
router.get('/claims', insuranceController.getMyClaims);

module.exports = router;
