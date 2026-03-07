const { getDatabase } = require('../database/db');

/**
 * Phase 3: Livestock Insurance Integration (Mocked)
 * All insurance operations are simulated for hackathon demo
 */

// Mock insurance providers
const PROVIDERS = [
  { name: 'National Insurance Co.', basic: 1200, standard: 2500, premium: 4000 },
  { name: 'United India Insurance', basic: 1100, standard: 2300, premium: 3800 },
  { name: 'Agriculture Insurance Co.', basic: 1000, standard: 2200, premium: 3500 },
];

// ─── Check Eligibility ───────────────────────────────────

const checkEligibility = (cowId, farmerId) => {
  const db = getDatabase();

  const cow = db.prepare(`
    SELECT c.*, b.id as has_biometric
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    WHERE c.id = ? AND c.farmer_id = ?
  `).get(cowId, farmerId);

  if (!cow) throw new Error('Cow not found or not authorized');

  const vaccinations = db.prepare('SELECT COUNT(*) as count FROM vaccinations WHERE cow_id = ?').get(cowId).count;
  const healthRecords = db.prepare('SELECT COUNT(*) as count FROM health_records WHERE cow_id = ? AND status = ?').get(cowId, 'active').count;

  const checks = {
    identityVerified: cow.rfid_status === 'active',
    biometricRegistered: !!cow.has_biometric,
    vaccinationRecords: vaccinations >= 2,
    dnaVerified: cow.dna_status === 'verified',
    noActiveHealthIssues: healthRecords === 0,
  };

  const eligible = checks.identityVerified && checks.vaccinationRecords;
  const premiumDiscount = checks.dnaVerified && checks.biometricRegistered ? 15 : 0;

  return {
    cowId: cow.id,
    rfidNumber: cow.rfid_number,
    breed: cow.breed,
    eligible,
    checks,
    premiumDiscount,
    availablePlans: eligible ? PROVIDERS.map(p => ({
      provider: p.name,
      plans: [
        { type: 'basic', premium: Math.round(p.basic * (1 - premiumDiscount / 100)), coverage: 25000 },
        { type: 'standard', premium: Math.round(p.standard * (1 - premiumDiscount / 100)), coverage: 50000 },
        { type: 'premium', premium: Math.round(p.premium * (1 - premiumDiscount / 100)), coverage: 100000 },
      ],
    })) : [],
    message: eligible ? 'Cow is eligible for insurance' : 'Cow does not meet minimum insurance requirements (need active RFID and 2+ vaccinations)',
  };
};

// ─── Purchase Policy (Mocked) ────────────────────────────

const purchasePolicy = (cowId, farmerId, provider, coverageType) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ? AND farmer_id = ?').get(cowId, farmerId);
  if (!cow) throw new Error('Cow not found');

  // Check no existing active policy
  const existing = db.prepare('SELECT id FROM insurance_policies WHERE cow_id = ? AND status = ?').get(cowId, 'active');
  if (existing) throw new Error('Cow already has an active insurance policy');

  const providerData = PROVIDERS.find(p => p.name === provider) || PROVIDERS[0];
  const premiums = { basic: providerData.basic, standard: providerData.standard, premium: providerData.premium };
  const coverages = { basic: 25000, standard: 50000, premium: 100000 };

  const policyNumber = `GS-INS-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const result = db.prepare(`
    INSERT INTO insurance_policies (cow_id, farmer_id, policy_number, provider, coverage_type, premium_amount, coverage_amount, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(cowId, farmerId, policyNumber, provider || providerData.name, coverageType || 'standard',
    premiums[coverageType] || premiums.standard, coverages[coverageType] || coverages.standard, startDate, endDate);

  return getPolicyById(result.lastInsertRowid);
};

// ─── File Claim (Mocked) ─────────────────────────────────

const fileClaim = (policyId, farmerId, claimData) => {
  const db = getDatabase();
  const { claimType, claimAmount, description } = claimData;

  const policy = db.prepare(`
    SELECT ip.* FROM insurance_policies ip WHERE ip.id = ? AND ip.farmer_id = ? AND ip.status = 'active'
  `).get(policyId, farmerId);

  if (!policy) throw new Error('Active policy not found or not authorized');

  if (claimAmount > policy.coverage_amount) throw new Error('Claim amount exceeds coverage');

  const result = db.prepare(`
    INSERT INTO insurance_claims (policy_id, claim_type, claim_amount, description, rfid_verified, noseprint_verified, vet_validated, status)
    VALUES (?, ?, ?, ?, 1, 1, 0, 'pending')
  `).run(policyId, claimType, claimAmount, description || '');

  // Simulate processing: auto-approve after "review"
  db.prepare('UPDATE insurance_claims SET status = ? WHERE id = ?').run('under_review', result.lastInsertRowid);

  return {
    id: result.lastInsertRowid,
    policyId,
    policyNumber: policy.policy_number,
    claimType,
    claimAmount,
    status: 'under_review',
    message: 'Claim submitted and under review (simulated processing)',
    estimatedProcessingDays: 5,
  };
};

// ─── Get Policies by Farmer ──────────────────────────────

const getPoliciesByFarmer = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT ip.*, c.rfid_number, c.breed
    FROM insurance_policies ip
    JOIN cows c ON ip.cow_id = c.id
    WHERE ip.farmer_id = ?
    ORDER BY ip.created_at DESC
  `).all(farmerId).map(p => ({
    id: p.id,
    cowRFID: p.rfid_number,
    cowBreed: p.breed,
    policyNumber: p.policy_number,
    provider: p.provider,
    coverageType: p.coverage_type,
    premiumAmount: p.premium_amount,
    coverageAmount: p.coverage_amount,
    startDate: p.start_date,
    endDate: p.end_date,
    status: p.status,
  }));
};

// ─── Get Claims ──────────────────────────────────────────

const getClaimsByFarmer = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT ic.*, ip.policy_number, ip.provider, c.rfid_number
    FROM insurance_claims ic
    JOIN insurance_policies ip ON ic.policy_id = ip.id
    JOIN cows c ON ip.cow_id = c.id
    WHERE ip.farmer_id = ?
    ORDER BY ic.created_at DESC
  `).all(farmerId).map(c => ({
    id: c.id,
    policyNumber: c.policy_number,
    provider: c.provider,
    cowRFID: c.rfid_number,
    claimType: c.claim_type,
    claimAmount: c.claim_amount,
    description: c.description,
    rfidVerified: c.rfid_verified === 1,
    noseprintVerified: c.noseprint_verified === 1,
    vetValidated: c.vet_validated === 1,
    status: c.status,
    createdAt: c.created_at,
  }));
};

const getPolicyById = (id) => {
  const db = getDatabase();
  const p = db.prepare(`
    SELECT ip.*, c.rfid_number, c.breed FROM insurance_policies ip JOIN cows c ON ip.cow_id = c.id WHERE ip.id = ?
  `).get(id);
  if (!p) return null;
  return {
    id: p.id,
    cowRFID: p.rfid_number,
    cowBreed: p.breed,
    policyNumber: p.policy_number,
    provider: p.provider,
    coverageType: p.coverage_type,
    premiumAmount: p.premium_amount,
    coverageAmount: p.coverage_amount,
    startDate: p.start_date,
    endDate: p.end_date,
    status: p.status,
  };
};

module.exports = {
  checkEligibility,
  purchasePolicy,
  fileClaim,
  getPoliciesByFarmer,
  getClaimsByFarmer,
};
