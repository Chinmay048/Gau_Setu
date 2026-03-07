const cowService = require('../services/cowService');
const Biometric = require('../models/Biometric');

const registerCowNewborn = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, fatherId, motherId, photoUrl, noseImages } = req.body;
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
    });

    res.status(201).json({
      success: true,
      message: 'Newborn calf registered successfully with biometric data',
      cow,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerCowPurchased = async (req, res) => {
  try {
    const { rfidNumber, gender, birthDate, photoUrl, noseImages } = req.body;
    const farmerId = req.userId;

    const cow = await cowService.registerCowPurchased({
      rfidNumber,
      farmerId,
      gender,
      birthDate,
      photoUrl,
      noseImages,
    });

    res.status(201).json({
      success: true,
      message: 'Purchased cow registered successfully with biometric data',
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

const updateCowDNA = async (req, res) => {
  try {
    const { cowId } = req.params;
    const { dnaStatus, dnaReportUrl } = req.body;

    const cow = await cowService.updateCow(cowId, {
      dnaStatus,
      dnaReport: {
        reportUrl: dnaReportUrl,
        uploadedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'DNA status updated',
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

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowsByFarmer,
  getCowDetail,
  updateCowDNA,
  addBiometricData,
};
