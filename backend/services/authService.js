const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/db');

const generateToken = (user, type) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: 'farmer',
      type: type,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const registerFarmer = async (email, password, farmName, phoneNumber, location) => {
  const db = getDatabase();
  
  // Check if farmer already exists
  const existing = db.prepare('SELECT * FROM farmers WHERE email = ?').get(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert farmer
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
  
  if (!farmer) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, farmer.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: farmer.id,
    email: farmer.email,
    farmName: farmer.farm_name,
    phoneNumber: farmer.phone_number,
    location: farmer.location,
    role: 'farmer'
  };
};

module.exports = {
  generateToken,
  registerFarmer,
  loginFarmer,
};
