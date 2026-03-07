const { getDatabase } = require('../database/db');
const { registerNoseprint, checkDuplicateNoseprint } = require('./noseprintService');

// ─── Register Newborn Calf ───────────────────────────────

const registerCowNewborn = async (cowData) => {
  const db = getDatabase();
  const { rfidNumber, farmerId, gender, birthDate, fatherId, motherId, photoUrl, noseImages, breed } = cowData;

  // Duplicate RFID check
  const existing = db.prepare('SELECT * FROM cows WHERE rfid_number = ?').get(rfidNumber);
  if (existing) throw new Error('RFID number already registered');

  // Duplicate noseprint check
  if (noseImages && noseImages.length >= 3) {
    const dupCheck = await checkDuplicateNoseprint(noseImages);
    if (dupCheck.isDuplicate) throw new Error('Duplicate noseprint detected - this cow may already be registered');
  }

  let noseprintResult = null;
  if (noseImages && noseImages.length >= 3) {
    try {
      noseprintResult = await registerNoseprint(rfidNumber, noseImages);
    } catch (error) {
      console.warn('Noseprint registration error:', error.message);
    }
  }

  // Resolve parent IDs from RFID
  let fatherObjectId = null;
  let motherObjectId = null;

  if (fatherId && fatherId.toString().trim() !== '') {
    const fatherCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ? OR id = ?').get(fatherId, fatherId);
    if (fatherCow) fatherObjectId = fatherCow.id;
  }

  if (motherId && motherId.toString().trim() !== '') {
    const motherCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ? OR id = ?').get(motherId, motherId);
    if (motherCow) motherObjectId = motherCow.id;
  }

  const result = db.prepare(`
    INSERT INTO cows (rfid_number, farmer_id, gender, birth_date, breed, father_id, mother_id, registration_type, photo_url, dna_status, rfid_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'newborn', ?, 'pending', 'active')
  `).run(rfidNumber, farmerId, gender, birthDate, breed || null, fatherObjectId, motherObjectId, photoUrl || '');

  const cowId = result.lastInsertRowid;

  // Create biometric record
  if (noseprintResult && noseprintResult.success) {
    db.prepare(`
      INSERT INTO biometrics (cow_id, noseprint_id, noseprint_hash, sample_count, biometric_score)
      VALUES (?, ?, ?, ?, ?)
    `).run(cowId, noseprintResult.noseprintId, noseprintResult.noseprintId, noseImages.length, 100);
  }

  // Record RFID history
  db.prepare(`INSERT INTO rfid_history (cow_id, rfid_number, status, assigned_date) VALUES (?, ?, 'active', ?)`)
    .run(cowId, rfidNumber, birthDate);

  return getCowById(cowId);
};

// ─── Register Purchased Cow ──────────────────────────────

const registerCowPurchased = async (cowData) => {
  const db = getDatabase();
  const { rfidNumber, farmerId, gender, birthDate, photoUrl, noseImages, breed } = cowData;

  const existing = db.prepare('SELECT * FROM cows WHERE rfid_number = ?').get(rfidNumber);
  if (existing) throw new Error('RFID number already registered');

  if (noseImages && noseImages.length >= 3) {
    const dupCheck = await checkDuplicateNoseprint(noseImages);
    if (dupCheck.isDuplicate) throw new Error('Duplicate noseprint detected');
  }

  let noseprintResult = null;
  if (noseImages && noseImages.length >= 3) {
    try {
      noseprintResult = await registerNoseprint(rfidNumber, noseImages);
    } catch (error) {
      console.warn('Noseprint registration error:', error.message);
    }
  }

  const result = db.prepare(`
    INSERT INTO cows (rfid_number, farmer_id, gender, birth_date, breed, registration_type, photo_url, dna_status, rfid_status)
    VALUES (?, ?, ?, ?, ?, 'purchased', ?, 'pending', 'active')
  `).run(rfidNumber, farmerId, gender, birthDate, breed || null, photoUrl || '');

  const cowId = result.lastInsertRowid;

  if (noseprintResult && noseprintResult.success) {
    db.prepare(`
      INSERT INTO biometrics (cow_id, noseprint_id, noseprint_hash, sample_count, biometric_score)
      VALUES (?, ?, ?, ?, ?)
    `).run(cowId, noseprintResult.noseprintId, noseprintResult.noseprintId, noseImages.length, 100);
  }

  db.prepare(`INSERT INTO rfid_history (cow_id, rfid_number, status, assigned_date) VALUES (?, ?, 'active', date('now'))`)
    .run(cowId, rfidNumber);

  return getCowById(cowId);
};

