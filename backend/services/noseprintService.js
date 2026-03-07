const axios = require('axios');
const crypto = require('crypto');

const NOSEPRINT_API_URL = process.env.NOSEPRINT_API_URL || 'http://localhost:5001/api/noseprint';

/**
 * Generate a mock noseprint ID (deterministic hash from image data)
 */
const generateMockNoseprintId = (rfidNumber, images) => {
  const hash = crypto.createHash('sha256')
    .update(rfidNumber + (images ? images.length.toString() : '0'))
    .digest('hex')
    .substring(0, 16);
  return `NP-${hash.toUpperCase()}`;
};

/**
 * Register nose samples - tries real API first, falls back to mock
 */
const registerNoseprint = async (rfidNumber, images) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/register`, {
      rfidNumber,
      images,
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // Mock fallback: simulate successful registration
    console.log(`[MOCK] Noseprint registration for ${rfidNumber} (real API unavailable)`);
    return {
      success: true,
      noseprintId: generateMockNoseprintId(rfidNumber, images),
      message: 'Noseprint registered (simulated)',
      confidence: 0.95 + Math.random() * 0.04,
      sampleCount: images ? images.length : 0,
    };
  }
};

/**
 * Identify cow by nose image - tries real API, falls back to mock
 */
const identifyByNoseprint = async (image) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/identify`, {
      image,
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // Mock fallback: return simulated high-confidence match
    console.log('[MOCK] Noseprint identification (real API unavailable)');
    const { getDatabase } = require('../database/db');
    const db = getDatabase();

    // Return a random cow from the database as a "match"
    const cow = db.prepare('SELECT c.rfid_number, b.noseprint_id FROM cows c JOIN biometrics b ON c.id = b.cow_id ORDER BY RANDOM() LIMIT 1').get();

    if (cow) {
      return {
        success: true,
        matched: true,
        rfidNumber: cow.rfid_number,
        noseprintId: cow.noseprint_id,
        confidence: 0.87 + Math.random() * 0.10,
        message: 'Match found (simulated)',
      };
    }

    return {
      success: true,
      matched: false,
      confidence: 0,
      message: 'No match found (simulated)',
    };
  }
};

/**
 * Verify if nose image matches a specific RFID - tries real API, falls back to mock
 */
const verifyNoseprint = async (rfidNumber, image) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/verify`, {
      rfidNumber,
      image,
    }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // Mock fallback: simulate verification
    console.log(`[MOCK] Noseprint verification for ${rfidNumber} (real API unavailable)`);
    const { getDatabase } = require('../database/db');
    const db = getDatabase();

    const cow = db.prepare('SELECT c.id FROM cows c JOIN biometrics b ON c.id = b.cow_id WHERE c.rfid_number = ?').get(rfidNumber);

    return {
      success: true,
      verified: !!cow,
      rfidNumber,
      confidence: cow ? (0.90 + Math.random() * 0.09) : (0.10 + Math.random() * 0.20),
      message: cow ? 'Identity verified (simulated)' : 'No biometric record found',
    };
  }
};

/**
 * Check for duplicate noseprint across all registered cows
 */
const checkDuplicateNoseprint = async (images) => {
  // In a real system, this would compare embeddings
  // For hackathon: simulate check by returning no duplicate
  console.log('[MOCK] Duplicate noseprint check (simulated)');
  return {
    isDuplicate: false,
    confidence: 0,
    message: 'No duplicate found (simulated)',
  };
};

module.exports = {
  registerNoseprint,
  identifyByNoseprint,
  verifyNoseprint,
  checkDuplicateNoseprint,
};
