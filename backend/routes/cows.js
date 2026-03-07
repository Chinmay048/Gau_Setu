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
router.get('/search', cowController.searchCow);

// Static routes BEFORE :cowId wildcard to prevent route shadowing
router.get('/mating/available-bulls', matingController.getAllAvailableBulls);
router.get('/vaccinations/upcoming/all', cowController.getUpcomingVaccinations);
router.get('/vaccinations/summary', cowController.getVaccinationSummary);

// Noseprint
router.post('/noseprint/identify', cowController.identifyByNose);
router.post('/noseprint/verify', cowController.verifyNose);

// Dynamic :cowId routes
router.get('/:cowId', cowController.getCowDetail);

// Biometric
router.post('/:cowId/add-biometric', cowController.addBiometricData);

// DNA
router.put('/:cowId/dna-status', cowController.updateCowDNA);
router.post('/:cowId/upload-dna', cowController.uploadDNAReport);

// RFID Lifecycle
router.put('/:cowId/rfid/lost', cowController.reportRFIDLost);
router.put('/:cowId/rfid/replace', cowController.replaceRFID);

// Mating Compatibility
router.get('/:cowId/mating-recommendations', matingController.getMatingRecommendations);
router.get('/:cowId/compatibility/:bullId', matingController.calculateCompatibility);

// Vaccinations
router.post('/:cowId/vaccinations', cowController.addVaccination);
router.get('/:cowId/vaccinations', cowController.getVaccinationHistory);
router.get('/:cowId/vaccination-calendar', cowController.getVaccinationCalendar);

module.exports = router;
