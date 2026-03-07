const cowService = require('../services/cowService');
const vaccinationService = require('../services/vaccinationService');
const { identifyByNoseprint, verifyNoseprint } = require('../services/noseprintService');

// ─── Registration ────────────────────────────────────────

const registerCowNewborn = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, fatherId, motherId, photoUrl, noseImages, breed } = req.body;
    const cow = await cowService.registerCowNewborn({ rfidNumber, farmerId: req.userId, gender, birthDate, fatherId, motherId, photoUrl, noseImages, breed });
    res.status(201).json({ success: true, message: 'Newborn calf registered successfully', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerCowPurchased = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, photoUrl, noseImages, breed } = req.body;
    const cow = await cowService.registerCowPurchased({ rfidNumber, farmerId: req.userId, gender, birthDate, photoUrl, noseImages, breed });
    res.status(201).json({ success: true, message: 'Purchased cow registered successfully', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Cow Queries ─────────────────────────────────────────

const getCowsByFarmer = (req, res) => {
  try {
    const cows = cowService.getCowsByFarmer(req.userId);
    res.json({ success: true, count: cows.length, cows });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCowDetail = (req, res) => {
  try {
    const cow = cowService.getCowById(req.params.cowId);
    if (!cow) return res.status(404).json({ error: 'Cow not found' });
    res.json({ success: true, cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchCow = (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query required' });
    const results = cowService.searchCow(query);
    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Biometric ───────────────────────────────────────────

const addBiometricData = async (req, res) => {
  try {
    const cow = await cowService.addBiometricData(req.params.cowId, req.body.noseImages);
    res.json({ success: true, message: 'Biometric data added successfully', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const identifyByNose = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Nose image required' });
    const result = await identifyByNoseprint(image);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyNose = async (req, res) => {
  try {
    const { rfidNumber, image } = req.body;
    if (!rfidNumber || !image) return res.status(400).json({ error: 'RFID and nose image required' });
    const result = await verifyNoseprint(rfidNumber, image);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── DNA Status ──────────────────────────────────────────

const updateCowDNA = (req, res) => {
  try {
    const { dnaStatus, dnaReportUrl } = req.body;
    const cow = cowService.updateDNAStatus(req.params.cowId, dnaStatus, dnaReportUrl);
    res.json({ success: true, message: 'DNA status updated', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const uploadDNAReport = (req, res) => {
  try {
    const cow = cowService.uploadDNAReport(req.params.cowId, req.body.dnaReportUrl);
    res.json({ success: true, message: 'DNA report uploaded', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── RFID Lifecycle ──────────────────────────────────────

const reportRFIDLost = (req, res) => {
  try {
    const cow = cowService.reportRFIDLost(req.params.cowId, req.userId);
    res.json({ success: true, message: 'RFID reported as lost', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const replaceRFID = (req, res) => {
  try {
    const { newRfidNumber } = req.body;
    if (!newRfidNumber) return res.status(400).json({ error: 'New RFID number required' });
    const cow = cowService.replaceRFID(req.params.cowId, req.userId, newRfidNumber);
    res.json({ success: true, message: 'RFID replaced successfully', cow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Vaccinations ────────────────────────────────────────

const addVaccination = (req, res) => {
  try {
    const { vaccineName, administeredDate, nextDueDate, certificateUrl, administeredBy, notes } = req.body;
    const vaccinations = cowService.addVaccination({ cowId: req.params.cowId, vaccineName, administeredDate, nextDueDate, certificateUrl, administeredBy, notes });
    res.json({ success: true, message: 'Vaccination added', vaccinations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationHistory = (req, res) => {
  try {
    const vaccinations = cowService.getVaccinationHistory(req.params.cowId);
    res.json({ success: true, count: vaccinations.length, vaccinations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUpcomingVaccinations = (req, res) => {
  try {
    const upcoming = cowService.getUpcomingVaccinations(req.userId);
    res.json({ success: true, count: upcoming.length, vaccinations: upcoming });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationCalendar = (req, res) => {
  try {
    const calendar = vaccinationService.getVaccinationCalendar(req.params.cowId);
    res.json({ success: true, ...calendar });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationSummary = (req, res) => {
  try {
    const summary = vaccinationService.getFarmVaccinationSummary(req.userId);
    res.json({ success: true, ...summary });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Mating ──────────────────────────────────────────────

const getMatingRecommendations = (req, res) => {
  try {
    const recommendations = cowService.getMatingRecommendations(req.params.cowId);
    res.json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowsByFarmer,
  getCowDetail,
  searchCow,
  addBiometricData,
  identifyByNose,
  verifyNose,
  updateCowDNA,
  uploadDNAReport,
  reportRFIDLost,
  replaceRFID,
  addVaccination,
  getVaccinationHistory,
  getUpcomingVaccinations,
  getVaccinationCalendar,
  getVaccinationSummary,
  getMatingRecommendations,
};
