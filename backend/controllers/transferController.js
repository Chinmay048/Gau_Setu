const transferService = require('../services/transferService');

const initiateTransfer = (req, res) => {
  try {
    const { cowId, targetIdentifier, notes } = req.body;
    const transfer = transferService.initiateTransfer({
      cowId,
      fromFarmerId: req.userId,
      targetIdentifier,
      notes,
    });
    res.status(201).json({ success: true, message: 'Transfer initiated', transfer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const acceptTransfer = (req, res) => {
  try {
    const transfer = transferService.acceptTransfer(req.params.transferId, req.userId);
    res.json({ success: true, message: 'Transfer accepted — ownership updated', transfer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const rejectTransfer = (req, res) => {
  try {
    const transfer = transferService.rejectTransfer(req.params.transferId, req.userId);
    res.json({ success: true, message: 'Transfer rejected', transfer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyTransfers = (req, res) => {
  try {
    const transfers = transferService.getTransfersByFarmer(req.userId);
    res.json({ success: true, count: transfers.length, transfers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingTransfers = (req, res) => {
  try {
    const transfers = transferService.getPendingTransfers(req.userId);
    res.json({ success: true, count: transfers.length, transfers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  initiateTransfer,
  acceptTransfer,
  rejectTransfer,
  getMyTransfers,
  getPendingTransfers,
};
