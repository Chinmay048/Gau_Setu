const axios = require('axios');

const NOSEPRINT_API_URL = process.env.NOSEPRINT_API_URL || 'http://localhost:5001/api/noseprint';

/**
 * Register multiple nose samples with the ML model
 * @param {string} rfidNumber - RFID number of the cow
 * @param {string[]} images - Array of base64 encoded nose images
 * @returns {Promise<Object>} - Response containing noseprintId
 */
const registerNoseprint = async (rfidNumber, images) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/register`, {
      rfidNumber,
      images,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to register noseprint');
  }
};

/**
 * Identify cow by nose image when RFID is lost
 * @param {string} image - Base64 encoded nose image
 * @returns {Promise<Object>} - Match result with RFID if found
 */
const identifyByNoseprint = async (image) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/identify`, {
      image,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to identify noseprint');
  }
};

/**
 * Verify if a nose image matches a specific RFID
 * @param {string} rfidNumber - RFID number to verify against
 * @param {string} image - Base64 encoded nose image
 * @returns {Promise<Object>} - Verification result
 */
const verifyNoseprint = async (rfidNumber, image) => {
  try {
    const response = await axios.post(`${NOSEPRINT_API_URL}/verify`, {
      rfidNumber,
      image,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to verify noseprint');
  }
};

module.exports = {
  registerNoseprint,
  identifyByNoseprint,
  verifyNoseprint,
};
