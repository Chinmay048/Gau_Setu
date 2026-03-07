const mongoose = require('mongoose');
const Cow = require('../models/Cow');
const Farmer = require('../models/Farmer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedDemoData = async () => {
  try {
    console.log('🌱 Starting demo data seed...');
    
    // Debug: Check if environment variable is loaded
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      console.log('Looking for .env at:', path.join(__dirname, '../.env'));
      process.exit(1);
    }
    
    console.log('✓ MONGODB_URI loaded');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Find the demo farmer
    const farmer = await Farmer.findOne({ email: 'demo@farmer.com' });
    if (!farmer) {
      console.error('❌ Demo farmer not found! Please create demo@farmer.com account first.');
      process.exit(1);
    }
    console.log(`✓ Found demo farmer: ${farmer.farmName}`);

    // Clear existing cow data for demo farmer only
    await Cow.deleteMany({ farmerId: farmer._id });
    console.log('✓ Cleared existing demo cows');

    const farmerId = farmer._id;

    // ===========================================
    // GENERATION 1: Grandparents (without biometric)
    // ===========================================
    console.log('\n📊 Creating Generation 1: Grandparents...');

    const grandpa1 = await Cow.create({
      rfidNumber: 'BULL-G1-001',
      farmerId,
      gender: 'male',
      birthDate: new Date('2020-01-15'),
      registrationType: 'purchased',
      photoUrl: '',
    });

    const grandma1 = await Cow.create({
      rfidNumber: 'COW-G1-001',
      farmerId,
      gender: 'female',
      birthDate: new Date('2020-02-20'),
      registrationType: 'purchased',
      photoUrl: '',
    });

    const grandpa2 = await Cow.create({
      rfidNumber: 'BULL-G1-002',
      farmerId,
      gender: 'male',
      birthDate: new Date('2020-03-10'),
      registrationType: 'purchased',
      photoUrl: '',
    });

    const grandma2 = await Cow.create({
      rfidNumber: 'COW-G1-002',
      farmerId,
      gender: 'female',
      birthDate: new Date('2020-04-05'),
      registrationType: 'purchased',
      photoUrl: '',
    });

    console.log(`✓ Created 4 grandparents (no biometrics)`);

    // ===========================================
    // GENERATION 2: Parents (without biometric)
    // ===========================================
    console.log('\n📊 Creating Generation 2: Parents...');

    const father1 = await Cow.create({
      rfidNumber: 'BULL-G2-001',
      farmerId,
      gender: 'male',
      birthDate: new Date('2022-05-10'),
      fatherId: grandpa1._id,
      motherId: grandma1._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const mother1 = await Cow.create({
      rfidNumber: 'COW-G2-001',
      farmerId,
      gender: 'female',
      birthDate: new Date('2022-06-15'),
      fatherId: grandpa2._id,
      motherId: grandma2._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const father2 = await Cow.create({
      rfidNumber: 'BULL-G2-002',
      farmerId,
      gender: 'male',
      birthDate: new Date('2022-08-20'),
      fatherId: grandpa1._id,
      motherId: grandma2._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const mother2 = await Cow.create({
      rfidNumber: 'COW-G2-002',
      farmerId,
      gender: 'female',
      birthDate: new Date('2022-09-25'),
      fatherId: grandpa2._id,
      motherId: grandma1._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    console.log(`✓ Created 4 parents with family tree links (no biometrics)`);

    // ===========================================
    // GENERATION 3: Current Generation (without biometric - ready for user to add)
    // ===========================================
    console.log('\n📊 Creating Generation 3: Current Herd...');

    const calf1 = await Cow.create({
      rfidNumber: 'CALF-2024-001',
      farmerId,
      gender: 'female',
      birthDate: new Date('2024-01-10'),
      fatherId: father1._id,
      motherId: mother1._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const calf2 = await Cow.create({
      rfidNumber: 'CALF-2024-002',
      farmerId,
      gender: 'male',
      birthDate: new Date('2024-02-14'),
      fatherId: father1._id,
      motherId: mother2._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const calf3 = await Cow.create({
      rfidNumber: 'CALF-2024-003',
      farmerId,
      gender: 'female',
      birthDate: new Date('2024-03-20'),
      fatherId: father2._id,
      motherId: mother1._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const calf4 = await Cow.create({
      rfidNumber: 'CALF-2025-001',
      farmerId,
      gender: 'female',
      birthDate: new Date('2025-01-05'),
      fatherId: father2._id,
      motherId: mother2._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    const calf5 = await Cow.create({
      rfidNumber: 'CALF-2025-002',
      farmerId,
      gender: 'male',
      birthDate: new Date('2025-05-15'),
      fatherId: father1._id,
      motherId: mother1._id,
      registrationType: 'newborn',
      photoUrl: '',
    });

    // Create one recently purchased cow (no family)
    const purchased1 = await Cow.create({
      rfidNumber: 'PURC-2026-001',
      farmerId,
      gender: 'female',
      birthDate: new Date('2024-06-10'),
      registrationType: 'purchased',
      photoUrl: '',
    });

    console.log(`✓ Created 6 current generation cows (ready for biometric data)`);

    // ===========================================
    // Summary
    // ===========================================
    console.log('\n✅ Demo Data Seed Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Cows Created: 14`);
    console.log(`   Generation 1 (Grandparents): 4 cows`);
    console.log(`   Generation 2 (Parents): 4 cows`);
    console.log(`   Generation 3 (Current): 5 calves + 1 purchased`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Login to http://localhost:5173 with demo@farmer.com');
    console.log('   2. View your herd - all cows ready for biometric data!');
    console.log('   3. Click "Add Biometric" on any cow to upload nose images');
    console.log('   4. Family tree relationships already established ✓');
    console.log('');
    console.log('💡 TIP: Start with current generation calves (2024-2026)');
    console.log('    They already have parents and grandparents linked!');
    console.log('');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;
