const authService = require('../services/authService');

const registerFarmer = async (req, res) => {
  try {
    const { email, password, farmName, phoneNumber, location } = req.body;

    const farmer = await authService.registerFarmer(
      email,
      password,
      farmName,
      phoneNumber,
      location
    );

    const token = authService.generateToken(farmer, 'farmer');

    res.status(201).json({
      success: true,
      message: 'Farmer registration successful',
      token,
      user: {
        id: farmer.id,
        email: farmer.email,
        farmName: farmer.farmName,
        role: farmer.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const farmer = await authService.loginFarmer(email, password);
    const token = authService.generateToken(farmer, 'farmer');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: farmer.id,
        email: farmer.email,
        farmName: farmer.farmName,
        role: farmer.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerVet = async (req, res) => {
  try {
    const { email, password, name, clinicName, licenseNumber, phoneNumber, address } = req.body;

    const vet = await authService.registerVet(
      email,
      password,
      name,
      clinicName,
      licenseNumber,
      phoneNumber,
      address
    );

    res.status(201).json({
      success: true,
      message: 'Vet registration submitted. Awaiting admin approval.',
      user: {
        id: vet._id,
        email: vet.email,
        name: vet.name,
        status: vet.status,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginVet = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vet = await authService.loginVet(email, password);
    const token = authService.generateToken(vet, 'vet');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: vet._id,
        email: vet.email,
        name: vet.name,
        clinicName: vet.clinicName,
        role: vet.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerFarmer,
  loginFarmer,
  registerVet,
  loginVet,
};
