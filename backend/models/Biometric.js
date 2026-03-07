const mongoose = require('mongoose');

const BiometricSchema = new mongoose.Schema(
  {
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: [true, 'Cow ID is required'],
      unique: true,
    },
    noseprintId: {
      type: String,
      required: [true, 'Noseprint ID from ML model is required'],
      unique: true,
    },
    noseTemplate: {
      type: String,
      required: [true, 'Nose biometric template is required'],
    },
    noseSamples: [{
      imageUrl: String,
      capturedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    sampleCount: {
      type: Number,
      default: 0,
    },
    biometricScore: {
      type: Number,
      default: 0,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    successfulVerifications: {
      type: Number,
      default: 0,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    lastVerifiedAt: Date,
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

module.exports = mongoose.model('Biometric', BiometricSchema);
