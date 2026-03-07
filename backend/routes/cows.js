const express = require('express');
const router = express.Router();
const cowController = require('../controllers/cowController');
const matingController = require('../controllers/matingController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All cow routes require authentication and farmer role
router.use(auth, rbac(['farmer']));

// Cow Registration
router.post('/register/newborn', cowController.registerCowNewborn);
router.post('/register/purchased', cowController.registerCowPurchased);

// Cow Management
router.get('/my-cows', cowController.getCowsByFarmer);
router.get('/:cowId', cowController.getCowDetail);

// Biometric
router.post('/:cowId/add-biometric', cowController.addBiometricData);

// DNA
router.put('/:cowId/dna-status', cowController.updateCowDNA);
router.post('/:cowId/upload-dna', cowController.uploadDNAReport);

// Mating Compatibility
router.get('/:cowId/mating-recommendations', matingController.getMatingRecommendations);
router.get('/mating/available-bulls', matingController.getAllAvailableBulls);
router.get('/:cowId/compatibility/:bullId', matingController.calculateCompatibility);

// Vaccinations
router.post('/:cowId/vaccinations', cowController.addVaccination);
router.get('/:cowId/vaccinations', cowController.getVaccinationHistory);
router.get('/vaccinations/upcoming/all', cowController.getUpcomingVaccinations);

module.exports = router;
