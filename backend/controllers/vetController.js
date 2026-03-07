const reportService = require('../services/reportService');
const cowService = require('../services/cowService');
const Cow = require('../models/Cow');

const searchCow = async (req, res) => {
  try {
    const { cowId } = req.params;

    const cow = await Cow.findOne({
      $or: [
        { _id: cowId },
        { rfidNumber: cowId },
      ],
    })
      .populate('farmerId', 'farmName phoneNumber')
      .populate('fatherId motherId', 'rfidNumber')
      .populate('biometricId');

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

const createHealthReport = async (req, res) => {
  try {
    const {
      cowId,
      reportType,
      diagnosis,
      treatment,
      symptoms,
      severity,
      temperature,
      heartRate,
      respirationRate,
      weight,
    } = req.body;

    const vetId = req.userId;
    const clinicName = req.userClinic || 'Clinic';

    const report = await reportService.createHealthReport({
      cowId,
      vetId,
      clinicName,
      reportType,
      diagnosis,
      treatment,
      symptoms,
      severity,
    });

    // Update with examination details
    report.temperature = temperature;
    report.heartRate = heartRate;
    report.respirationRate = respirationRate;
    report.weight = weight;
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Health report created',
      report,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submitHealthReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reportPdf } = req.body;

    const report = await reportService.submitHealthReport(reportId, reportPdf);

    res.json({
      success: true,
      message: 'Health report submitted successfully',
      report,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHealthReports = async (req, res) => {
  try {
    const { cowId } = req.params;
    const reports = await reportService.getHealthReports(cowId);

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVetReports = async (req, res) => {
  try {
    const vetId = req.userId;
    const reports = await reportService.getVetReports(vetId);

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  searchCow,
  createHealthReport,
  submitHealthReport,
  getHealthReports,
  getVetReports,
};
