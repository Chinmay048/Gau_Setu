const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'livestock.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const initDatabase = () => {
  console.log('🗄️  Initializing SQLite database...');

  // Create tables
  db.exec(`
    -- Farmers table
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      farm_name TEXT NOT NULL,
      phone_number TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cows table
    CREATE TABLE IF NOT EXISTS cows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rfid_number TEXT UNIQUE NOT NULL,
      farmer_id INTEGER NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
      birth_date TEXT NOT NULL,
      breed TEXT,
      father_id INTEGER,
      mother_id INTEGER,
      biometric_id INTEGER,
      registration_type TEXT CHECK(registration_type IN ('newborn', 'purchased')),
      photo_url TEXT,
      dna_report_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (father_id) REFERENCES cows(id),
      FOREIGN KEY (mother_id) REFERENCES cows(id)
    );

    -- Biometrics table
    CREATE TABLE IF NOT EXISTS biometrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER UNIQUE NOT NULL,
      noseprint_id TEXT UNIQUE NOT NULL,
      sample_count INTEGER DEFAULT 0,
      biometric_score INTEGER DEFAULT 100,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );

    -- Vaccinations table
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL,
      administered_date TEXT NOT NULL,
      next_due_date TEXT,
      certificate_url TEXT,
      administered_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );

    -- Health Records table
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      condition_type TEXT NOT NULL,
      condition_name TEXT NOT NULL,
      diagnosed_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'treated', 'chronic', 'recovered')),
      severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );

    -- Mating Compatibility (hardcoded scores)
    CREATE TABLE IF NOT EXISTS mating_compatibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      bull_id INTEGER NOT NULL,
      compatibility_score INTEGER NOT NULL,
      genetic_diversity_score INTEGER,
      health_compatibility_score INTEGER,
      breed_match BOOLEAN DEFAULT 1,
      common_ancestor_generations INTEGER,
      recommendation_rank INTEGER,
      notes TEXT,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (bull_id) REFERENCES cows(id)
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_cows_farmer ON cows(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_cows_rfid ON cows(rfid_number);
    CREATE INDEX IF NOT EXISTS idx_vaccinations_cow ON vaccinations(cow_id);
    CREATE INDEX IF NOT EXISTS idx_health_cow ON health_records(cow_id);
    CREATE INDEX IF NOT EXISTS idx_mating_cow ON mating_compatibility(cow_id);
  `);

  console.log('✅ Database schema created');
};

