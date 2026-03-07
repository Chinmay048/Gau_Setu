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
      reputation_score REAL DEFAULT 50.0,
      total_verified_cattle INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Veterinarians table
    CREATE TABLE IF NOT EXISTS vets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      clinic_name TEXT,
      license_number TEXT UNIQUE NOT NULL,
      phone_number TEXT,
      address TEXT,
      region TEXT,
      status TEXT DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Government users table
    CREATE TABLE IF NOT EXISTS government_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      region TEXT NOT NULL,
      access_level TEXT DEFAULT 'district' CHECK(access_level IN ('district', 'state', 'national')),
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
      dna_status TEXT DEFAULT 'pending' CHECK(dna_status IN ('pending', 'uploaded', 'verified')),
      rfid_status TEXT DEFAULT 'active' CHECK(rfid_status IN ('active', 'lost', 'replaced')),
      is_verified INTEGER DEFAULT 0,
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
      noseprint_hash TEXT,
      sample_count INTEGER DEFAULT 0,
      biometric_score INTEGER DEFAULT 100,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );

    -- RFID History table
    CREATE TABLE IF NOT EXISTS rfid_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      rfid_number TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'lost', 'replaced')),
      assigned_date TEXT NOT NULL,
      removed_date TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      vet_id INTEGER,
      verified INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
      FOREIGN KEY (vet_id) REFERENCES vets(id)
    );

    -- Vaccine Schedule (predefined calendar)
    CREATE TABLE IF NOT EXISTS vaccine_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vaccine_name TEXT NOT NULL,
      description TEXT,
      age_days_min INTEGER NOT NULL,
      age_days_max INTEGER,
      repeat_interval_days INTEGER,
      is_mandatory INTEGER DEFAULT 1,
      breed_specific TEXT
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

    -- Vet Reports table
    CREATE TABLE IF NOT EXISTS vet_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      vet_id INTEGER NOT NULL,
      report_type TEXT CHECK(report_type IN ('health', 'vaccination', 'dna')),
      diagnosis TEXT,
      treatment TEXT,
      symptoms TEXT,
      severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')),
      report_pdf TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (vet_id) REFERENCES vets(id)
    );

    -- Cow Genetics table
    CREATE TABLE IF NOT EXISTS cow_genetics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL UNIQUE,
      a2_gene_status TEXT DEFAULT 'unknown' CHECK(a2_gene_status IN ('A2A2', 'A1A2', 'A1A1', 'unknown')),
      heat_tolerance INTEGER DEFAULT 50,
      disease_resistance INTEGER DEFAULT 50,
      milk_yield_potential INTEGER DEFAULT 50,
      lineage_purity INTEGER DEFAULT 50,
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
      inbreeding_risk TEXT DEFAULT 'low' CHECK(inbreeding_risk IN ('none', 'low', 'medium', 'high')),
      common_ancestor_generations INTEGER,
      recommendation_rank INTEGER,
      notes TEXT,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (bull_id) REFERENCES cows(id)
    );

    -- Ownership Transfers table
    CREATE TABLE IF NOT EXISTS ownership_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      from_farmer_id INTEGER NOT NULL,
      to_farmer_id INTEGER NOT NULL,
      transfer_date TEXT,
      transfer_price REAL DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')),
      verification_method TEXT CHECK(verification_method IN ('rfid', 'noseprint', 'both')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (from_farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (to_farmer_id) REFERENCES farmers(id)
    );

    -- Milk Records table
    CREATE TABLE IF NOT EXISTS milk_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      farmer_id INTEGER NOT NULL,
      quantity_liters REAL NOT NULL,
      collection_time TEXT NOT NULL,
      collection_date TEXT NOT NULL,
      quality_grade TEXT DEFAULT 'A' CHECK(quality_grade IN ('A', 'B', 'C')),
      batch_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );

    -- Milk Batches table
    CREATE TABLE IF NOT EXISTS milk_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_code TEXT UNIQUE NOT NULL,
      farmer_id INTEGER NOT NULL,
      cow_id INTEGER NOT NULL,
      collection_date TEXT NOT NULL,
      quantity_liters REAL NOT NULL,
      is_a2 INTEGER DEFAULT 0,
      cow_breed TEXT,
      farm_location TEXT,
      dna_verified INTEGER DEFAULT 0,
      qr_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (cow_id) REFERENCES cows(id)
    );

    -- Marketplace Products table
    CREATE TABLE IF NOT EXISTS marketplace_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_type TEXT CHECK(product_type IN ('milk', 'ghee', 'curd', 'paneer', 'butter', 'other')),
      description TEXT,
      price REAL NOT NULL,
      unit TEXT DEFAULT 'liter',
      stock_quantity REAL DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      is_a2_certified INTEGER DEFAULT 0,
      image_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'sold_out')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT,
      buyer_address TEXT,
      quantity REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES marketplace_products(id)
    );

    -- Insurance Policies table
    CREATE TABLE IF NOT EXISTS insurance_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      farmer_id INTEGER NOT NULL,
      policy_number TEXT UNIQUE NOT NULL,
      provider TEXT NOT NULL,
      coverage_type TEXT CHECK(coverage_type IN ('basic', 'standard', 'premium')),
      premium_amount REAL NOT NULL,
      coverage_amount REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'claimed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );

    -- Insurance Claims table
    CREATE TABLE IF NOT EXISTS insurance_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_id INTEGER NOT NULL,
      claim_type TEXT CHECK(claim_type IN ('death', 'illness', 'accident', 'theft')),
      claim_amount REAL NOT NULL,
      description TEXT,
      rfid_verified INTEGER DEFAULT 0,
      noseprint_verified INTEGER DEFAULT 0,
      vet_validated INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'approved', 'rejected', 'paid')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
    );

    -- Disease Alerts table
    CREATE TABLE IF NOT EXISTS disease_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_name TEXT NOT NULL,
      region TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
      affected_count INTEGER DEFAULT 0,
      alert_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved')),
      description TEXT,
      reported_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES vets(id)
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_cows_farmer ON cows(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_cows_rfid ON cows(rfid_number);
    CREATE INDEX IF NOT EXISTS idx_vaccinations_cow ON vaccinations(cow_id);
    CREATE INDEX IF NOT EXISTS idx_health_cow ON health_records(cow_id);
    CREATE INDEX IF NOT EXISTS idx_mating_cow ON mating_compatibility(cow_id);
    CREATE INDEX IF NOT EXISTS idx_rfid_history_cow ON rfid_history(cow_id);
    CREATE INDEX IF NOT EXISTS idx_transfers_cow ON ownership_transfers(cow_id);
    CREATE INDEX IF NOT EXISTS idx_milk_records_cow ON milk_records(cow_id);
    CREATE INDEX IF NOT EXISTS idx_milk_batches_farmer ON milk_batches(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_products_farmer ON marketplace_products(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_insurance_cow ON insurance_policies(cow_id);
    CREATE INDEX IF NOT EXISTS idx_disease_alerts_region ON disease_alerts(region);
  `);

  console.log('✅ Database schema created');
};

const seedDemoData = () => {
  console.log('🌱 Seeding demo data...');

  const demoPassword = bcrypt.hashSync('demo123', 10);

  // ─── Insert demo farmers ───
  const insertFarmer = db.prepare(`
    INSERT OR IGNORE INTO farmers (email, password, farm_name, phone_number, location, reputation_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertFarmer.run('demo@farmer.com', demoPassword, 'Green Valley Farm', '+91-9876543210', 'Maharashtra, India', 82.5);
  insertFarmer.run('raj@farm.com', demoPassword, 'Sunrise Dairy Farm', '+91-9876543211', 'Punjab, India', 75.0);
  insertFarmer.run('priya@farm.com', demoPassword, 'Heritage Cattle Farm', '+91-9876543212', 'Gujarat, India', 90.0);

  const farmers = db.prepare('SELECT * FROM farmers').all();
  const farmer1 = farmers[0];
  const farmer2 = farmers[1];
  const farmer3 = farmers[2];

  // ─── Insert demo vets ───
  const insertVet = db.prepare(`
    INSERT OR IGNORE INTO vets (email, password, name, clinic_name, license_number, phone_number, address, region, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVet.run('dr.mehta@vet.com', demoPassword, 'Dr. Rajesh Mehta', 'Mehta Veterinary Clinic', 'VET-MH-2020-001', '+91-9876500001', 'Pune, Maharashtra', 'Maharashtra', 'approved');
  insertVet.run('dr.kumar@vet.com', demoPassword, 'Dr. Anita Kumar', 'Kumar Animal Hospital', 'VET-PB-2019-002', '+91-9876500002', 'Amritsar, Punjab', 'Punjab', 'approved');

  // ─── Insert demo government users ───
  const insertGov = db.prepare(`
    INSERT OR IGNORE INTO government_users (email, password, name, department, region, access_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertGov.run('gov.mh@govt.com', demoPassword, 'Suresh Patil', 'Animal Husbandry', 'Maharashtra', 'state');
  insertGov.run('gov.pb@govt.com', demoPassword, 'Harpreet Singh', 'Animal Husbandry', 'Punjab', 'district');
  insertGov.run('gov.national@govt.com', demoPassword, 'Dr. Arun Sharma', 'DAHD', 'India', 'national');

  // ─── Insert vaccine schedule (predefined) ───
  const insertSchedule = db.prepare(`
    INSERT OR IGNORE INTO vaccine_schedule (vaccine_name, description, age_days_min, age_days_max, repeat_interval_days, is_mandatory)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSchedule.run('FMD (Foot and Mouth Disease)', 'Protection against FMD virus', 120, null, 180, 1);
  insertSchedule.run('Brucellosis', 'Vaccination for female calves', 120, 240, null, 1);
  insertSchedule.run('Hemorrhagic Septicemia (HS)', 'Protection against Pasteurella', 180, null, 365, 1);
  insertSchedule.run('Black Quarter (BQ)', 'Protection against Clostridium', 180, null, 365, 1);
  insertSchedule.run('Theileriosis', 'Tick-borne disease protection', 90, null, 365, 0);
  insertSchedule.run('Anthrax', 'Endemic area vaccination', 180, null, 365, 0);
  insertSchedule.run('IBR (Infectious Bovine Rhinotracheitis)', 'Respiratory disease protection', 180, null, 180, 0);
  insertSchedule.run('Deworming', 'Routine deworming treatment', 30, null, 90, 1);

  console.log('✅ Vaccine schedule inserted');

  // ─── Insert cows with 3-generation family trees ───
  const insertCow = db.prepare(`
    INSERT OR IGNORE INTO cows (rfid_number, farmer_id, gender, birth_date, breed, father_id, mother_id, registration_type, photo_url, dna_status, rfid_status, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // FARMER 1 - Green Valley Farm (3 generations)
  insertCow.run('BULL-GV-G1-001', farmer1.id, 'male', '2020-01-15', 'Gir', null, null, 'purchased', '', 'verified', 'active', 1);
  insertCow.run('COW-GV-G1-001', farmer1.id, 'female', '2020-02-20', 'Gir', null, null, 'purchased', '', 'verified', 'active', 1);

  const grandpa1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('BULL-GV-G1-001');
  const grandma1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('COW-GV-G1-001');

  insertCow.run('BULL-GV-G2-001', farmer1.id, 'male', '2022-05-10', 'Gir', grandpa1.id, grandma1.id, 'newborn', '', 'verified', 'active', 1);
  insertCow.run('COW-GV-G2-001', farmer1.id, 'female', '2022-06-15', 'Gir', grandpa1.id, grandma1.id, 'newborn', '', 'uploaded', 'active', 0);

  const father1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('BULL-GV-G2-001');
  const mother1 = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('COW-GV-G2-001');

  insertCow.run('CALF-GV-2024-001', farmer1.id, 'female', '2024-01-10', 'Gir', father1.id, mother1.id, 'newborn', '', 'pending', 'active', 0);
  insertCow.run('CALF-GV-2024-002', farmer1.id, 'male', '2024-03-15', 'Gir', father1.id, mother1.id, 'newborn', '', 'pending', 'active', 0);
  insertCow.run('CALF-GV-2025-001', farmer1.id, 'female', '2025-11-20', 'Gir', father1.id, mother1.id, 'newborn', '', 'pending', 'active', 0);

  // FARMER 2 - Sunrise Dairy
  insertCow.run('BULL-SD-ELITE-001', farmer2.id, 'male', '2021-03-10', 'Gir', null, null, 'purchased', '', 'verified', 'active', 1);
  insertCow.run('BULL-SD-ELITE-002', farmer2.id, 'male', '2021-05-20', 'Sahiwal', null, null, 'purchased', '', 'verified', 'active', 1);
  insertCow.run('COW-SD-2023-001', farmer2.id, 'female', '2023-07-15', 'Gir', null, null, 'purchased', '', 'uploaded', 'active', 0);

  // FARMER 3 - Heritage Cattle
  insertCow.run('BULL-HC-RED-001', farmer3.id, 'male', '2020-12-05', 'Red Sindhi', null, null, 'purchased', '', 'verified', 'active', 1);
  insertCow.run('COW-HC-GIR-001', farmer3.id, 'female', '2021-08-10', 'Gir', null, null, 'purchased', '', 'verified', 'active', 1);
  insertCow.run('COW-HC-SH-001', farmer3.id, 'female', '2022-04-25', 'Sahiwal', null, null, 'purchased', '', 'verified', 'active', 1);

  console.log('✅ Cows inserted');

  // ─── Insert genetics data ───
  const insertGenetics = db.prepare(`
    INSERT OR IGNORE INTO cow_genetics (cow_id, a2_gene_status, heat_tolerance, disease_resistance, milk_yield_potential, lineage_purity)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const allCowsList = db.prepare('SELECT id, rfid_number, breed, dna_status FROM cows').all();
  allCowsList.forEach(cow => {
    if (cow.dna_status === 'verified') {
      const isGir = cow.breed === 'Gir';
      const isSahiwal = cow.breed === 'Sahiwal';
      insertGenetics.run(
        cow.id,
        isGir ? 'A2A2' : (isSahiwal ? 'A2A2' : 'A1A2'),
        isGir ? 92 : (isSahiwal ? 85 : 78),
        isGir ? 88 : (isSahiwal ? 82 : 75),
        isGir ? 78 : (isSahiwal ? 90 : 70),
        isGir ? 95 : (isSahiwal ? 88 : 80)
      );
    }
  });

  console.log('✅ Genetics data inserted');

  // ─── Insert biometrics for verified cows ───
  const insertBiometric = db.prepare(`
    INSERT OR IGNORE INTO biometrics (cow_id, noseprint_id, noseprint_hash, sample_count, biometric_score)
    VALUES (?, ?, ?, ?, ?)
  `);

  allCowsList.forEach((cow, i) => {
    const hash = 'NP' + cow.rfid_number.replace(/[^A-Z0-9]/g, '') + Date.now().toString(36);
    insertBiometric.run(cow.id, `NOSE-${cow.id}-${(i + 1).toString().padStart(4, '0')}`, hash, 4, 95 + Math.floor(Math.random() * 5));
  });

  console.log('✅ Biometrics inserted');

  // ─── Insert RFID history ───
  const insertRfidHistory = db.prepare(`
    INSERT INTO rfid_history (cow_id, rfid_number, status, assigned_date)
    VALUES (?, ?, ?, ?)
  `);

  allCowsList.forEach(cow => {
    const cowData = db.prepare('SELECT birth_date FROM cows WHERE id = ?').get(cow.id);
    insertRfidHistory.run(cow.id, cow.rfid_number, 'active', cowData.birth_date);
  });

  console.log('✅ RFID history inserted');

  // ─── Health records ───
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

  // ─── Vaccinations ───
  const insertVaccination = db.prepare(`
    INSERT INTO vaccinations (cow_id, vaccine_name, administered_date, next_due_date, certificate_url, administered_by, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const allCows = db.prepare('SELECT id FROM cows').all();
  allCows.slice(0, 8).forEach(cow => {
    insertVaccination.run(cow.id, 'FMD (Foot and Mouth Disease)', '2025-09-15', '2026-03-15', '', 'Dr. Mehta', 1);
    insertVaccination.run(cow.id, 'Brucellosis', '2025-08-10', '2026-08-10', '', 'Dr. Kumar', 1);
    insertVaccination.run(cow.id, 'HS (Hemorrhagic Septicemia)', '2025-07-01', '2026-07-01', '', 'Dr. Mehta', 1);
    insertVaccination.run(cow.id, 'BQ (Black Quarter)', '2025-07-01', '2026-07-01', '', 'Dr. Kumar', 1);
  });

  const urgentCow = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get('CALF-GV-2025-001');
  insertVaccination.run(urgentCow.id, 'Hemorrhagic Septicemia', '2025-07-20', '2026-01-20', '', 'Dr. Sharma', 0);

  console.log('✅ Vaccinations inserted');

  // ─── Mating compatibility scores ───
  const insertCompatibility = db.prepare(`
    INSERT INTO mating_compatibility 
    (cow_id, bull_id, compatibility_score, genetic_diversity_score, health_compatibility_score, breed_match, inbreeding_risk, common_ancestor_generations, recommendation_rank, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const matureCows = db.prepare(`SELECT id, rfid_number, breed, father_id, mother_id FROM cows WHERE gender = 'female' AND birth_date < '2024-01-01'`).all();
  const matureBulls = db.prepare(`SELECT id, rfid_number, breed, father_id, mother_id FROM cows WHERE gender = 'male' AND birth_date < '2024-01-01'`).all();

  matureCows.forEach(cow => {
    let rank = 1;
    matureBulls.forEach(bull => {
      const isRelated = (cow.father_id === bull.id || cow.mother_id === bull.id ||
                         cow.father_id === bull.father_id || cow.mother_id === bull.mother_id);
      const breedMatch = cow.breed === bull.breed;
      const geneticScore = isRelated ? 40 : 95;
      const healthScore = 85;
      const totalScore = breedMatch ? (geneticScore + healthScore) / 2 : (geneticScore + healthScore) / 2 - 20;
      const risk = isRelated ? 'high' : (breedMatch ? 'none' : 'low');

      if (!isRelated && rank <= 3) {
        insertCompatibility.run(cow.id, bull.id, Math.round(totalScore), geneticScore, healthScore, breedMatch ? 1 : 0, risk, isRelated ? 2 : null, rank,
          breedMatch ? 'Excellent match - same breed, no common ancestors' : 'Good match but different breeds');
        rank++;
      }
    });
  });

  console.log('✅ Mating compatibility scores inserted');

  // ─── Milk records (for verified cows) ───
  const insertMilk = db.prepare(`
    INSERT INTO milk_records (cow_id, farmer_id, quantity_liters, collection_time, collection_date, quality_grade, batch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBatch = db.prepare(`
    INSERT INTO milk_batches (batch_code, farmer_id, cow_id, collection_date, quantity_liters, is_a2, cow_breed, farm_location, dna_verified, qr_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const milkCows = db.prepare(`
    SELECT c.id, c.rfid_number, c.breed, c.farmer_id, c.dna_status, f.location as farm_location, g.a2_gene_status
    FROM cows c
    JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN cow_genetics g ON c.id = g.cow_id
    WHERE c.gender = 'female' AND c.birth_date < '2023-01-01'
  `).all();

  const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07'];
  milkCows.forEach(cow => {
    dates.forEach(date => {
      const morningQty = 3 + Math.random() * 4;
      const eveningQty = 2.5 + Math.random() * 3.5;
      const batchCode = `BATCH-${cow.rfid_number}-${date}`;
      const isA2 = cow.a2_gene_status === 'A2A2' ? 1 : 0;

      insertMilk.run(cow.id, cow.farmer_id, parseFloat(morningQty.toFixed(1)), 'morning', date, 'A', batchCode);
      insertMilk.run(cow.id, cow.farmer_id, parseFloat(eveningQty.toFixed(1)), 'evening', date, 'A', batchCode);

      const qrData = JSON.stringify({
        batch: batchCode, cow_breed: cow.breed, farm: cow.farm_location,
        dna_verified: cow.dna_status === 'verified', a2_status: cow.a2_gene_status || 'unknown',
        collection_date: date
      });

      insertBatch.run(batchCode, cow.farmer_id, cow.id, date, parseFloat((morningQty + eveningQty).toFixed(1)),
        isA2, cow.breed, cow.farm_location, cow.dna_status === 'verified' ? 1 : 0, qrData);
    });
  });

  console.log('✅ Milk records & batches inserted');

  // ─── Marketplace products ───
  const insertProduct = db.prepare(`
    INSERT INTO marketplace_products (farmer_id, product_name, product_type, description, price, unit, stock_quantity, is_verified, is_a2_certified, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(farmer1.id, 'Fresh Gir Cow A2 Milk', 'milk', 'Pure A2 milk from verified Gir cows', 80, 'liter', 50, 1, 1, 'active');
  insertProduct.run(farmer1.id, 'Pure Desi Ghee', 'ghee', 'Traditional bilona method ghee from A2 milk', 800, 'kg', 10, 1, 1, 'active');
  insertProduct.run(farmer2.id, 'Organic Gir Milk', 'milk', 'Farm fresh organic milk', 70, 'liter', 30, 1, 1, 'active');
  insertProduct.run(farmer2.id, 'Fresh Curd', 'curd', 'Set curd from A2 milk', 60, 'kg', 20, 1, 0, 'active');
  insertProduct.run(farmer3.id, 'Sahiwal A2 Milk', 'milk', 'Premium Sahiwal cow milk', 90, 'liter', 25, 1, 1, 'active');
  insertProduct.run(farmer3.id, 'Artisan Paneer', 'paneer', 'Fresh paneer from indigenous cow milk', 400, 'kg', 5, 1, 1, 'active');

  console.log('✅ Marketplace products inserted');

  // ─── Sample orders ───
  const insertOrder = db.prepare(`
    INSERT INTO orders (product_id, buyer_name, buyer_phone, buyer_address, quantity, total_price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(1, 'Amit Verma', '+91-9900001111', '123 MG Road, Pune', 5, 400, 'delivered');
  insertOrder.run(1, 'Neha Gupta', '+91-9900002222', '45 Baner Road, Pune', 2, 160, 'confirmed');
  insertOrder.run(3, 'Vikram Rao', '+91-9900003333', '67 Sector 17, Amritsar', 3, 210, 'shipped');

  console.log('✅ Orders inserted');

  // ─── Insurance policies (mocked) ───
  const insertPolicy = db.prepare(`
    INSERT INTO insurance_policies (cow_id, farmer_id, policy_number, provider, coverage_type, premium_amount, coverage_amount, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const verifiedCows = db.prepare(`SELECT id, farmer_id FROM cows WHERE is_verified = 1`).all();
  verifiedCows.slice(0, 4).forEach((cow, i) => {
    const types = ['basic', 'standard', 'premium', 'standard'];
    const premiums = [1200, 2500, 4000, 2500];
    const coverages = [25000, 50000, 100000, 50000];
    insertPolicy.run(cow.id, cow.farmer_id, `GS-INS-2026-${(i + 1).toString().padStart(4, '0')}`,
      'National Insurance Co.', types[i], premiums[i], coverages[i], '2026-01-01', '2027-01-01', 'active');
  });

  console.log('✅ Insurance policies inserted');

  // ─── Disease alerts ───
  const insertAlert = db.prepare(`
    INSERT INTO disease_alerts (disease_name, region, severity, affected_count, alert_date, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAlert.run('Foot and Mouth Disease', 'Maharashtra', 'high', 23, '2026-02-15', 'active', 'FMD outbreak reported in Pune district. Vaccination drives underway.');
  insertAlert.run('Lumpy Skin Disease', 'Punjab', 'medium', 8, '2026-03-01', 'active', 'Scattered cases in border districts.');
  insertAlert.run('Brucellosis', 'Gujarat', 'low', 3, '2026-02-20', 'active', 'Isolated cases detected in dairy farms.');
  insertAlert.run('Black Quarter', 'Maharashtra', 'medium', 5, '2026-01-10', 'resolved', 'Outbreak contained after emergency vaccination.');

  console.log('✅ Disease alerts inserted');

  // ─── Vet reports ───
  const vets = db.prepare('SELECT id FROM vets').all();
  if (vets.length > 0) {
    const insertReport = db.prepare(`
      INSERT INTO vet_reports (cow_id, vet_id, report_type, diagnosis, treatment, symptoms, severity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(grandpa1.id, vets[0].id, 'health', 'Healthy', 'Routine checkup - no issues found', 'None', 'mild', 'completed');
    insertReport.run(grandma1.id, vets[0].id, 'dna', 'DNA Verified - A2A2 genotype confirmed', 'N/A', 'N/A', null, 'completed');
    insertReport.run(sickBull1.id, vets[1] ? vets[1].id : vets[0].id, 'health', 'Foot Rot - Interdigital', 'Antibiotic treatment + foot bath', 'Lameness, swelling between toes', 'moderate', 'completed');
  }

  console.log('✅ Vet reports inserted');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database initialization complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 Demo Accounts:');
  console.log('');
  console.log('   🧑‍🌾 FARMERS:');
  console.log('   demo@farmer.com / demo123');
  console.log('   raj@farm.com / demo123');
  console.log('   priya@farm.com / demo123');
  console.log('');
  console.log('   🩺 VETERINARIANS:');
  console.log('   dr.mehta@vet.com / demo123');
  console.log('   dr.kumar@vet.com / demo123');
  console.log('');
  console.log('   🏛️  GOVERNMENT:');
  console.log('   gov.mh@govt.com / demo123 (Maharashtra - State)');
  console.log('   gov.pb@govt.com / demo123 (Punjab - District)');
  console.log('   gov.national@govt.com / demo123 (National)');
  console.log('');
  console.log('   📱 Mock OTP: 123456 (for any phone number)');
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
