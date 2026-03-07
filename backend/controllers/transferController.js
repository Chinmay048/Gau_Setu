const transferService = require('../services/transferService');

const initiateTransfer = async (req, res) => {
  try {
    const { cowId, toFarmerId, transferDate, transferPrice } = req.body;
    const fromFarmerId = req.userId;

    const transfer = await transferService.initiateTransfer({
      cowId,
      fromFarmerId,
      toFarmerId,
      transferDate,
      transferPrice,
    });

    res.status(201).json({
      success: true,
      message: 'Transfer initiated successfully',
      transfer,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const completeTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await transferService.completeTransfer(transferId);

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      transfer,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingTransfers = async (req, res) => {
  try {
    const farmerId = req.userId;
    const transfers = await transferService.getPendingTransfers(farmerId);

    res.json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  initiateTransfer,
  completeTransfer,
  getPendingTransfers,
};