const seedDemoData = () => {
  console.log('🌱 Seeding demo data...');

  // Hash password for demo accounts
  const demoPassword = bcrypt.hashSync('demo123', 10);

  // Insert demo farmers
  const insertFarmer = db.prepare(`
    INSERT OR IGNORE INTO farmers (email, password, farm_name, phone_number, location)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertFarmer.run('demo@farmer.com', demoPassword, 'Green Valley Farm', '+91-9876543210', 'Maharashtra, India');
  insertFarmer.run('raj@farm.com', demoPassword, 'Sunrise Dairy Farm', '+91-9876543211', 'Punjab, India');
  insertFarmer.run('priya@farm.com', demoPassword, 'Heritage Cattle Farm', '+91-9876543212', 'Gujarat, India');

  const farmers = db.prepare('SELECT * FROM farmers').all();
  const farmer1 = farmers[0];
  const farmer2 = farmers[1];
  const farmer3 = farmers[2];

  // Insert cows with 3-generation family trees
  const insertCow = db.prepare(`
    INSERT OR IGNORE INTO cows (rfid_number, farmer_id, gender, birth_date, breed, father_id, mother_id, registration_type, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // FARMER 1 - Green Valley Farm (3 generations)
  // Generation 1: Grandparents
  insertCow.run('BULL-GV-G1-001', farmer1.id, 'male', '2020-01-15', 'Gir', null, null, 'purchased', '');
  insertCow.run('COW-GV-G1-001', farmer1.id, 'female', '2020-02-20', 'Gir', null, null, 'purchased', '');
  
  const grandpa1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('BULL-GV-G1-001');
  const grandma1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('COW-GV-G1-001');

  // Generation 2: Parents
  insertCow.run('BULL-GV-G2-001', farmer1.id, 'male', '2022-05-10', 'Gir', grandpa1.id, grandma1.id, 'newborn', '');
  insertCow.run('COW-GV-G2-001', farmer1.id, 'female', '2022-06-15', 'Gir', grandpa1.id, grandma1.id, 'newborn', '');

  const father1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('BULL-GV-G2-001');
  const mother1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('COW-GV-G2-001');

  // Generation 3: Current herd
  insertCow.run('CALF-GV-2024-001', farmer1.id, 'female', '2024-01-10', 'Gir', father1.id, mother1.id, 'newborn', '');
  insertCow.run('CALF-GV-2024-002', farmer1.id, 'male', '2024-03-15', 'Gir', father1.id, mother1.id, 'newborn', '');
  insertCow.run('CALF-GV-2025-001', farmer1.id, 'female', '2025-11-20', 'Gir', father1.id, mother1.id, 'newborn', '');

  // FARMER 2 - Sunrise Dairy (healthy bulls for mating)
  insertCow.run('BULL-SD-ELITE-001', farmer2.id, 'male', '2021-03-10', 'Gir', null, null, 'purchased', '');
  insertCow.run('BULL-SD-ELITE-002', farmer2.id, 'male', '2021-05-20', 'Sahiwal', null, null, 'purchased', '');
  insertCow.run('COW-SD-2023-001', farmer2.id, 'female', '2023-07-15', 'Gir', null, null, 'purchased', '');

  // FARMER 3 - Heritage Cattle (diverse breeds)
  insertCow.run('BULL-HC-RED-001', farmer3.id, 'male', '2020-12-05', 'Red Sindhi', null, null, 'purchased', '');
  insertCow.run('COW-HC-GIR-001', farmer3.id, 'female', '2021-08-10', 'Gir', null, null, 'purchased', '');
  insertCow.run('COW-HC-SH-001', farmer3.id, 'female', '2022-04-25', 'Sahiwal', null, null, 'purchased', '');

  console.log('✅ Cows inserted');

  // Add health records (some cows have conditions)
  const insertHealth = db.prepare(`
    INSERT INTO health_records (cow_id, condition_type, condition_name, diagnosed_date, status, severity, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const sickCow1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('COW-GV-G1-001');
  const sickBull1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('BULL-SD-ELITE-002');

  insertHealth.run(sickCow1.id, 'disease', 'Mastitis', '2025-06-10', 'treated', 'moderate', 'Treated with antibiotics, fully recovered');
  insertHealth.run(sickCow1.id, 'genetic', 'Hip Dysplasia Risk', '2024-03-15', 'chronic', 'mild', 'Genetic condition, manageable');
  insertHealth.run(sickBull1.id, 'disease', 'Foot Rot', '2025-11-20', 'active', 'moderate', 'Currently under treatment');

  console.log('✅ Health records inserted');

  // Add vaccinations with upcoming reminders
  const insertVaccination = db.prepare(`
    INSERT INTO vaccinations (cow_id, vaccine_name, administered_date, next_due_date, certificate_url, administered_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const allCows = db.prepare('SELECT id FROM cows').all();
  allCows.slice(0, 8).forEach(cow => {
    insertVaccination.run(cow.id, 'FMD (Foot and Mouth Disease)', '2025-09-15', '2026-03-15', '', 'Dr. Mehta');
    insertVaccination.run(cow.id, 'Brucellosis', '2025-08-10', '2026-08-10', '', 'Dr. Kumar');
  });

  // Add urgent vaccination reminders (overdue)
  const urgentCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('CALF-GV-2025-001');
  insertVaccination.run(urgentCow.id, 'Hemorrhagic Septicemia', '2025-07-20', '2026-01-20', '', 'Dr. Sharma');

  console.log('✅ Vaccinations inserted');

  // Add hardcoded mating compatibility scores
  const insertCompatibility = db.prepare(`
    INSERT INTO mating_compatibility 
    (cow_id, bull_id, compatibility_score, genetic_diversity_score, health_compatibility_score, breed_match, common_ancestor_generations, recommendation_rank, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Get mature cows and bulls for mating
  const matureCows = db.prepare(`
    SELECT id, rfid_number, breed, father_id, mother_id 
    FROM cows 
    WHERE gender = 'female' AND birth_date < '2024-01-01'
  `).all();

  const matureBulls = db.prepare(`
    SELECT id, rfid_number, breed, father_id, mother_id 
    FROM cows 
    WHERE gender = 'male' AND birth_date < '2024-01-01'
  `).all();

  // Create compatibility matrix
  matureCows.forEach(cow => {
    let rank = 1;
    matureBulls.forEach(bull => {
      // Check if related (simplified - real check would trace full ancestry)
      const isRelated = (cow.father_id === bull.id || cow.mother_id === bull.id || 
                         cow.father_id === bull.father_id || cow.mother_id === bull.mother_id);
      
      const breedMatch = cow.breed === bull.breed;
      const geneticScore = isRelated ? 40 : 95;
      const healthScore = 85; // Would check health records in real scenario
      const totalScore = breedMatch ? (geneticScore + healthScore) / 2 : (geneticScore + healthScore) / 2 - 20;

      if (!isRelated && rank <= 3) {
        insertCompatibility.run(
          cow.id,
          bull.id,
          Math.round(totalScore),
          geneticScore,
          healthScore,
          breedMatch ? 1 : 0,
          isRelated ? 2 : null,
          rank,
          breedMatch ? 'Excellent match - same breed, no common ancestors' : 'Good match but different breeds'
        );
        rank++;
      }
    });
  });

  console.log('✅ Mating compatibility scores inserted');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database initialization complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 Demo Accounts:');
  console.log('   Email: demo@farmer.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('   Email: raj@farm.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('   Email: priya@farm.com');
  console.log('   Password: demo123');
  console.log('');
};

// Run initialization
try {
  initDatabase();
  seedDemoData();
} catch (error) {
  console.error('❌ Database initialization error:', error);
  process.exit(1);
}

module.exports = db;
