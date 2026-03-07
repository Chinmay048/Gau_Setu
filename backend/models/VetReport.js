const mongoose = require('mongoose');

const VetReportSchema = new mongoose.Schema(
  {
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: [true, 'Cow ID is required'],
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vet',
      required: [true, 'Vet ID is required'],
    },
    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
    },
    checkupDate: {
      type: Date,
      required: [true, 'Checkup date is required'],
    },
    reportType: {
      type: String,
      enum: ['health_checkup', 'disease_diagnosis', 'post_treatment'],
      required: [true, 'Report type is required'],
    },
    // Examination Details
    temperature: Number,
    heartRate: Number,
    respirationRate: Number,
    weight: Number,
    symptoms: [String],
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    diseaseType: String,
    treatment: {
      type: String,
      required: [true, 'Treatment plan is required'],
    },
    prescription: [
      {
        medicineName: String,
        dosage: String,
        duration: String,
        frequency: String,
      },
    ],
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    // Media & Files
    reportPdf: String,
    attachments: [
      {
        url: String,
        type: String,
        uploadedAt: Date,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['draft', 'completed', 'verified'],
      default: 'draft',
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

module.exports = mongoose.model('VetReport', VetReportSchema);
