const breedingService = require('../services/breedingService');

const getRecommendations = (req, res) => {
  try {
    const recommendations = breedingService.getBreedingRecommendations(req.params.cowId, req.userId);
    res.json({ success: true, ...recommendations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCowGenetics = (req, res) => {
  try {
    const genetics = breedingService.getCowGenetics(req.params.cowId);
    if (!genetics) return res.status(404).json({ error: 'No genetics data found for this cow' });
    res.json({ success: true, genetics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getRecommendations,
  getCowGenetics,
};
