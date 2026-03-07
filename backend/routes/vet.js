const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.use(auth, rbac(['vet']));

// Search cow by ID or RFID
router.get('/cow/search/:cowId', vetController.searchCow);

// Create health report
router.post('/report/create', vetController.createHealthReport);

// Submit health report
router.put('/report/:reportId/submit', vetController.submitHealthReport);

// Get health reports for a cow
router.get('/report/cow/:cowId', vetController.getHealthReports);

// Get all vet reports
router.get('/reports/my-submissions', vetController.getVetReports);

module.exports = router;
