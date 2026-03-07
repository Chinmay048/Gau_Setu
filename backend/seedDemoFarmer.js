require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Farmer = require('./models/Farmer');

const createDemoFarmer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if demo farmer already exists
    const existingFarmer = await Farmer.findOne({ email: 'demo@farmer.com' });
    
    if (existingFarmer) {
      console.log('✓ Demo farmer already exists!');
      console.log('Email: demo@farmer.com');
      console.log('Password: demo123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Create demo farmer
    const demoFarmer = new Farmer({
      email: 'demo@farmer.com',
      password: hashedPassword,
      farmName: 'Demo Farm',
      phoneNumber: '+1234567890',
      location: 'Demo Location, USA',
      role: 'farmer',
    });

    await demoFarmer.save();

    console.log('✓ Demo farmer created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: demo@farmer.com');
    console.log('🔑 Password: demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

createDemoFarmer();
