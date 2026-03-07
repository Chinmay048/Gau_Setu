const VetReport = require('../models/VetReport');
const Cow = require('../models/Cow');

const createHealthReport = async (reportData) => {
  const {
    cowId,
    vetId,
    clinicName,
    reportType,
    diagnosis,
    treatment,
    symptoms,
    severity,
  } = reportData;

  const report = new VetReport({
    cowId,
    vetId,
    clinicName,
    checkupDate: new Date(),
    reportType,
    diagnosis,
    treatment,
    symptoms,
    severity,
    status: 'draft',
  });

  await report.save();
  return report;
};

const submitHealthReport = async (reportId, reportPdf = null) => {
  return await VetReport.findByIdAndUpdate(
    reportId,
    {
      status: 'completed',
      reportPdf,
    },
    { new: true }
  );
};

const getHealthReports = async (cowId) => {
  return await VetReport.find({ cowId })
    .populate('vetId', 'name clinicName')
    .sort({ checkupDate: -1 });
};

const getVetReports = async (vetId) => {
  return await VetReport.find({ vetId })
    .populate('cowId', 'rfidNumber gender')
    .sort({ createdAt: -1 });
};

const updateHealthReport = async (reportId, updateData) => {
  return await VetReport.findByIdAndUpdate(reportId, updateData, { new: true });
};

module.exports = {
  createHealthReport,
  submitHealthReport,
  getHealthReports,
  getVetReports,
  updateHealthReport,
};
