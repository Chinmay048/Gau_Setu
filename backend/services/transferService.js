const OwnershipTransfer = require('../models/OwnershipTransfer');
const Cow = require('../models/Cow');

const initiateTransfer = async (transferData) => {
  const { cowId, fromFarmerId, toFarmerId, transferDate, transferPrice } = transferData;

  const transfer = new OwnershipTransfer({
    cowId,
    fromFarmerId,
    toFarmerId,
    transferDate,
    transferPrice: transferPrice || 0,
    status: 'pending',
  });

  await transfer.save();
  return transfer;
};

const completeTransfer = async (transferId) => {
  const transfer = await OwnershipTransfer.findById(transferId);

  if (!transfer) {
    throw new Error('Transfer not found');
  }

  // Update cow ownership
  await Cow.findByIdAndUpdate(transfer.cowId, { farmerId: transfer.toFarmerId });

  // Mark transfer as completed
  return await OwnershipTransfer.findByIdAndUpdate(
    transferId,
    { status: 'completed' },
    { new: true }
  );
};

const getPendingTransfers = async (farmerId) => {
  return await OwnershipTransfer.find({
    $or: [{ fromFarmerId: farmerId }, { toFarmerId: farmerId }],
    status: 'pending',
  })
    .populate('cowId', 'rfidNumber')
    .populate('fromFarmerId', 'farmName')
    .populate('toFarmerId', 'farmName');
};

module.exports = {
  initiateTransfer,
  completeTransfer,
  getPendingTransfers,
};