// ─── Get Cows by Farmer ──────────────────────────────────

const getCowsByFarmer = (farmerId) => {
  const db = getDatabase();

  const cows = db.prepare(`
    SELECT c.*,
           b.id as biometric_id, b.noseprint_id,
           f.rfid_number as father_rfid,
           m.rfid_number as mother_rfid,
           g.a2_gene_status
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    LEFT JOIN cows f ON c.father_id = f.id
    LEFT JOIN cows m ON c.mother_id = m.id
    LEFT JOIN cow_genetics g ON c.id = g.cow_id
    WHERE c.farmer_id = ?
    ORDER BY c.created_at DESC
  `).all(farmerId);

  return cows.map(formatCow);
};

// ─── Get Cow by ID ───────────────────────────────────────

const getCowById = (cowId) => {
  const db = getDatabase();

  const cow = db.prepare(`
    SELECT c.*,
           b.id as biometric_id, b.noseprint_id, b.sample_count, b.biometric_score,
           f.rfid_number as father_rfid,
           m.rfid_number as mother_rfid,
           farmer.farm_name as farm_name, farmer.location as farm_location,
           g.a2_gene_status, g.heat_tolerance, g.disease_resistance, g.milk_yield_potential, g.lineage_purity
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    LEFT JOIN cows f ON c.father_id = f.id
    LEFT JOIN cows m ON c.mother_id = m.id
    LEFT JOIN farmers farmer ON c.farmer_id = farmer.id
    LEFT JOIN cow_genetics g ON c.id = g.cow_id
    WHERE c.id = ?
  `).get(cowId);

  if (!cow) throw new Error('Cow not found');

  const healthRecords = db.prepare('SELECT * FROM health_records WHERE cow_id = ? ORDER BY diagnosed_date DESC').all(cowId);
  const vaccinations = db.prepare('SELECT * FROM vaccinations WHERE cow_id = ? ORDER BY administered_date DESC').all(cowId);
  const rfidHistory = db.prepare('SELECT * FROM rfid_history WHERE cow_id = ? ORDER BY assigned_date DESC').all(cowId);

  // Build family tree (3 gen)
  const familyTree = buildFamilyTree(cowId, db, 3);

  return {
    ...formatCow(cow),
    genetics: cow.a2_gene_status ? {
      a2GeneStatus: cow.a2_gene_status,
      heatTolerance: cow.heat_tolerance,
      diseaseResistance: cow.disease_resistance,
      milkYieldPotential: cow.milk_yield_potential,
      lineagePurity: cow.lineage_purity,
    } : null,
    healthRecords: healthRecords.map(formatHealthRecord),
    vaccinations: vaccinations.map(formatVaccination),
    rfidHistory: rfidHistory.map(h => ({
      id: h.id,
      rfidNumber: h.rfid_number,
      status: h.status,
      assignedDate: h.assigned_date,
      removedDate: h.removed_date,
      reason: h.reason,
    })),
    familyTree,
  };
};

// ─── Build Family Tree ───────────────────────────────────

const buildFamilyTree = (cowId, db, depth) => {
  if (depth <= 0) return null;

  const cow = db.prepare('SELECT id, rfid_number, gender, breed, birth_date, father_id, mother_id FROM cows WHERE id = ?').get(cowId);
  if (!cow) return null;

  return {
    id: cow.id,
    rfidNumber: cow.rfid_number,
    gender: cow.gender,
    breed: cow.breed,
    birthDate: cow.birth_date,
    father: cow.father_id ? buildFamilyTree(cow.father_id, db, depth - 1) : null,
    mother: cow.mother_id ? buildFamilyTree(cow.mother_id, db, depth - 1) : null,
  };
};

// ─── Add Biometric Data ──────────────────────────────────

const addBiometricData = async (cowId, noseImages) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) throw new Error('Cow not found');

  const existingBio = db.prepare('SELECT * FROM biometrics WHERE cow_id = ?').get(cowId);
  if (existingBio) throw new Error('Cow already has biometric data registered');
  if (!noseImages || noseImages.length < 3) throw new Error('At least 3 nose images are required');

  const noseprintResult = await registerNoseprint(cow.rfid_number, noseImages);
  if (!noseprintResult.success) throw new Error('Failed to register noseprint: ' + noseprintResult.error);

  db.prepare(`
    INSERT INTO biometrics (cow_id, noseprint_id, noseprint_hash, sample_count, biometric_score)
    VALUES (?, ?, ?, ?, ?)
  `).run(cowId, noseprintResult.noseprintId, noseprintResult.noseprintId, noseImages.length, 100);

  return getCowById(cowId);
};

