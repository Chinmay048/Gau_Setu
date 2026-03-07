const { getDatabase } = require('../database/db');
const { registerNoseprint } = require('./noseprintService');

const registerCowNewborn = async (cowData) => {
  const db = getDatabase();
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    fatherId,
    motherId,
    photoUrl,
    noseImages,
    breed,
  } = cowData;

  // Check for duplicate RFID
  const existing = db.prepare('SELECT * FROM cows WHERE rfid_number = ?').get(rfidNumber);
  if (existing) {
    throw new Error('RFID number already registered');
  }

  let noseprintResult = null;

  // Optional biometric registration
  if (noseImages && noseImages.length >= 3) {
    try {
      noseprintResult = await registerNoseprint(rfidNumber, noseImages);
      if (!noseprintResult.success) {
        console.warn('Failed to register noseprint, continuing without biometrics');
      }
    } catch (error) {
      console.warn('Noseprint registration error:', error.message);
    }
  }

  // Resolve parent IDs from RFID
  let fatherObjectId = null;
  let motherObjectId = null;

  if (fatherId && fatherId.trim() !== '') {
    const fatherCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get(fatherId);
    if (fatherCow) fatherObjectId = fatherCow.id;
  }

  if (motherId && motherId.trim() !== '') {
    const motherCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get(motherId);
    if (motherCow) motherObjectId = motherCow.id;
  }

  // Insert cow
  const result = db.prepare(`
    INSERT INTO cows (rfid_number, farmer_id, gender, birth_date, breed, father_id, mother_id, registration_type, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(rfidNumber, farmerId, gender, birthDate, breed || null, fatherObjectId, motherObjectId, 'newborn', photoUrl || '');

  const cowId = result.lastInsertRowid;

  // Create biometric record if successful
  if (noseprintResult && noseprintResult.success) {
    db.prepare(`
      INSERT INTO biometrics (cow_id, noseprint_id, sample_count, biometric_score)
      VALUES (?, ?, ?, ?)
    `).run(cowId, noseprintResult.noseprintId, noseImages.length, 100);
  }

  const cow = db.prepare(`
    SELECT c.*, b.id as biometric_id, b.noseprint_id
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    WHERE c.id = ?
  `).get(cowId);

  return formatCow(cow);
};

const registerCowPurchased = async (cowData) => {
  const db = getDatabase();
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    photoUrl,
    noseImages,
    breed,
  } = cowData;

  // Check for duplicate
  const existing = db.prepare('SELECT * FROM cows WHERE rfid_number = ?').get(rfidNumber);
  if (existing) {
    throw new Error('RFID number already registered');
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
    INSERT INTO cows (rfid_number, farmer_id, gender, birth_date, breed, registration_type, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(rfidNumber, farmerId, gender, birthDate, breed || null, 'purchased', photoUrl || '');

  const cowId = result.lastInsertRowid;

  if (noseprintResult && noseprintResult.success) {
    db.prepare(`
      INSERT INTO biometrics (cow_id, noseprint_id, sample_count, biometric_score)
      VALUES (?, ?, ?, ?)
    `).run(cowId, noseprintResult.noseprintId, noseImages.length, 100);
  }

  const cow = db.prepare(`
    SELECT c.*, b.id as biometric_id, b.noseprint_id
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    WHERE c.id = ?
  `).get(cowId);

  return formatCow(cow);
};

const getCowsByFarmer = (farmerId) => {
  const db = getDatabase();
  
  const cows = db.prepare(`
    SELECT c.*, 
           b.id as biometric_id, b.noseprint_id,
           f.rfid_number as father_rfid,
           m.rfid_number as mother_rfid
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    LEFT JOIN cows f ON c.father_id = f.id
    LEFT JOIN cows m ON c.mother_id = m.id
    WHERE c.farmer_id = ?
    ORDER BY c.created_at DESC
  `).all(farmerId);

  return cows.map(formatCow);
};

const getCowById = (cowId) => {
  const db = getDatabase();
  
  const cow = db.prepare(`
    SELECT c.*,
           b.id as biometric_id, b.noseprint_id,
           f.rfid_number as father_rfid,
           m.rfid_number as mother_rfid,
           farmer.farm_name as farm_name
    FROM cows c
    LEFT JOIN biometrics b ON c.id = b.cow_id
    LEFT JOIN cows f ON c.father_id = f.id
    LEFT JOIN cows m ON c.mother_id = m.id
    LEFT JOIN farmers farmer ON c.farmer_id = farmer.id
    WHERE c.id = ?
  `).get(cowId);

  if (!cow) {
    throw new Error('Cow not found');
  }

  // Get health records
  const healthRecords = db.prepare(`
    SELECT * FROM health_records WHERE cow_id = ? ORDER BY diagnosed_date DESC
  `).all(cowId);

  // Get vaccinations
  const vaccinations = db.prepare(`
    SELECT * FROM vaccinations WHERE cow_id = ? ORDER BY administered_date DESC
  `).all(cowId);

  return {
    ...formatCow(cow),
    healthRecords: healthRecords.map(formatHealthRecord),
    vaccinations: vaccinations.map(formatVaccination),
  };
};

const addBiometricData = async (cowId, noseImages) => {
  const db = getDatabase();
  
  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) {
    throw new Error('Cow not found');
  }

  const existingBiometric = db.prepare('SELECT * FROM biometrics WHERE cow_id = ?').get(cowId);
  if (existingBiometric) {
    throw new Error('Cow already has biometric data registered');
  }

  if (!noseImages || noseImages.length < 3) {
    throw new Error('At least 3 nose images are required');
  }

  const noseprintResult = await registerNoseprint(cow.rfid_number, noseImages);
  if (!noseprintResult.success) {
    throw new Error('Failed to register noseprint: ' + noseprintResult.error);
  }

  db.prepare(`
    INSERT INTO biometrics (cow_id, noseprint_id, sample_count, biometric_score)
    VALUES (?, ?, ?, ?)
  `).run(cowId, noseprintResult.noseprintId, noseImages.length, 100);

  return getCowById(cowId);
};

const getMatingRecommendations = (cowId) => {const db = getDatabase();
  
  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) {
    throw new Error('Cow not found');
  }

  if (cow.gender !== 'female') {
    throw new Error('Mating recommendations are only available for female cows');
  }

  const recommendations = db.prepare(`
    SELECT 
      mc.*,
      c.rfid_number as bull_rfid,
      c.breed as bull_breed,
      c.birth_date as bull_birth_date,
      farmer.farm_name as bull_farm_name,
      farmer.phone_number as farmer_phone,
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
    commonAncestorGenerations: rec.common_ancestor_generations,
    recommendationRank: rec.recommendation_rank,
    notes: rec.notes,
    healthConditions: rec.health_conditions ? rec.health_conditions.split(',') : [],
  }));
};

