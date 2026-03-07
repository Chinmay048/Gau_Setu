const cowService = require('../services/cowService');

const registerCowNewborn = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, fatherId, motherId, photoUrl, noseImages, breed } = req.body;
    const farmerId = req.userId;

    const cow = await cowService.registerCowNewborn({
      rfidNumber,
      farmerId,
      gender,
      birthDate,
      fatherId,
      motherId,
      photoUrl,
      noseImages,
      breed,
    });

    res.status(201).json({
      success: true,
      message: 'Newborn calf registered successfully',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerCowPurchased = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, photoUrl, noseImages, breed } = req.body;
    const farmerId = req.userId;

    const cow = await cowService.registerCowPurchased({
      rfidNumber,
      farmerId,
      gender,
      birthDate,
      photoUrl,
      noseImages,
      breed,
    });

    res.status(201).json({
      success: true,
      message: 'Purchased cow registered successfully',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCowsByFarmer = async (req, res) => {
  try {
    const farmerId = req.userId;
    const cows = await cowService.getCowsByFarmer(farmerId);

    res.json({
      success: true,
      count: cows.length,
      cows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCowDetail = async (req, res) => {
  try {
    const { cowId } = req.params;
    const cow = await cowService.getCowById(cowId);

    if (!cow) {
      return res.status(404).json({ error: 'Cow not found' });
    }

    res.json({
      success: true,
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addBiometricData = async (req, res) => {
  try {
    const { cowId } = req.params;
    const { noseImages } = req.body;

    const cow = await cowService.addBiometricData(cowId, noseImages);

    res.json({
      success: true,
      message: 'Biometric data added successfully',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMatingRecommendations = async (req, res) => {
  try {
    const { cowId } = req.params;
    const recommendations = await cowService.getMatingRecommendations(cowId);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const uploadDNAReport = async (req, res) => {
  try {
    const { cowId } = req.params;
    const { dnaReportUrl } = req.body;

    const cow = await cowService.uploadDNAReport(cowId, dnaReportUrl);

    res.json({
      success: true,
      message: 'DNA report uploaded successfully',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addVaccination = async (req, res) => {
  try {
    const { cowId } = req.params;
    const { vaccineName, administeredDate, nextDueDate, certificateUrl, administeredBy, notes } = req.body;

    const vaccinations = await cowService.addVaccination({
      cowId,
      vaccineName,
      administeredDate,
      nextDueDate,
      certificateUrl,
      administeredBy,
      notes,
    });

    res.json({
      success: true,
      message: 'Vaccination added successfully',
      vaccinations,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationHistory = async (req, res) => {
  try {
    const { cowId } = req.params;
    const vaccinations = await cowService.getVaccinationHistory(cowId);

    res.json({
      success: true,
      count: vaccinations.length,
      vaccinations,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUpcomingVaccinations = async (req, res) => {
  try {
    const farmerId = req.userId;
    const upcoming = await cowService.getUpcomingVaccinations(farmerId);

    res.json({
      success: true,
      count: upcoming.length,
      vaccinations: upcoming,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCowDNA = async (req, res) => {
  try {
    const { cowId } = req.params;
    const { dnaStatus, dnaReportUrl } = req.body;

    const cow = await cowService.uploadDNAReport(cowId, dnaReportUrl);

    res.json({
      success: true,
      message: 'DNA status updated',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowsByFarmer,
  getCowDetail,
  updateCowDNA,
  addBiometricData,
  getMatingRecommendations,
  uploadDNAReport,
  addVaccination,
  getVaccinationHistory,
  getUpcomingVaccinations,
};
