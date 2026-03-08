const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Public: insurance plans info (no auth)
router.get('/public/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 1, name: 'GauSuraksha Basic', premium: '₹1,200/year', coverage: '₹50,000', description: 'Covers accidental death, natural calamity, and disease-related death for indigenous breeds.', eligibility: 'Healthy cattle aged 1-10 years with valid RFID registration' },
      { id: 2, name: 'GauSuraksha Plus', premium: '₹2,500/year', coverage: '₹1,00,000', description: 'Comprehensive coverage including surgery, hospitalization, transit insurance, and theft.', eligibility: 'Verified cattle with DNA profiling on GauSetu platform' },
      { id: 3, name: 'GauSuraksha Breed Protect', premium: '₹4,000/year', coverage: '₹2,50,000', description: 'Premium plan for A2-certified breeding bulls and high-yield dairy cows. Includes loss-of-production coverage.', eligibility: 'A2-certified cattle with verified lineage and vet health reports' },
      { id: 4, name: 'NADCP Subsidized Plan', premium: '₹600/year (Govt. subsidized)', coverage: '₹40,000', description: 'Government-backed plan under National Animal Disease Control Programme. 50% premium subsidy for small farmers.', eligibility: 'Small/marginal farmers with ≤5 cattle, Aadhaar-linked registration' },
    ]
  });
});

// All insurance routes require farmer auth
router.use(auth, rbac(['farmer']));

router.get('/eligibility/:cowId', insuranceController.checkEligibility);
router.post('/purchase', insuranceController.purchasePolicy);
router.post('/claim', insuranceController.fileClaim);
router.get('/policies', insuranceController.getMyPolicies);
router.get('/claims', insuranceController.getMyClaims);

module.exports = router;
