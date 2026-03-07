const insuranceService = require('../services/insuranceService');

const checkEligibility = (req, res) => {
  try {
    const eligibility = insuranceService.checkEligibility(req.params.cowId, req.userId);
    res.json({ success: true, ...eligibility });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const purchasePolicy = (req, res) => {
  try {
    const { cowId, provider, tier } = req.body;
    const policy = insuranceService.purchasePolicy({
      cowId,
      farmerId: req.userId,
      provider,
      tier,
    });
    res.status(201).json({ success: true, message: 'Policy purchased', policy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const fileClaim = (req, res) => {
  try {
    const { policyId, claimType, description, evidenceUrl } = req.body;
    const claim = insuranceService.fileClaim({
      policyId,
      farmerId: req.userId,
      claimType,
      description,
      evidenceUrl,
    });
    res.status(201).json({ success: true, message: 'Claim filed', claim });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyPolicies = (req, res) => {
  try {
    const policies = insuranceService.getPoliciesByFarmer(req.userId);
    res.json({ success: true, count: policies.length, policies });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyClaims = (req, res) => {
  try {
    const claims = insuranceService.getClaimsByFarmer(req.userId);
    res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  checkEligibility,
  purchasePolicy,
  fileClaim,
  getMyPolicies,
  getMyClaims,
};
