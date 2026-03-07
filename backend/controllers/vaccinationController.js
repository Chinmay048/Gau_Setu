const vaccinationService = require('../services/vaccinationService');

const addVaccination = async (req, res) => {
  try {
    const { cowId, vaccineName, vaccineDate, nextDueDate, veterinarianName } = req.body;
    const vetId = req.userId;

    const vaccination = await vaccinationService.addVaccination({
      cowId,
      vaccineName,
      vaccineDate,
      nextDueDate,
      veterinarianName,
      vetId,
    });

    res.status(201).json({
      success: true,
      message: 'Vaccination record added',
      vaccination,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVaccinationHistory = async (req, res) => {
  try {
    const { cowId } = req.params;
    const vaccinations = await vaccinationService.getVaccinationHistory(cowId);

    res.json({
      success: true,
      count: vaccinations.length,
      vaccinations,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyVaccination = async (req, res) => {
  try {
    const { vaccinationId } = req.params;

    const vaccination = await vaccinationService.verifyVaccination(vaccinationId);

    res.json({
      success: true,
      message: 'Vaccination verified successfully',
      vaccination,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUpcomingVaccinations = async (req, res) => {
  try {
    const { cowId } = req.params;
    const vaccinations = await vaccinationService.getUpcomingVaccinations(cowId);

    res.json({
      success: true,
      count: vaccinations.length,
      vaccinations,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addVaccination,
  getVaccinationHistory,
  verifyVaccination,
  getUpcomingVaccinations,
};
