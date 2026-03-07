const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Farmer routes
router.post('/farmer/register', authController.registerFarmer);
router.post('/farmer/login', authController.loginFarmer);

// OTP login
router.post('/otp/send', authController.sendOTP);
router.post('/otp/verify', authController.verifyOTPLogin);

// Vet routes
router.post('/vet/register', authController.registerVet);
router.post('/vet/login', authController.loginVet);

// Government routes
router.post('/government/register', authController.registerGovernment);
router.post('/government/login', authController.loginGovernment);

// Profile (any authenticated user)
router.get('/profile', auth, authController.getProfile);

module.exports = router;
