const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Vet = require('../models/Vet');

const generateToken = (user, type) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      type: type,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const registerFarmer = async (email, password, farmName, phoneNumber, location) => {
  const farmer = new Farmer({
    email,
    password,
    farmName,
    phoneNumber,
    location,
    role: 'farmer',
  });

  await farmer.save();
  return farmer;
};

const loginFarmer = async (email, password) => {
  const farmer = await Farmer.findOne({ email }).select('+password');

  if (!farmer) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await farmer.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return farmer;
};

const registerVet = async (email, password, name, clinicName, licenseNumber, phoneNumber, address) => {
  const vet = new Vet({
    email,
    password,
    name,
    clinicName,
    licenseNumber,
    phoneNumber,
    address,
    role: 'vet',
    status: 'pending',
  });

  await vet.save();
  return vet;
};

const loginVet = async (email, password) => {
  const vet = await Vet.findOne({ email }).select('+password');

  if (!vet) {
    throw new Error('Invalid credentials');
  }

  if (vet.status === 'pending') {
    throw new Error('Account pending admin approval');
  }

  if (vet.status === 'rejected') {
    throw new Error('Account has been rejected');
  }

  const isPasswordValid = await vet.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return vet;
};

module.exports = {
  generateToken,
  registerFarmer,
  loginFarmer,
  registerVet,
  loginVet,
};