// ─── DNA Status Workflow ─────────────────────────────────

const updateDNAStatus = (cowId, dnaStatus, dnaReportUrl) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) throw new Error('Cow not found');

  const validStatuses = ['pending', 'uploaded', 'verified'];
  if (!validStatuses.includes(dnaStatus)) throw new Error('Invalid DNA status');

  db.prepare('UPDATE cows SET dna_status = ?, dna_report_url = COALESCE(?, dna_report_url) WHERE id = ?')
    .run(dnaStatus, dnaReportUrl || null, cowId);

  // If verified, mark cow as fully verified (if RFID is active and biometrics exist)
  if (dnaStatus === 'verified') {
    const bio = db.prepare('SELECT id FROM biometrics WHERE cow_id = ?').get(cowId);
    if (bio && cow.rfid_status === 'active') {
      db.prepare('UPDATE cows SET is_verified = 1 WHERE id = ?').run(cowId);
    }
  }

  return getCowById(cowId);
};

const uploadDNAReport = (cowId, dnaReportUrl) => {
  const db = getDatabase();
  db.prepare('UPDATE cows SET dna_report_url = ?, dna_status = ? WHERE id = ?').run(dnaReportUrl, 'uploaded', cowId);
  return getCowById(cowId);
};

// ─── RFID Lifecycle ──────────────────────────────────────

const reportRFIDLost = (cowId, farmerId) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ? AND farmer_id = ?').get(cowId, farmerId);
  if (!cow) throw new Error('Cow not found or not authorized');
  if (cow.rfid_status === 'lost') throw new Error('RFID already reported as lost');

  // Mark current RFID as lost
  db.prepare('UPDATE cows SET rfid_status = ? WHERE id = ?').run('lost', cowId);
  db.prepare('UPDATE rfid_history SET status = ?, removed_date = date(\'now\'), reason = ? WHERE cow_id = ? AND status = ?')
    .run('lost', 'Lost by farmer', cowId, 'active');

  return getCowById(cowId);
};

const replaceRFID = (cowId, farmerId, newRfidNumber) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ? AND farmer_id = ?').get(cowId, farmerId);
  if (!cow) throw new Error('Cow not found or not authorized');

  // Check new RFID not taken
  const existing = db.prepare('SELECT id FROM cows WHERE rfid_number = ? AND id != ?').get(newRfidNumber, cowId);
  if (existing) throw new Error('New RFID number is already in use');

  // Mark old as replaced
  db.prepare('UPDATE rfid_history SET status = ?, removed_date = date(\'now\'), reason = ? WHERE cow_id = ? AND status IN (?, ?)')
    .run('replaced', 'Replaced with ' + newRfidNumber, cowId, 'active', 'lost');

  // Update cow with new RFID
  db.prepare('UPDATE cows SET rfid_number = ?, rfid_status = ? WHERE id = ?').run(newRfidNumber, 'active', cowId);

  // Create new RFID history entry
  db.prepare('INSERT INTO rfid_history (cow_id, rfid_number, status, assigned_date) VALUES (?, ?, ?, date(\'now\'))')
    .run(cowId, newRfidNumber, 'active');

  return getCowById(cowId);
};

// ─── Vaccination CRUD ────────────────────────────────────

