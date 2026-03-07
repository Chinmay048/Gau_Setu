const express = require('express');
const router = express.Router();
const cowController = require('../controllers/cowController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All cow routes require authentication and farmer role
router.use(auth, rbac(['farmer']));

router.post('/register/newborn', cowController.registerCowNewborn);
router.post('/register/purchased', cowController.registerCowPurchased);
router.get('/my-cows', cowController.getCowsByFarmer);
router.get('/:cowId', cowController.getCowDetail);
router.put('/:cowId/dna-status', cowController.updateCowDNA);
router.post('/:cowId/add-biometric', cowController.addBiometricData);

module.exports = router;
