const mongoose = require('mongoose');

const OwnershipTransferSchema = new mongoose.Schema(
  {
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: [true, 'Cow ID is required'],
    },
    fromFarmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'From farmer ID is required'],
    },
    toFarmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'To farmer ID is required'],
    },
    transferDate: {
      type: Date,
      required: [true, 'Transfer date is required'],
    },
    transferPrice: {
      type: Number,
      default: 0,
    },
    paymentProof: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending',
    },
    verificationDetails: {
      verifiedBy: String,
      verifiedAt: Date,
      verificationNotes: String,
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OwnershipTransfer', OwnershipTransferSchema);
