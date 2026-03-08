const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/db');

const MOCK_OTP = '123456';

// JWT Configuration - Centralized
const JWT_SECRET = process.env.JWT_SECRET || 'gausetu-hackathon-secret-2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment - using default (NOT SECURE FOR PRODUCTION)');
}

const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: role || user.role || 'farmer',
      type: role || user.role || 'farmer',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// ─── Farmer Auth ─────────────────────────────────────────

const registerFarmer = async (email, password, farmName, phoneNumber, location) => {
  const db = getDatabase();

  const existing = db.prepare('SELECT * FROM farmers WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = db.prepare(`
    INSERT INTO farmers (email, password, farm_name, phone_number, location)
    VALUES (?, ?, ?, ?, ?)
  `).run(email, hashedPassword, farmName, phoneNumber, location);

  const farmer = db.prepare('SELECT id, email, farm_name as farmName, phone_number as phoneNumber, location FROM farmers WHERE id = ?')
    .get(result.lastInsertRowid);

  return { ...farmer, role: 'farmer' };
};

const loginFarmer = async (email, password) => {
  const db = getDatabase();

  const farmer = db.prepare('SELECT * FROM farmers WHERE email = ?').get(email);
  if (!farmer) throw new Error('Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, farmer.password);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  return {
    id: farmer.id,
    email: farmer.email,
    farmName: farmer.farm_name,
    phoneNumber: farmer.phone_number,
    location: farmer.location,
    reputationScore: farmer.reputation_score,
    role: 'farmer',
  };
};

// ─── OTP Auth (Mock) ────────────────────────────────────

const sendOTP = (phoneNumber) => {
  return { success: true, message: `OTP sent to ${phoneNumber} (demo: use ${MOCK_OTP})` };
};

const verifyOTP = (phoneNumber, otp) => {
  if (otp === MOCK_OTP) return { success: true, verified: true };
  return { success: false, verified: false, message: 'Invalid OTP' };
};

const loginFarmerOTP = async (phoneNumber, otp, location) => {
  const db = getDatabase();

  const verification = verifyOTP(phoneNumber, otp);
  if (!verification.verified) throw new Error('Invalid OTP');

  let farmer = db.prepare('SELECT * FROM farmers WHERE phone_number = ?').get(phoneNumber);

  if (!farmer) {
    const hashedPassword = await bcrypt.hash('otp-user-' + phoneNumber, 10);
    const result = db.prepare(`
      INSERT INTO farmers (email, password, farm_name, phone_number, location)
      VALUES (?, ?, ?, ?, ?)
    `).run(`farmer-${phoneNumber.replace(/\D/g, '')}@gausetu.in`, hashedPassword, `Farm-${phoneNumber.slice(-4)}`, phoneNumber, location || 'India');

    farmer = db.prepare('SELECT * FROM farmers WHERE id = ?').get(result.lastInsertRowid);
  }

  return {
    id: farmer.id,
    email: farmer.email,
    farmName: farmer.farm_name,
    phoneNumber: farmer.phone_number,
    location: farmer.location,
    role: 'farmer',
  };
};

// ─── Veterinarian Auth ───────────────────────────────────

const registerVet = async (email, password, name, clinicName, licenseNumber, phoneNumber, address) => {
  const db = getDatabase();

  const existing = db.prepare('SELECT * FROM vets WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const existingLicense = db.prepare('SELECT * FROM vets WHERE license_number = ?').get(licenseNumber);
  if (existingLicense) throw new Error('License number already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = db.prepare(`
    INSERT INTO vets (email, password, name, clinic_name, license_number, phone_number, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
  `).run(email, hashedPassword, name, clinicName, licenseNumber, phoneNumber, address);

  const vet = db.prepare('SELECT id, email, name, clinic_name as clinicName, license_number as licenseNumber, phone_number as phoneNumber, status FROM vets WHERE id = ?')
    .get(result.lastInsertRowid);

  return { ...vet, role: 'vet' };
};

const loginVet = async (email, password) => {
  const db = getDatabase();

  const vet = db.prepare('SELECT * FROM vets WHERE email = ?').get(email);
  if (!vet) throw new Error('Invalid credentials');
  if (vet.status !== 'approved') throw new Error('Account pending approval');

  const isPasswordValid = await bcrypt.compare(password, vet.password);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  return {
    id: vet.id,
    email: vet.email,
    name: vet.name,
    clinicName: vet.clinic_name,
    licenseNumber: vet.license_number,
    region: vet.region,
    role: 'vet',
  };
};

// ─── Government Auth ─────────────────────────────────────

const registerGovernment = async (email, password, name, department, region, accessLevel) => {
  const db = getDatabase();

  const existing = db.prepare('SELECT * FROM government_users WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = db.prepare(`
    INSERT INTO government_users (email, password, name, department, region, access_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email, hashedPassword, name, department, region, accessLevel || 'district');

  const gov = db.prepare('SELECT id, email, name, department, region, access_level as accessLevel FROM government_users WHERE id = ?')
    .get(result.lastInsertRowid);

  return { ...gov, role: 'government' };
};

const loginGovernment = async (email, password) => {
  const db = getDatabase();

  const gov = db.prepare('SELECT * FROM government_users WHERE email = ?').get(email);
  if (!gov) throw new Error('Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, gov.password);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  return {
    id: gov.id,
    email: gov.email,
    name: gov.name,
    department: gov.department,
    region: gov.region,
    accessLevel: gov.access_level,
    role: 'government',
  };
};

// ─── Profile ─────────────────────────────────────────────

const getProfile = (userId, role) => {
  const db = getDatabase();

  if (role === 'farmer') {
    const farmer = db.prepare('SELECT id, email, farm_name as farmName, phone_number as phoneNumber, location, reputation_score as reputationScore, created_at as createdAt FROM farmers WHERE id = ?').get(userId);
    if (!farmer) throw new Error('Farmer not found');
    const cowCount = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ?').get(userId).count;
    return { ...farmer, role: 'farmer', totalCattle: cowCount };
  }

  if (role === 'vet') {
    const vet = db.prepare('SELECT id, email, name, clinic_name as clinicName, license_number as licenseNumber, phone_number as phoneNumber, address, region, status, created_at as createdAt FROM vets WHERE id = ?').get(userId);
    if (!vet) throw new Error('Vet not found');
    const reportCount = db.prepare('SELECT COUNT(*) as count FROM vet_reports WHERE vet_id = ?').get(userId).count;
    return { ...vet, role: 'vet', totalReports: reportCount };
  }

  if (role === 'government') {
    const gov = db.prepare('SELECT id, email, name, department, region, access_level as accessLevel, created_at as createdAt FROM government_users WHERE id = ?').get(userId);
    if (!gov) throw new Error('Government user not found');
    return { ...gov, role: 'government' };
  }

  throw new Error('Unknown role');
};

module.exports = {
  generateToken,
  registerFarmer,
  loginFarmer,
  sendOTP,
  verifyOTP,
  loginFarmerOTP,
  registerVet,
  loginVet,
  registerGovernment,
  loginGovernment,
  getProfile,
};
