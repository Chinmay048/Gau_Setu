const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Farmer routes
router.post('/farmer/register', authController.registerFarmer);
router.post('/farmer/login', authController.loginFarmer);

// Vet routes
router.post('/vet/register', authController.registerVet);
router.post('/vet/login', authController.loginVet);

module.exports = router;