const addVaccination = (vaccinationData) => {
  const db = getDatabase();
  const { cowId, vaccineName, administeredDate, nextDueDate, certificateUrl, administeredBy, notes } = vaccinationData;

  db.prepare(`
    INSERT INTO vaccinations (cow_id, vaccine_name, administered_date, next_due_date, certificate_url, administered_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(cowId, vaccineName, administeredDate, nextDueDate || null, certificateUrl || '', administeredBy || '', notes || '');

  return getVaccinationHistory(cowId);
};

const getVaccinationHistory = (cowId) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM vaccinations WHERE cow_id = ? ORDER BY administered_date DESC').all(cowId).map(formatVaccination);
};

const getUpcomingVaccinations = (farmerId) => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return db.prepare(`
    SELECT v.*, c.rfid_number, c.breed
    FROM vaccinations v JOIN cows c ON v.cow_id = c.id
    WHERE c.farmer_id = ? AND v.next_due_date IS NOT NULL AND v.next_due_date BETWEEN ? AND ?
    ORDER BY v.next_due_date ASC
  `).all(farmerId, today, nextMonth).map(v => ({
    ...formatVaccination(v),
    cowRFID: v.rfid_number,
    breed: v.breed,
  }));
};

// ─── Mating Recommendations ─────────────────────────────

const getMatingRecommendations = (cowId) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) throw new Error('Cow not found');
  if (cow.gender !== 'female') throw new Error('Mating recommendations are only available for female cows');

  const recommendations = db.prepare(`
    SELECT mc.*, c.rfid_number as bull_rfid, c.breed as bull_breed, c.birth_date as bull_birth_date,
           farmer.farm_name as bull_farm_name, farmer.phone_number as farmer_phone,
           GROUP_CONCAT(DISTINCT hr.condition_name) as health_conditions
    FROM mating_compatibility mc
    JOIN cows c ON mc.bull_id = c.id
    JOIN farmers farmer ON c.farmer_id = farmer.id
    LEFT JOIN health_records hr ON c.id = hr.cow_id AND hr.status IN ('active', 'chronic')
    WHERE mc.cow_id = ?
    GROUP BY mc.id
    ORDER BY mc.compatibility_score DESC
    LIMIT 5
  `).all(cowId);

  return recommendations.map(rec => ({
    id: rec.id,
    bullRFID: rec.bull_rfid,
    breed: rec.bull_breed,
    birthDate: rec.bull_birth_date,
    farmName: rec.bull_farm_name,
    farmerPhone: rec.farmer_phone,
    compatibilityScore: rec.compatibility_score,
    geneticDiversityScore: rec.genetic_diversity_score,
    healthCompatibilityScore: rec.health_compatibility_score,
    breedMatch: rec.breed_match === 1,
    inbreedingRisk: rec.inbreeding_risk,
    commonAncestorGenerations: rec.common_ancestor_generations,
    recommendationRank: rec.recommendation_rank,
    notes: rec.notes,
    healthConditions: rec.health_conditions ? rec.health_conditions.split(',') : [],
  }));
};

// ─── Search Cow by RFID or Noseprint ─────────────────────

const searchCow = (query) => {
  const db = getDatabase();

  // Search by RFID
  const byRfid = db.prepare(`
    SELECT c.*, b.noseprint_id, f.farm_name
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    LEFT JOIN farmers f ON c.farmer_id = f.id
    WHERE c.rfid_number LIKE ?
  `).all(`%${query}%`);

  return byRfid.map(formatCow);
};

// ─── Helpers ─────────────────────────────────────────────

const formatCow = (cow) => {
  if (!cow) return null;

  const birthDate = new Date(cow.birth_date);
  const now = new Date();
  const ageDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));

  return {
    _id: cow.id,
    id: cow.id,
    rfidNumber: cow.rfid_number,
    farmerId: cow.farmer_id,
    gender: cow.gender,
    birthDate: cow.birth_date,
    breed: cow.breed,
    fatherId: cow.father_id,
    motherId: cow.mother_id,
    fatherRFID: cow.father_rfid,
    motherRFID: cow.mother_rfid,
    biometricId: cow.biometric_id,
    noseprintId: cow.noseprint_id,
    registrationType: cow.registration_type,
    photoUrl: cow.photo_url,
    dnaReportUrl: cow.dna_report_url,
    dnaStatus: cow.dna_status || 'pending',
    rfidStatus: cow.rfid_status || 'active',
    isVerified: cow.is_verified === 1,
    a2GeneStatus: cow.a2_gene_status || null,
    farmName: cow.farm_name,
    farmLocation: cow.farm_location,
    ageDays,
    ageMonths: Math.floor(ageDays / 30),
    ageYears: parseFloat((ageDays / 365).toFixed(1)),
    createdAt: cow.created_at,
  };
};

const formatHealthRecord = (record) => ({
  id: record.id,
  cowId: record.cow_id,
  conditionType: record.condition_type,
  conditionName: record.condition_name,
  diagnosedDate: record.diagnosed_date,
  status: record.status,
  severity: record.severity,
  notes: record.notes,
  createdAt: record.created_at,
});

const formatVaccination = (v) => ({
  id: v.id,
  cowId: v.cow_id,
  vaccineName: v.vaccine_name,
  administeredDate: v.administered_date,
  nextDueDate: v.next_due_date,
  certificateUrl: v.certificate_url,
  administeredBy: v.administered_by,
  verified: v.verified === 1,
  notes: v.notes,
  createdAt: v.created_at,
});

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowsByFarmer,
  getCowById,
  addBiometricData,
  updateDNAStatus,
  uploadDNAReport,
  reportRFIDLost,
  replaceRFID,
  getMatingRecommendations,
  addVaccination,
  getVaccinationHistory,
  getUpcomingVaccinations,
  searchCow,
};
