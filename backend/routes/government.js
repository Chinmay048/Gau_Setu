const express = require('express');
const router = express.Router();
const govController = require('../controllers/governmentController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All government routes require authentication and government role
router.use(auth, rbac(['government']));

// Dashboard
router.get('/dashboard', govController.getDashboard);

// Analytics
router.get('/stats/regional', govController.getRegionalStats);
router.get('/stats/breeds', govController.getBreedStatistics);
router.get('/stats/vaccination-coverage', govController.getVaccinationCoverage);

// Disease Alerts
router.get('/disease-alerts', govController.getDiseaseAlerts);
router.post('/disease-alerts', govController.createDiseaseAlert);

module.exports = router;
