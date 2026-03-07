const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// All vet routes require authentication and vet role
router.use(auth, rbac(['vet']));

// Health Reports
router.post('/reports', vetController.createHealthReport);
router.put('/reports/:reportId/submit', vetController.submitReport);
router.get('/reports/my', vetController.getMyReports);
router.get('/reports/cow/:cowId', vetController.getReportsByCow);

// DNA Verification
router.post('/dna-verification', vetController.uploadDNAVerification);

// Vaccination Verification
router.put('/vaccinations/:vaccinationId/verify', vetController.verifyVaccination);

module.exports = router;
