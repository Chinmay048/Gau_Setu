const Vaccination = require('../models/Vaccination');
const Cow = require('../models/Cow');

const addVaccination = async (vaccinationData) => {
  const { cowId, vaccineName, vaccineDate, nextDueDate, veterinarianName, vetId } = vaccinationData;

  const vaccination = new Vaccination({
    cowId,
    vaccineName,
    vaccineDate,
    nextDueDate,
    veterinarianName,
    vetId,
    status: 'pending',
  });

  await vaccination.save();

  // Update cow's last vaccination date
  await Cow.findByIdAndUpdate(cowId, { lastVaccinationDate: vaccineDate });

  return vaccination;
};

const getVaccinationHistory = async (cowId) => {
  return await Vaccination.find({ cowId })
    .populate('vetId', 'name clinicName')
    .sort({ vaccineDate: -1 });
};

const verifyVaccination = async (vaccinationId, verifiedAt = new Date()) => {
  return await Vaccination.findByIdAndUpdate(
    vaccinationId,
    {
      status: 'verified',
      verificationStatus: 'verified',
      verifiedAt,
    },
    { new: true }
  );
};

const getUpcomingVaccinations = async (cowId) => {
  const today = new Date();
  return await Vaccination.find({
    cowId,
    nextDueDate: { $gte: today },
    status: 'verified',
  }).sort({ nextDueDate: 1 });
};

module.exports = {
  addVaccination,
  getVaccinationHistory,
  verifyVaccination,
  getUpcomingVaccinations,
};
