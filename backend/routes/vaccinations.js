const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth);

// Add vaccination (vet only)
router.post('/', rbac(['vet']), vaccinationController.addVaccination);

// Get vaccination history (anyone)
router.get('/:cowId/history', vaccinationController.getVaccinationHistory);

// Get upcoming vaccinations (anyone)
router.get('/:cowId/upcoming', vaccinationController.getUpcomingVaccinations);

// Verify vaccination (vet only)
router.put('/:vaccinationId/verify', rbac(['vet']), vaccinationController.verifyVaccination);

module.exports = router;
