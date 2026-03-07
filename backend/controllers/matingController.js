const matingService = require('../services/matingService');

const getMatingRecommendations = async (req, res) => {
  try {
    const { cowId } = req.params;
    const farmerId = req.userId;

    const result = await matingService.getMatingRecommendations(cowId, farmerId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllAvailableBulls = async (req, res) => {
  try {
    const farmerId = req.userId;
    const bulls = await matingService.getAllAvailableBulls(farmerId);

    res.json({
      success: true,
      count: bulls.length,
      bulls
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const calculateCompatibility = async (req, res) => {
  try {
    const { cowId, bullId } = req.params;
    const farmerId = req.userId;

    const compatibility = await matingService.calculateCompatibility(cowId, bullId, farmerId);

    res.json({
      success: true,
      compatibility
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMatingRecommendations,
  getAllAvailableBulls,
  calculateCompatibility
};
