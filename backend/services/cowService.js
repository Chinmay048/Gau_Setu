const Cow = require('../models/Cow');
const Biometric = require('../models/Biometric');
const Vaccination = require('../models/Vaccination');

const registerCowNewborn = async (cowData) => {
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    fatherId,
    motherId,
    photoUrl,
  } = cowData;

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
  return cow;
};

const registerCowPurchased = async (cowData) => {
  const {
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    photoUrl,
  } = cowData;

  const cow = new Cow({
    rfidNumber,
    farmerId,
    gender,
    birthDate,
    registrationType: 'purchased',
    photoUrl,
  });

  await cow.save();
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

module.exports = {
  registerCowNewborn,
  registerCowPurchased,
  getCowById,
  getCowByRFID,
  getCowsByFarmer,
  updateCow,
};
