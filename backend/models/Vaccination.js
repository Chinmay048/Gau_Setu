const mongoose = require('mongoose');

const VaccinationSchema = new mongoose.Schema(
  {
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: [true, 'Cow ID is required'],
    },
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
    },
    vaccineDate: {
      type: Date,
      required: [true, 'Vaccine date is required'],
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next due date is required'],
    },
    veterinarianName: String,
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vet',
    },
    reportUrl: String,
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VetReport',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired'],
      default: 'pending',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
    },
    verifiedAt: Date,
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

module.exports = mongoose.model('Vaccination', VaccinationSchema);