const uploadDNAReport = (cowId, reportUrl) => {
  const db = getDatabase();
  
  db.prepare('UPDATE cows SET dna_report_url = ? WHERE id = ?').run(reportUrl, cowId);
  
  return getCowById(cowId);
};

const addVaccination = (vaccinationData) => {
  const db = getDatabase();
  const {
    cowId,
    vaccineName,
    administeredDate,
    nextDueDate,
    certificateUrl,
    administeredBy,
    notes,
  } = vaccinationData;

  db.prepare(`
    INSERT INTO vaccinations (cow_id, vaccine_name, administered_date, next_due_date, certificate_url, administered_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(cowId, vaccineName, administeredDate, nextDueDate || null, certificateUrl || '', administeredBy || '', notes || '');

  return getVaccinationHistory(cowId);
};

const getVaccinationHistory = (cowId) => {
  const db = getDatabase();
  
  const vaccinations = db.prepare(`
    SELECT * FROM vaccinations WHERE cow_id = ? ORDER BY administered_date DESC
  `).all(cowId);

  return vaccinations.map(formatVaccination);
};

const getUpcomingVaccinations = (farmerId) => {
  const db = getDatabase();
  
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const upcoming = db.prepare(`
    SELECT 
      v.*,
      c.rfid_number,
      c.breed
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    WHERE c.farmer_id = ? 
      AND v.next_due_date IS NOT NULL
      AND v.next_due_date BETWEEN ? AND ?
    ORDER BY v.next_due_date ASC
  `).all(farmerId, today, nextMonth);

  return upcoming.map(v => ({
    ...formatVaccination(v),
    cowRFID: v.rfid_number,
    breed: v.breed,
  }));
};

// Helper functions
const formatCow = (cow) => {
  if (!cow) return null;
  
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
    farmName: cow.farm_name,
    createdAt: cow.created_at,
  };
};

const formatHealthRecord = (record) => {
  return {
    id: record.id,
    cowId: record.cow_id,
    conditionType: record.condition_type,
    conditionName: record.condition_name,
    diagnosedDate: record.diagnosed_date,
    status: record.status,
    severity: record.severity,
    notes: record.notes,
    createdAt: record.created_at,
  };
};

const formatVaccination = (vaccination) => {
  return {
    id: vaccination.id,
    cowId: vaccination.cow_id,
    vaccineName: vaccination.vaccine_name,
    administeredDate: vaccination.administered_date,
    nextDueDate: vaccination.next_due_date,
    certificateUrl: vaccination.certificate_url,
    administeredBy: vaccination.administered_by,
    notes: vaccination.notes,
    createdAt: vaccination.created_at,
  };
};

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowsByFarmer,
  getCowById,
  addBiometricData,
  getMatingRecommendations,
  uploadDNAReport,
  addVaccination,
  getVaccinationHistory,
  getUpcomingVaccinations,
};
