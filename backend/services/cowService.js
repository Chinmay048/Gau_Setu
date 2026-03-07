const Cow = require('../models/Cow');
const Biometric = require('../models/Biometric');
const Vaccination = require('../models/Vaccination');
const { registerNoseprint } = require('./noseprintService');

const registerCowNewborn = async (cowData) => {
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    fatherId,
    motherId,
    photoUrl,
    noseImages, // Array of base64 nose images (optional - can add later)
  } = cowData;

  let noseprintResult = null;
  let biometricId = null;

  // Biometric registration is OPTIONAL now
  if (noseImages && noseImages.length >= 3) {
    try {
      // Register noseprint with ML model
      noseprintResult = await registerNoseprint(rfidNumber, noseImages);
      
      if (!noseprintResult.success) {
        console.warn('Failed to register noseprint, continuing without biometrics');
      }
    } catch (error) {
      console.warn('Noseprint registration error:', error.message);
      // Continue without biometrics - can add later
    }
  }

  // Handle father and mother - lookup by RFID if provided
  let fatherObjectId = null;
  let motherObjectId = null;

  if (fatherId && fatherId.trim() !== '') {
    const fatherCow = await Cow.findOne({ rfidNumber: fatherId });
    if (fatherCow) {
      fatherObjectId = fatherCow._id;
    }
  }

  if (motherId && motherId.trim() !== '') {
    const motherCow = await Cow.findOne({ rfidNumber: motherId });
    if (motherCow) {
      motherObjectId = motherCow._id;
    }
  }

  const cow = new Cow({
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    fatherId: fatherObjectId,
    motherId: motherObjectId,
    registrationType: 'newborn',
    photoUrl,
  });

  await cow.save();

  // Create biometric record ONLY if nose images were provided
  if (noseprintResult && noseprintResult.success) {
    const biometric = new Biometric({
      cowId: cow._id,
      noseprintId: noseprintResult.noseprintId,
      noseTemplate: noseprintResult.noseprintId, // Using noseprintId as template reference
      noseSamples: noseImages.map(img => ({
        imageUrl: img.substring(0, 100) + '...', // Store truncated for reference
        capturedAt: new Date(),
      })),
      sampleCount: noseImages.length,
      biometricScore: 100, // Initial score
    });

    await biometric.save();

    // Link biometric to cow
    cow.biometricId = biometric._id;
    await cow.save();
  }

  return cow;
};

const registerCowPurchased = async (cowData) => {
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    photoUrl,
    noseImages, // Array of base64 nose images (optional - can add later)
  } = cowData;

  let noseprintResult = null;

  // Biometric registration is OPTIONAL now
  if (noseImages && noseImages.length >= 3) {
    try {
      // Register noseprint with ML model
      noseprintResult = await registerNoseprint(rfidNumber, noseImages);
      
      if (!noseprintResult.success) {
        console.warn('Failed to register noseprint, continuing without biometrics');
      }
    } catch (error) {
      console.warn('Noseprint registration error:', error.message);
      // Continue without biometrics - can add later
    }
  }

  const cow = new Cow({
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    registrationType: 'purchased',
    photoUrl,
  });

  await cow.save();

  // Create biometric record ONLY if nose images were provided
  if (noseprintResult && noseprintResult.success) {
    const biometric = new Biometric({
      cowId: cow._id,
      noseprintId: noseprintResult.noseprintId,
      noseTemplate: noseprintResult.noseprintId,
      noseSamples: noseImages.map(img => ({
        imageUrl: img.substring(0, 100) + '...',
        capturedAt: new Date(),
      })),
      sampleCount: noseImages.length,
      biometricScore: 100,
    });

    await biometric.save();

    // Link biometric to cow
    cow.biometricId = biometric._id;
    await cow.save();
  }

  return cow;
};

const getCowById = async (cowId) => {
  return await Cow.findById(cowId)
    .populate('farmerId', 'farmName phoneNumber location')
    .populate('fatherId motherId', 'rfidNumber gender')
    .populate('biometricId');
};

const getCowByRFID = async (rfidNumber) => {
  return await Cow.findOne({ rfidNumber })
    .populate('farmerId', 'farmName phoneNumber location')
    .populate('fatherId motherId', 'rfidNumber gender')
    .populate('biometricId');
};

const getCowsByFarmer = async (farmerId) => {
  return await Cow.find({ farmerId })
    .populate('fatherId motherId', 'rfidNumber')
    .sort({ createdAt: -1 });
};

const updateCow = async (cowId, updateData) => {
  return await Cow.findByIdAndUpdate(cowId, updateData, { new: true });
};

const addBiometricData = async (cowId, noseImages) => {
  // Find the cow
  const cow = await Cow.findById(cowId);
  if (!cow) {
    throw new Error('Cow not found');
  }

  // Check if biometric already exists
  if (cow.biometricId) {
    throw new Error('Biometric data already exists for this cow');
  }

  // Validate nose images
  if (!noseImages || noseImages.length < 3) {
    throw new Error('At least 3 nose images are required for biometric registration');
  }

  // Register noseprint with ML model
  const noseprintResult = await registerNoseprint(cow.rfidNumber, noseImages);
  
  if (!noseprintResult.success) {
    throw new Error('Failed to register noseprint with ML model');
  }

  // Create biometric record
  const biometric = new Biometric({
    cowId: cow._id,
    noseprintId: noseprintResult.noseprintId,
    noseTemplate: noseprintResult.noseprintId,
    noseSamples: noseImages.map(img => ({
      imageUrl: img.substring(0, 100) + '...',
      capturedAt: new Date(),
    })),
    sampleCount: noseImages.length,
    biometricScore: 100,
  });

  await biometric.save();

  // Link biometric to cow
  cow.biometricId = biometric._id;
  await cow.save();

  return cow;
};

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowById,
  getCowByRFID,
  getCowsByFarmer,
  updateCow,
  addBiometricData,
};
