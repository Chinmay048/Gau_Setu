const express = require('express');
const router = express.Router();
const breedingController = require('../controllers/breedingController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Farmer can view breeding recommendations
router.use(auth, rbac(['farmer', 'vet']));

router.get('/:cowId/recommendations', breedingController.getRecommendations);
router.get('/:cowId/genetics', breedingController.getCowGenetics);

module.exports = router;
