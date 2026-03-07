const mongoose = require('mongoose');

const CowSchema = new mongoose.Schema(
  {
    rfidNumber: {
      type: String,
      required: [true, 'RFID number is required'],
      unique: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer ID is required'],
    },
    biometricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Biometric',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    birthDate: {
      type: Date,
      required: [true, 'Birth date is required'],
    },
    age: {
      years: Number,
      months: Number,
      days: Number,
    },
    breedDetected: {
      breed: String,
      confidence: Number,
      detectedAt: Date,
      photoUrl: String,
    },
    registrationType: {
      type: String,
      enum: ['newborn', 'purchased'],
      required: [true, 'Registration type is required'],
    },
    fatherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null,
    },
    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null,
    },
    dnaStatus: {
      type: String,
      enum: ['not_tested', 'pending', 'verified'],
      default: 'not_tested',
    },
    dnaReport: {
      reportUrl: String,
      uploadedAt: Date,
    },
    photoUrl: String,
    healthStatus: {
      type: String,
      enum: ['healthy', 'sick', 'under_treatment'],
      default: 'healthy',
    },
    lastVaccinationDate: Date,
    lastHealthCheckupDate: Date,
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

// Auto-calculate age
CowSchema.virtual('calculatedAge').get(function () {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
});

CowSchema.pre('save', function (next) {
  if (this.birthDate) {
    const calculated = this.calculatedAge;
    this.age = calculated;
  }
  next();
});

module.exports = mongoose.model('Cow', CowSchema);
