const milkService = require('../services/milkService');

const logProduction = (req, res) => {
  try {
    const { cowId, quantityLiters, fatPercentage, session, notes } = req.body;
    const record = milkService.logMilkProduction({
      cowId,
      farmerId: req.userId,
      quantityLiters,
      fatPercentage,
      session,
      notes,
    });
    res.status(201).json({ success: true, message: 'Milk production logged', ...record });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRecords = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = milkService.getMilkRecordsByFarmer(req.userId, startDate, endDate);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStats = (req, res) => {
  try {
    const stats = milkService.getMilkStats(req.userId);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyBatch = (req, res) => {
  try {
    const batch = milkService.getMilkBatchByCode(req.params.batchCode);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ success: true, batch });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  logProduction,
  getRecords,
  getStats,
  verifyBatch,
};
