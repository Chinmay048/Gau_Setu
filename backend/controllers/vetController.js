const reportService = require('../services/reportService');
const vaccinationService = require('../services/vaccinationService');

// ─── Health Reports ──────────────────────────────────────

const createHealthReport = (req, res) => {
  try {
    const { cowId, reportType, findings, recommendation, certificateUrl } = req.body;
    const report = reportService.createHealthReport({
      cowId,
      vetId: req.userId,
      reportType,
      findings,
      recommendation,
      certificateUrl,
    });
    res.status(201).json({ success: true, message: 'Report created (draft)', report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submitReport = (req, res) => {
  try {
    const report = reportService.submitHealthReport(req.params.reportId, req.userId);
    res.json({ success: true, message: 'Report submitted', report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getReportsByCow = (req, res) => {
  try {
    const reports = reportService.getReportsByCow(req.params.cowId);
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyReports = (req, res) => {
  try {
    const reports = reportService.getReportsByVet(req.userId);
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── DNA Verification ────────────────────────────────────

const uploadDNAVerification = (req, res) => {
  try {
    const { cowId, geneticProfile } = req.body;
    const result = reportService.uploadDNAVerification(cowId, req.userId, geneticProfile);
    res.json({ success: true, message: 'DNA verification uploaded', ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Vaccination Verify ──────────────────────────────────

const verifyVaccination = (req, res) => {
  try {
    const result = reportService.verifyVaccination(req.params.vaccinationId, req.userId);
    res.json({ success: true, message: 'Vaccination verified', ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createHealthReport,
  submitReport,
  getReportsByCow,
  getMyReports,
  uploadDNAVerification,
  verifyVaccination,
};
