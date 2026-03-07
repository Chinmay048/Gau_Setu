const governmentService = require('../services/governmentService');

const getDashboard = (req, res) => {
  try {
    const region = req.query.region || req.userRegion || null;
    const dashboard = governmentService.getDashboardSummary(region);
    res.json({ success: true, ...dashboard });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRegionalStats = (req, res) => {
  try {
    const stats = governmentService.getRegionalStats(req.query.region || null);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBreedStatistics = (req, res) => {
  try {
    const stats = governmentService.getBreedStatistics(req.query.region || null);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationCoverage = (req, res) => {
  try {
    const coverage = governmentService.getVaccinationCoverage(req.query.region || null);
    res.json({ success: true, ...coverage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDiseaseAlerts = (req, res) => {
  try {
    const alerts = governmentService.getDiseaseAlerts(req.query.region || null);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createDiseaseAlert = (req, res) => {
  try {
    const { diseaseName, region, severity, description } = req.body;
    const alert = governmentService.createDiseaseAlert({
      diseaseName,
      region,
      severity,
      reportedBy: req.userId,
      description,
    });
    res.status(201).json({ success: true, message: 'Disease alert created', alert });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getRegionalStats,
  getBreedStatistics,
  getVaccinationCoverage,
  getDiseaseAlerts,
  createDiseaseAlert,
};
