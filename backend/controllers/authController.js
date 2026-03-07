const authService = require('../services/authService');

// ─── Farmer ──────────────────────────────────────────────

const registerFarmer = async (req, res) => {
  try {
    const { email, password, farmName, phoneNumber, location } = req.body;
    const farmer = await authService.registerFarmer(email, password, farmName, phoneNumber, location);
    const token = authService.generateToken(farmer, 'farmer');

    res.status(201).json({
      success: true,
      message: 'Farmer registration successful',
      token,
      user: { id: farmer.id, email: farmer.email, farmName: farmer.farmName, role: 'farmer' },
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
      user: { id: farmer.id, email: farmer.email, farmName: farmer.farmName, role: 'farmer' },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── OTP ─────────────────────────────────────────────────

const sendOTP = (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    const result = authService.sendOTP(phoneNumber);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOTPLogin = async (req, res) => {
  try {
    const { phoneNumber, otp, location } = req.body;
    if (!phoneNumber || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

    const farmer = await authService.loginFarmerOTP(phoneNumber, otp, location);
    const token = authService.generateToken(farmer, 'farmer');

    res.json({
      success: true,
      message: 'OTP verified',
      token,
      user: { id: farmer.id, email: farmer.email, farmName: farmer.farmName, phoneNumber: farmer.phoneNumber, role: 'farmer' },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Veterinarian ────────────────────────────────────────

const registerVet = async (req, res) => {
  try {
    const { email, password, name, clinicName, licenseNumber, phoneNumber, address } = req.body;
    const vet = await authService.registerVet(email, password, name, clinicName, licenseNumber, phoneNumber, address);
    const token = authService.generateToken(vet, 'vet');

    res.status(201).json({
      success: true,
      message: 'Vet registration successful',
      token,
      user: { id: vet.id, email: vet.email, name: vet.name, clinicName: vet.clinicName, role: 'vet' },
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
      user: { id: vet.id, email: vet.email, name: vet.name, clinicName: vet.clinicName, role: 'vet' },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Government ──────────────────────────────────────────

const registerGovernment = async (req, res) => {
  try {
    const { email, password, name, department, region, accessLevel } = req.body;
    const gov = await authService.registerGovernment(email, password, name, department, region, accessLevel);
    const token = authService.generateToken(gov, 'government');

    res.status(201).json({
      success: true,
      message: 'Government user registered',
      token,
      user: { id: gov.id, email: gov.email, name: gov.name, region: gov.region, role: 'government' },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginGovernment = async (req, res) => {
  try {
    const { email, password } = req.body;
    const gov = await authService.loginGovernment(email, password);
    const token = authService.generateToken(gov, 'government');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: gov.id, email: gov.email, name: gov.name, region: gov.region, accessLevel: gov.accessLevel, role: 'government' },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── Profile ─────────────────────────────────────────────

const getProfile = (req, res) => {
  try {
    const profile = authService.getProfile(req.userId, req.userRole);
    res.json({ success: true, user: profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerFarmer,
  loginFarmer,
  sendOTP,
  verifyOTPLogin,
  registerVet,
  loginVet,
  registerGovernment,
  loginGovernment,
  getProfile,
};
