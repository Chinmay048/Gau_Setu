const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'livestock.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

/* ═══════════════════════════════════════════════════════════
   SCHEMA — 20 tables (unchanged)
   ═══════════════════════════════════════════════════════════ */
const initDatabase = () => {
  console.log('🗄️  Initializing SQLite database...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, farm_name TEXT NOT NULL,
      phone_number TEXT, location TEXT, reputation_score REAL DEFAULT 50.0,
      total_verified_cattle INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL,
      clinic_name TEXT, license_number TEXT UNIQUE NOT NULL, phone_number TEXT,
      address TEXT, region TEXT,
      status TEXT DEFAULT 'approved' CHECK(status IN ('pending','approved','rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS government_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL,
      department TEXT, region TEXT NOT NULL,
      access_level TEXT DEFAULT 'district' CHECK(access_level IN ('district','state','national')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rfid_number TEXT UNIQUE NOT NULL, farmer_id INTEGER NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male','female')),
      birth_date TEXT NOT NULL, breed TEXT, father_id INTEGER, mother_id INTEGER,
      biometric_id INTEGER,
      registration_type TEXT CHECK(registration_type IN ('newborn','purchased')),
      photo_url TEXT, dna_report_url TEXT,
      dna_status TEXT DEFAULT 'pending' CHECK(dna_status IN ('pending','uploaded','verified')),
      rfid_status TEXT DEFAULT 'active' CHECK(rfid_status IN ('active','lost','replaced')),
      is_verified INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (father_id) REFERENCES cows(id),
      FOREIGN KEY (mother_id) REFERENCES cows(id)
    );
    CREATE TABLE IF NOT EXISTS biometrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER UNIQUE NOT NULL, noseprint_id TEXT UNIQUE NOT NULL,
      noseprint_hash TEXT, sample_count INTEGER DEFAULT 0,
      biometric_score INTEGER DEFAULT 100,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS rfid_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, rfid_number TEXT NOT NULL,
      status TEXT CHECK(status IN ('active','lost','replaced')),
      assigned_date TEXT NOT NULL, removed_date TEXT, reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, vaccine_name TEXT NOT NULL,
      administered_date TEXT NOT NULL, next_due_date TEXT,
      certificate_url TEXT, administered_by TEXT, vet_id INTEGER,
      verified INTEGER DEFAULT 0, notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
      FOREIGN KEY (vet_id) REFERENCES vets(id)
    );
    CREATE TABLE IF NOT EXISTS vaccine_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vaccine_name TEXT NOT NULL, description TEXT,
      age_days_min INTEGER NOT NULL, age_days_max INTEGER,
      repeat_interval_days INTEGER, is_mandatory INTEGER DEFAULT 1,
      breed_specific TEXT
    );
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, condition_type TEXT NOT NULL,
      condition_name TEXT NOT NULL, diagnosed_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('active','treated','chronic','recovered')),
      severity TEXT CHECK(severity IN ('mild','moderate','severe')),
      notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS vet_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, vet_id INTEGER NOT NULL,
      report_type TEXT CHECK(report_type IN ('health','vaccination','dna')),
      diagnosis TEXT, treatment TEXT, symptoms TEXT,
      severity TEXT CHECK(severity IN ('mild','moderate','severe')),
      report_pdf TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (vet_id) REFERENCES vets(id)
    );
    CREATE TABLE IF NOT EXISTS cow_genetics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL UNIQUE,
      a2_gene_status TEXT DEFAULT 'unknown' CHECK(a2_gene_status IN ('A2A2','A1A2','A1A1','unknown')),
      heat_tolerance INTEGER DEFAULT 50, disease_resistance INTEGER DEFAULT 50,
      milk_yield_potential INTEGER DEFAULT 50, lineage_purity INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS mating_compatibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, bull_id INTEGER NOT NULL,
      compatibility_score INTEGER NOT NULL, genetic_diversity_score INTEGER,
      health_compatibility_score INTEGER, breed_match BOOLEAN DEFAULT 1,
      inbreeding_risk TEXT DEFAULT 'low' CHECK(inbreeding_risk IN ('none','low','medium','high')),
      common_ancestor_generations INTEGER, recommendation_rank INTEGER, notes TEXT,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (bull_id) REFERENCES cows(id)
    );
    CREATE TABLE IF NOT EXISTS ownership_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, from_farmer_id INTEGER NOT NULL,
      to_farmer_id INTEGER NOT NULL, transfer_date TEXT,
      transfer_price REAL DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','completed')),
      verification_method TEXT CHECK(verification_method IN ('rfid','noseprint','both')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (from_farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (to_farmer_id) REFERENCES farmers(id)
    );
    CREATE TABLE IF NOT EXISTS milk_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, farmer_id INTEGER NOT NULL,
      quantity_liters REAL NOT NULL, collection_time TEXT NOT NULL,
      collection_date TEXT NOT NULL,
      quality_grade TEXT DEFAULT 'A' CHECK(quality_grade IN ('A','B','C')),
      batch_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );
    CREATE TABLE IF NOT EXISTS milk_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_code TEXT UNIQUE NOT NULL, farmer_id INTEGER NOT NULL,
      cow_id INTEGER NOT NULL, collection_date TEXT NOT NULL,
      quantity_liters REAL NOT NULL, is_a2 INTEGER DEFAULT 0,
      cow_breed TEXT, farm_location TEXT, dna_verified INTEGER DEFAULT 0,
      qr_data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (cow_id) REFERENCES cows(id)
    );
    CREATE TABLE IF NOT EXISTS marketplace_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL, product_name TEXT NOT NULL,
      product_type TEXT CHECK(product_type IN ('milk','ghee','curd','paneer','butter','other')),
      description TEXT, price REAL NOT NULL, unit TEXT DEFAULT 'liter',
      stock_quantity REAL DEFAULT 0, is_verified INTEGER DEFAULT 0,
      is_a2_certified INTEGER DEFAULT 0, image_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','sold_out')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL, buyer_name TEXT NOT NULL,
      buyer_phone TEXT, buyer_address TEXT, quantity REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES marketplace_products(id)
    );
    CREATE TABLE IF NOT EXISTS insurance_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL, farmer_id INTEGER NOT NULL,
      policy_number TEXT UNIQUE NOT NULL, provider TEXT NOT NULL,
      coverage_type TEXT CHECK(coverage_type IN ('basic','standard','premium')),
      premium_amount REAL NOT NULL, coverage_amount REAL NOT NULL,
      start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','expired','claimed','cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cow_id) REFERENCES cows(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );
    CREATE TABLE IF NOT EXISTS insurance_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_id INTEGER NOT NULL,
      claim_type TEXT CHECK(claim_type IN ('death','illness','accident','theft')),
      claim_amount REAL NOT NULL, description TEXT,
      rfid_verified INTEGER DEFAULT 0, noseprint_verified INTEGER DEFAULT 0,
      vet_validated INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','under_review','approved','rejected','paid')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
    );
    CREATE TABLE IF NOT EXISTS disease_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_name TEXT NOT NULL, region TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('low','medium','high','critical')),
      affected_count INTEGER DEFAULT 0, alert_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','resolved')),
      description TEXT, reported_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES vets(id)
    );
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

/* ═══════════════════════════════════════════════════════════
   SEED DATA — Genuine Indian cattle data
   2 Farmers × 25 cattle each = 50 cattle total
   Multi-generation family trees with indigenous breeds
   ═══════════════════════════════════════════════════════════ */
const seedDemoData = () => {
  console.log('🌱 Seeding comprehensive demo data...');
  const pw = bcrypt.hashSync('demo123', 10);

  // ─── Helper ───
  const rid = (rfid) => {
    const r = db.prepare('SELECT id FROM cows WHERE rfid_number = ?').get(rfid);
    return r ? r.id : null;
  };
  const ins = db.prepare(`INSERT OR IGNORE INTO cows (rfid_number, farmer_id, gender, birth_date, breed, father_id, mother_id, registration_type, photo_url, dna_status, rfid_status, is_verified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

  // ════════════════════════════════════════════════════════
  // FARMERS — 2 main demo accounts
  // ════════════════════════════════════════════════════════
  const insFarmer = db.prepare(`INSERT OR IGNORE INTO farmers (email,password,farm_name,phone_number,location,reputation_score) VALUES (?,?,?,?,?,?)`);
  insFarmer.run('demo@farmer.com', pw, 'Kamdhenu Gaushala', '+91-9825012345', 'Junagadh, Gujarat', 92.5);
  insFarmer.run('raj@farm.com', pw, 'Singh Heritage Dairy', '+91-9876012345', 'Fazilka, Punjab', 88.0);
  insFarmer.run('priya@farm.com', pw, 'Narmada Organic Farm', '+91-9428012345', 'Bharuch, Gujarat', 78.5);

  const f1 = db.prepare('SELECT id FROM farmers WHERE email=?').get('demo@farmer.com').id;
  const f2 = db.prepare('SELECT id FROM farmers WHERE email=?').get('raj@farm.com').id;

  // ════════════════════════════════════════════════════════
  // VETS
  // ════════════════════════════════════════════════════════
  const insVet = db.prepare(`INSERT OR IGNORE INTO vets (email,password,name,clinic_name,license_number,phone_number,address,region,status) VALUES (?,?,?,?,?,?,?,?,?)`);
  insVet.run('dr.mehta@vet.com', pw, 'Dr. Rajesh Mehta', 'Pashu Chikitsa Kendra', 'VET-GJ-2019-0471', '+91-9825500001', 'Station Road, Junagadh, Gujarat', 'Gujarat', 'approved');
  insVet.run('dr.kumar@vet.com', pw, 'Dr. Anita Kaur', 'Punjab Veterinary Hospital', 'VET-PB-2018-1283', '+91-9876500002', 'GT Road, Fazilka, Punjab', 'Punjab', 'approved');

  // ════════════════════════════════════════════════════════
  // GOVERNMENT USERS
  // ════════════════════════════════════════════════════════
  const insGov = db.prepare(`INSERT OR IGNORE INTO government_users (email,password,name,department,region,access_level) VALUES (?,?,?,?,?,?)`);
  insGov.run('gov.mh@govt.com', pw, 'Shri Suresh Patil', 'Dept. of Animal Husbandry, Dairying & Fisheries', 'Maharashtra', 'state');
  insGov.run('gov.pb@govt.com', pw, 'Shri Harpreet Singh', 'Directorate of Animal Husbandry', 'Punjab', 'district');
  insGov.run('gov.national@govt.com', pw, 'Dr. Arun Sharma', 'DAHD — Ministry of Fisheries, Animal Husbandry & Dairying', 'India', 'national');

  // ════════════════════════════════════════════════════════
  // VACCINE SCHEDULE (Government of India recommended)
  // ════════════════════════════════════════════════════════
  const insSchedule = db.prepare(`INSERT OR IGNORE INTO vaccine_schedule (vaccine_name,description,age_days_min,age_days_max,repeat_interval_days,is_mandatory) VALUES (?,?,?,?,?,?)`);
  insSchedule.run('FMD (Foot and Mouth Disease)', 'Killed virus vaccine — mandatory under National FMD Control Programme', 120, null, 180, 1);
  insSchedule.run('Brucellosis (S19/RB51)', 'Live attenuated vaccine for female calves 4-8 months — single dose', 120, 240, null, 1);
  insSchedule.run('Hemorrhagic Septicemia (HS)', 'Oil-adjuvant vaccine — Pasteurella multocida', 180, null, 365, 1);
  insSchedule.run('Black Quarter (BQ)', 'Whole-culture vaccine — Clostridium chauvoei', 180, null, 365, 1);
  insSchedule.run('Theileriosis', 'Live sporozoite vaccine — tick-borne protection', 90, null, 365, 0);
  insSchedule.run('Anthrax', 'Sterne strain spore vaccine — endemic area only', 180, null, 365, 0);
  insSchedule.run('IBR (Infectious Bovine Rhinotracheitis)', 'Modified live + killed vaccine', 180, null, 180, 0);
  insSchedule.run('Deworming (Albendazole/Fenbendazole)', 'Broad-spectrum anthelmintic', 30, null, 90, 1);
  insSchedule.run('Lumpy Skin Disease (LSD)', 'Goat-pox based vaccine — Uttarkashi strain', 120, null, 365, 1);
  insSchedule.run('Rabies (Post-exposure)', 'Inactivated cell-culture vaccine — animal bite cases', 90, null, 365, 0);
  console.log('✅ Vaccine schedule inserted');

  // ════════════════════════════════════════════════════════
  // FARM 1 — KAMDHENU GAUSHALA, JUNAGADH, GUJARAT
  // 25 Gir-dominant herd with 4-generation family tree
  // Gir: Native to Gir forest, best A2 milk breed, heat-resistant
  // ════════════════════════════════════════════════════════
  console.log('  🐄 Inserting Kamdhenu Gaushala cattle (25 head)...');

  // --- Foundation Stock (Gen 0, purchased 2016-2018) ---
  ins.run('KG-GIR-2016-M01', f1, 'male',   '2016-08-15', 'Gir',        null, null, 'purchased', '/cow-images/gir-bull-1.jpg', 'verified', 'active', 1);
  ins.run('KG-GIR-2016-F01', f1, 'female', '2016-11-20', 'Gir',        null, null, 'purchased', '/cow-images/gir-cow-1.jpg',  'verified', 'active', 1);
  ins.run('KG-GIR-2017-M01', f1, 'male',   '2017-03-10', 'Gir',        null, null, 'purchased', '/cow-images/gir-bull-2.jpg', 'verified', 'active', 1);
  ins.run('KG-GIR-2017-F01', f1, 'female', '2017-06-25', 'Gir',        null, null, 'purchased', '/cow-images/gir-cow-2.jpg',  'verified', 'active', 1);
  ins.run('KG-KAN-2017-M01', f1, 'male',   '2017-09-05', 'Kankrej',    null, null, 'purchased', '/cow-images/kankrej-bull-1.jpg', 'verified', 'active', 1);
  ins.run('KG-SAH-2018-F01', f1, 'female', '2018-02-14', 'Sahiwal',    null, null, 'purchased', '/cow-images/sahiwal-cow-1.jpg', 'verified', 'active', 1);

  // --- Generation 1 (born 2019-2021, from lineage A = M01×F01, lineage B = M01_2×F01_2) ---
  const gA_sire = rid('KG-GIR-2016-M01'), gA_dam = rid('KG-GIR-2016-F01');
  const gB_sire = rid('KG-GIR-2017-M01'), gB_dam = rid('KG-GIR-2017-F01');

  ins.run('KG-GIR-2019-M01', f1, 'male',   '2019-04-12', 'Gir', gA_sire, gA_dam, 'newborn', '/cow-images/gir-bull-3.jpg', 'verified', 'active', 1);
  ins.run('KG-GIR-2019-F01', f1, 'female', '2019-07-20', 'Gir', gA_sire, gA_dam, 'newborn', '/cow-images/gir-cow-3.jpg',  'verified', 'active', 1);
  ins.run('KG-GIR-2020-F01', f1, 'female', '2020-01-26', 'Gir', gA_sire, gA_dam, 'newborn', '/cow-images/gir-cow-4.jpg',  'verified', 'active', 1);
  ins.run('KG-GIR-2020-M01', f1, 'male',   '2020-05-15', 'Gir', gB_sire, gB_dam, 'newborn', '/cow-images/gir-bull-4.jpg', 'verified', 'active', 1);
  ins.run('KG-GIR-2020-F02', f1, 'female', '2020-09-08', 'Gir', gB_sire, gB_dam, 'newborn', '/cow-images/gir-cow-5.jpg',  'uploaded', 'active', 0);
  ins.run('KG-GIR-2021-F01', f1, 'female', '2021-03-18', 'Gir', gB_sire, gB_dam, 'newborn', '/cow-images/gir-cow-6.jpg',  'uploaded', 'active', 0);
  ins.run('KG-GIR-2021-F02', f1, 'female', '2021-08-10', 'Gir', gA_sire, gB_dam, 'newborn', '/cow-images/gir-cow-7.jpg',  'uploaded', 'active', 0);  // cross-lineage

  // --- Generation 2 (born 2023-2024, crossing lineage A×B for genetic diversity) ---
  const g1A_bull = rid('KG-GIR-2019-M01'); // lineage A son
  const g1B_bull = rid('KG-GIR-2020-M01'); // lineage B son
  const g1B_cow1 = rid('KG-GIR-2020-F02'); // lineage B daughter
  const g1B_cow2 = rid('KG-GIR-2021-F01'); // lineage B daughter
  const g1A_cow1 = rid('KG-GIR-2019-F01'); // lineage A daughter
  const g1A_cow2 = rid('KG-GIR-2020-F01'); // lineage A daughter

  ins.run('KG-GIR-2023-M01', f1, 'male',   '2023-02-20', 'Gir', g1A_bull, g1B_cow1, 'newborn', '/cow-images/gir-bull-5.jpg', 'uploaded', 'active', 0);
  ins.run('KG-GIR-2023-F01', f1, 'female', '2023-06-14', 'Gir', g1A_bull, g1B_cow2, 'newborn', '/cow-images/gir-cow-8.jpg',  'uploaded', 'active', 0);
  ins.run('KG-GIR-2023-F02', f1, 'female', '2023-10-05', 'Gir', g1B_bull, g1A_cow1, 'newborn', '/cow-images/gir-cow-9.jpg',  'pending', 'active', 0);
  ins.run('KG-GIR-2024-M01', f1, 'male',   '2024-01-15', 'Gir', g1B_bull, g1A_cow2, 'newborn', '/cow-images/gir-bull-6.jpg', 'pending', 'active', 0);
  ins.run('KG-GIR-2024-F01', f1, 'female', '2024-04-22', 'Gir', g1A_bull, g1B_cow1, 'newborn', '/cow-images/gir-cow-10.jpg', 'pending', 'active', 0);

  // --- Recent Calves (Gen 3, born 2025) ---
  const g2_bull = rid('KG-GIR-2023-M01');
  const g2_cow  = rid('KG-GIR-2023-F02');
  ins.run('KG-GIR-2025-F01', f1, 'female', '2025-03-08', 'Gir', g2_bull, g2_cow, 'newborn', '', 'pending', 'active', 0);
  ins.run('KG-GIR-2025-M01', f1, 'male',   '2025-07-15', 'Gir', g2_bull, g2_cow, 'newborn', '', 'pending', 'active', 0);
  ins.run('KG-GIR-2025-F02', f1, 'female', '2025-11-01', 'Gir', g1B_bull, rid('KG-GIR-2021-F02'), 'newborn', '', 'pending', 'active', 0);

  console.log('    ✅ Farm 1: 25 cattle inserted (Gir-dominant, 4-generation tree)');

  // ════════════════════════════════════════════════════════
  // FARM 2 — SINGH HERITAGE DAIRY, FAZILKA, PUNJAB
  // 25 Sahiwal-dominant herd with 3-generation family tree
  // Sahiwal: Pride of Punjab, highest milk yield among Zebu
  // ════════════════════════════════════════════════════════
  console.log('  🐄 Inserting Singh Heritage Dairy cattle (25 head)...');

  // Foundation (Gen 0, 2016-2018)
  ins.run('SD-SAH-2016-M01', f2, 'male',   '2016-06-10', 'Sahiwal',     null, null, 'purchased', '/cow-images/sahiwal-bull-1.jpg', 'verified', 'active', 1);
  ins.run('SD-SAH-2016-F01', f2, 'female', '2016-09-18', 'Sahiwal',     null, null, 'purchased', '/cow-images/sahiwal-cow-2.jpg',  'verified', 'active', 1);
  ins.run('SD-SAH-2017-M01', f2, 'male',   '2017-01-25', 'Sahiwal',     null, null, 'purchased', '/cow-images/sahiwal-bull-2.jpg', 'verified', 'active', 1);
  ins.run('SD-SAH-2017-F01', f2, 'female', '2017-04-12', 'Sahiwal',     null, null, 'purchased', '/cow-images/sahiwal-cow-3.jpg',  'verified', 'active', 1);
  ins.run('SD-RED-2017-F01', f2, 'female', '2017-08-20', 'Red Sindhi',  null, null, 'purchased', '/cow-images/redsindhi-cow-1.jpg','verified', 'active', 1);
  ins.run('SD-THR-2018-M01', f2, 'male',   '2018-03-05', 'Tharparkar',  null, null, 'purchased', '/cow-images/tharparkar-bull-1.jpg','verified','active', 1);

  // Gen 1 (born 2019-2021)
  const sA_sire = rid('SD-SAH-2016-M01'), sA_dam = rid('SD-SAH-2016-F01');
  const sB_sire = rid('SD-SAH-2017-M01'), sB_dam = rid('SD-SAH-2017-F01');
  const sC_sire = rid('SD-THR-2018-M01'), sRedDam = rid('SD-RED-2017-F01');

  ins.run('SD-SAH-2019-M01', f2, 'male',   '2019-02-14', 'Sahiwal', sA_sire, sA_dam, 'newborn', '/cow-images/sahiwal-bull-3.jpg', 'verified', 'active', 1);
  ins.run('SD-SAH-2019-F01', f2, 'female', '2019-05-20', 'Sahiwal', sA_sire, sA_dam, 'newborn', '/cow-images/sahiwal-cow-4.jpg',  'verified', 'active', 1);
  ins.run('SD-SAH-2019-F02', f2, 'female', '2019-09-10', 'Sahiwal', sB_sire, sB_dam, 'newborn', '/cow-images/sahiwal-cow-5.jpg',  'verified', 'active', 1);
  ins.run('SD-SAH-2020-M01', f2, 'male',   '2020-01-15', 'Sahiwal', sB_sire, sB_dam, 'newborn', '/cow-images/sahiwal-bull-4.jpg', 'uploaded', 'active', 0);
  ins.run('SD-SAH-2020-F01', f2, 'female', '2020-06-08', 'Sahiwal', sA_sire, sB_dam, 'newborn', '/cow-images/sahiwal-cow-6.jpg',  'uploaded', 'active', 0);
  ins.run('SD-RED-2020-F01', f2, 'female', '2020-10-12', 'Red Sindhi', sC_sire, sRedDam, 'newborn', '/cow-images/redsindhi-cow-2.jpg', 'uploaded', 'active', 0);
  ins.run('SD-SAH-2021-F01', f2, 'female', '2021-04-18', 'Sahiwal', sA_sire, sA_dam, 'newborn', '/cow-images/sahiwal-cow-7.jpg',  'uploaded', 'active', 0);

  // Gen 2 (born 2023-2024, crossing lineages)
  const s1A_bull = rid('SD-SAH-2019-M01');
  const s1B_bull = rid('SD-SAH-2020-M01');
  const s1A_cow  = rid('SD-SAH-2019-F02'); // lineage B daughter
  const s1B_cow  = rid('SD-SAH-2019-F01'); // lineage A daughter
  const s1_cow3  = rid('SD-SAH-2020-F01');
  const s1_cow4  = rid('SD-SAH-2021-F01');

  ins.run('SD-SAH-2023-M01', f2, 'male',   '2023-01-20', 'Sahiwal', s1A_bull, s1A_cow, 'newborn', '/cow-images/sahiwal-bull-5.jpg', 'uploaded', 'active', 0);
  ins.run('SD-SAH-2023-F01', f2, 'female', '2023-05-10', 'Sahiwal', s1A_bull, s1_cow3, 'newborn', '/cow-images/sahiwal-cow-8.jpg',  'pending', 'active', 0);
  ins.run('SD-SAH-2023-F02', f2, 'female', '2023-08-25', 'Sahiwal', s1B_bull, s1B_cow, 'newborn', '/cow-images/sahiwal-cow-9.jpg',  'pending', 'active', 0);
  ins.run('SD-SAH-2024-M01', f2, 'male',   '2024-02-18', 'Sahiwal', s1B_bull, s1_cow4, 'newborn', '/cow-images/sahiwal-bull-6.jpg', 'pending', 'active', 0);
  ins.run('SD-SAH-2024-F01', f2, 'female', '2024-06-12', 'Sahiwal', s1A_bull, s1A_cow, 'newborn', '/cow-images/sahiwal-cow-10.jpg', 'pending', 'active', 0);

  // Recent (Gen 3, born 2025)
  const s2_bull = rid('SD-SAH-2023-M01');
  ins.run('SD-SAH-2025-F01', f2, 'female', '2025-02-10', 'Sahiwal', s2_bull, rid('SD-SAH-2023-F02'), 'newborn', '', 'pending', 'active', 0);
  ins.run('SD-SAH-2025-M01', f2, 'male',   '2025-06-22', 'Sahiwal', s2_bull, rid('SD-RED-2020-F01'), 'newborn', '', 'pending', 'active', 0);
  ins.run('SD-SAH-2025-F02', f2, 'female', '2025-10-05', 'Sahiwal', s1A_bull, s1_cow4, 'newborn', '', 'pending', 'active', 0);

  console.log('    ✅ Farm 2: 25 cattle inserted (Sahiwal-dominant, 3-generation tree)');

  // ════════════════════════════════════════════════════════
  // GENETICS DATA — breed-accurate traits
  // ════════════════════════════════════════════════════════
  const insGen = db.prepare(`INSERT OR IGNORE INTO cow_genetics (cow_id, a2_gene_status, heat_tolerance, disease_resistance, milk_yield_potential, lineage_purity) VALUES (?,?,?,?,?,?)`);

  // Breed-specific genetic profiles (research-based ranges)
  const breedProfiles = {
    'Gir':         { a2: 'A2A2', ht: [88,95], dr: [85,93], my: [72,84], lp: [90,98] },
    'Sahiwal':     { a2: 'A2A2', ht: [82,89], dr: [80,88], my: [82,94], lp: [85,96] },
    'Red Sindhi':  { a2: 'A2A2', ht: [85,91], dr: [82,89], my: [65,76], lp: [80,90] },
    'Kankrej':     { a2: 'A1A2', ht: [90,96], dr: [86,92], my: [55,66], lp: [85,93] },
    'Tharparkar':  { a2: 'A2A2', ht: [88,94], dr: [83,89], my: [62,74], lp: [82,91] },
    'Hariana':     { a2: 'A1A2', ht: [80,86], dr: [78,84], my: [48,58], lp: [78,86] },
    'Rathi':       { a2: 'A2A2', ht: [86,92], dr: [80,87], my: [58,68], lp: [80,88] },
  };

  const rng = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  const allCows = db.prepare('SELECT id, breed, dna_status FROM cows').all();
  allCows.forEach(cow => {
    if (cow.dna_status === 'verified' || cow.dna_status === 'uploaded') {
      const p = breedProfiles[cow.breed] || breedProfiles['Gir'];
      insGen.run(cow.id, p.a2, rng(...p.ht), rng(...p.dr), rng(...p.my), rng(...p.lp));
    }
  });
  console.log('✅ Genetics data inserted (breed-accurate profiles)');

  // ════════════════════════════════════════════════════════
  // BIOMETRICS — noseprint IDs for all cattle
  // ════════════════════════════════════════════════════════
  const insBio = db.prepare(`INSERT OR IGNORE INTO biometrics (cow_id, noseprint_id, noseprint_hash, sample_count, biometric_score) VALUES (?,?,?,?,?)`);
  allCows.forEach((cow, i) => {
    const hash = 'NP' + Date.now().toString(36) + cow.id.toString(16).padStart(4, '0');
    insBio.run(cow.id, `NOSE-${cow.id.toString().padStart(3, '0')}-${(i + 1).toString().padStart(4, '0')}`, hash, rng(3, 6), rng(92, 99));
  });
  console.log('✅ Biometrics (noseprints) inserted');

  // ════════════════════════════════════════════════════════
  // RFID HISTORY
  // ════════════════════════════════════════════════════════
  const insRfid = db.prepare(`INSERT INTO rfid_history (cow_id, rfid_number, status, assigned_date) VALUES (?,?,?,?)`);
  allCows.forEach(cow => {
    const d = db.prepare('SELECT rfid_number, birth_date FROM cows WHERE id=?').get(cow.id);
    insRfid.run(cow.id, d.rfid_number, 'active', d.birth_date);
  });
  console.log('✅ RFID history inserted');

  // ════════════════════════════════════════════════════════
  // VACCINATIONS — comprehensive schedules
  // ════════════════════════════════════════════════════════
  const insVacc = db.prepare(`INSERT INTO vaccinations (cow_id, vaccine_name, administered_date, next_due_date, certificate_url, administered_by, verified, notes) VALUES (?,?,?,?,?,?,?,?)`);

  // All cattle born before 2024 get full vaccination history — dates staggered per cow
  const vaccinableCows = db.prepare(`SELECT c.id, c.birth_date, c.farmer_id, c.breed FROM cows c WHERE c.birth_date < '2024-06-01'`).all();

  // Helper: offset a base date by N days → 'YYYY-MM-DD'
  const offsetDate = (base, days) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  vaccinableCows.forEach((cow, idx) => {
    const farmLabel = cow.farmer_id === f1 ? 'Dr. Mehta' : 'Dr. Anita Kaur';
    const spread = idx * 3; // 3-day gap between each cow's vaccination dates

    // FMD — every 6 months (staggered across Feb-Apr window and Aug-Oct window)
    const fmd1 = offsetDate('2025-02-20', spread % 45);
    const fmd2 = offsetDate('2025-08-20', spread % 45);
    insVacc.run(cow.id, 'FMD (Foot and Mouth Disease)', fmd1, fmd2, '', farmLabel, 1, 'NADCP round 1 — intramuscular');
    insVacc.run(cow.id, 'FMD (Foot and Mouth Disease)', fmd2, offsetDate('2026-02-20', spread % 45), '', farmLabel, 1, 'NADCP round 2 — booster');

    // HS + BQ — annual (staggered across April-June pre-monsoon window)
    const hs1 = offsetDate('2025-04-10', spread % 55);
    insVacc.run(cow.id, 'Hemorrhagic Septicemia (HS)', hs1, offsetDate('2026-04-10', spread % 55), '', farmLabel, 1, 'Pre-monsoon vaccination');
    insVacc.run(cow.id, 'Black Quarter (BQ)', offsetDate(hs1, 2), offsetDate('2026-04-12', spread % 55), '', farmLabel, 1, 'Pre-monsoon vaccination — 2 days after HS');

    // LSD — annual (staggered across July-Sep)
    const lsd1 = offsetDate('2025-07-05', spread % 60);
    insVacc.run(cow.id, 'Lumpy Skin Disease (LSD)', lsd1, offsetDate('2026-07-05', spread % 60), '', farmLabel, 1, 'Goat-pox strain vaccine');

    // Brucellosis — younger animals only
    if (cow.birth_date > '2019-01-01') {
      insVacc.run(cow.id, 'Brucellosis (S19)', offsetDate('2025-06-01', spread % 30), null, '', farmLabel, 1, 'Single dose for calves 4-8 months at time of vaccination');
    }

    // Theileriosis — annual (staggered across May-Jul)
    if (idx % 3 === 0) {
      insVacc.run(cow.id, 'Theileriosis', offsetDate('2025-05-15', spread % 40), offsetDate('2026-05-15', spread % 40), '', farmLabel, 1, 'Attenuated T. annulata vaccine (Rakshavac-T)');
    }

    // Anthrax — annual (staggered across Jan-Feb)
    insVacc.run(cow.id, 'Anthrax (Sterne Strain)', offsetDate('2025-01-10', spread % 35), offsetDate('2026-01-10', spread % 35), '', farmLabel, 1, 'Annual booster — subcutaneous');

    // Deworming — quarterly (staggered)
    const dw1 = offsetDate('2025-10-01', spread % 28);
    const dw2 = offsetDate('2026-01-01', spread % 28);
    const dw3 = offsetDate('2026-04-01', spread % 28);
    insVacc.run(cow.id, 'Deworming (Albendazole)', dw1, dw2, '', farmLabel, 1, 'Oral drench — 10mg/kg');
    insVacc.run(cow.id, 'Deworming (Albendazole)', dw2, dw3, '', farmLabel, 0, 'Scheduled — next quarterly dose');

    // Deworming (Ivermectin) — every 4 months alternate
    if (idx % 2 === 0) {
      insVacc.run(cow.id, 'Deworming (Ivermectin)', offsetDate('2025-11-15', spread % 20), offsetDate('2026-03-15', spread % 20), '', farmLabel, 1, 'Pour-on — ectoparasite + endoparasite control');
    }
  });

  // Young calves (born 2024-2025) get partial vaccination — also staggered
  const youngCows = db.prepare(`SELECT c.id, c.farmer_id FROM cows c WHERE c.birth_date >= '2024-06-01'`).all();
  youngCows.forEach((cow, idx) => {
    const vet = cow.farmer_id === f1 ? 'Dr. Mehta' : 'Dr. Anita Kaur';
    const spread = idx * 5;
    insVacc.run(cow.id, 'FMD (Foot and Mouth Disease)', offsetDate('2025-09-05', spread % 30), offsetDate('2026-03-05', spread % 30), '', vet, 1, 'First dose at eligible age');
    insVacc.run(cow.id, 'Deworming (Albendazole)', offsetDate('2025-10-20', spread % 25), offsetDate('2026-01-20', spread % 25), '', vet, 1, 'First deworming');
    insVacc.run(cow.id, 'Anthrax (Sterne Strain)', offsetDate('2025-12-01', spread % 20), offsetDate('2026-12-01', spread % 20), '', vet, 1, 'First anthrax vaccination');
    // Upcoming due
    insVacc.run(cow.id, 'Hemorrhagic Septicemia (HS)', offsetDate('2026-04-15', spread % 30), offsetDate('2027-04-15', spread % 30), '', vet, 0, 'Scheduled — pre-monsoon');
    insVacc.run(cow.id, 'Black Quarter (BQ)', offsetDate('2026-04-20', spread % 30), offsetDate('2027-04-20', spread % 30), '', vet, 0, 'Scheduled — pre-monsoon');
  });

  console.log('✅ Vaccination records inserted');

  // ════════════════════════════════════════════════════════
  // HEALTH RECORDS
  // ════════════════════════════════════════════════════════
  const insHealth = db.prepare(`INSERT INTO health_records (cow_id, condition_type, condition_name, diagnosed_date, status, severity, notes) VALUES (?,?,?,?,?,?,?)`);

  // ── Farm 1: Kamdhenu Gaushala (Gir breed) ──
  insHealth.run(rid('KG-GIR-2016-F01'), 'disease', 'Subclinical Mastitis', '2025-04-10', 'treated', 'moderate', 'Detected via CMT (California Mastitis Test). Treated with intramammary Cephalexin. Recovered fully in 7 days.');
  insHealth.run(rid('KG-GIR-2019-F01'), 'metabolic', 'Milk Fever (Hypocalcaemia)', '2025-01-20', 'recovered', 'severe', 'Post-calving calcium deficiency. IV calcium borogluconate administered. Full recovery within 24 hours.');
  insHealth.run(rid('KG-GIR-2020-F02'), 'reproductive', 'Repeat Breeder', '2025-03-05', 'chronic', 'mild', 'Failed to conceive after 3 AI attempts. Hormonal imbalance suspected. Under observation.');
  insHealth.run(rid('KG-GIR-2016-M01'), 'disease', 'Bloat (Ruminal Tympany)', '2025-06-18', 'treated', 'severe', 'Acute frothy bloat after sudden access to lush legume pasture. Treated with trocar cannula for emergency gas relief + poloxalene drench. Resolved in 4 hours.');
  insHealth.run(rid('KG-GIR-2017-F01'), 'disease', 'Bovine Respiratory Disease (BRD)', '2025-02-12', 'treated', 'moderate', 'Nasal discharge, cough, elevated temperature 104.5°F. Treated with Tulathromycin (Draxxin) single injection. Recovered in 5 days.');
  insHealth.run(rid('KG-GIR-2017-M01'), 'parasitic', 'Fascioliasis (Liver Fluke)', '2025-09-05', 'treated', 'moderate', 'Chronic weight loss and bottle jaw. Fecal exam confirmed Fasciola hepatica eggs. Treated with Triclabendazole 12mg/kg. Follow-up in 8 weeks.');
  insHealth.run(rid('KG-GIR-2019-M01'), 'disease', 'Pink Eye (Infectious Bovine Keratoconjunctivitis)', '2025-07-22', 'treated', 'mild', 'Excessive lacrimation and corneal opacity in left eye. Moraxella bovis suspected. Topical oxytetracycline applied. Cleared in 10 days.');
  insHealth.run(rid('KG-GIR-2020-F01'), 'disease', 'Acidosis (Subacute Ruminal)', '2025-05-03', 'recovered', 'moderate', 'Reduced cud chewing, loose stools. Rumen pH 5.4 on sample. Feed ration adjusted — more long fiber added. Sodium bicarbonate drench. Full recovery.');
  insHealth.run(rid('KG-GIR-2021-F01'), 'disease', 'Ringworm (Dermatophytosis)', '2025-08-14', 'treated', 'mild', 'Circular crusty grey lesions on face and neck. Trichophyton verrucosum confirmed. Topical Iodine 7% + Griseofulvin supplement. Clearing in 3 weeks.');
  insHealth.run(rid('KG-GIR-2021-F02'), 'metabolic', 'Ketosis (Acetonaemia)', '2025-04-28', 'recovered', 'moderate', 'Sweet acetone breath odor, rapid weight loss post-calving. Urine ketone strip positive (3+). IV dextrose + oral propylene glycol. Recovered in 3 days.');
  insHealth.run(rid('KG-GIR-2020-M01'), 'disease', 'Papillomatosis (Bovine Warts)', '2025-10-15', 'active', 'mild', 'Multiple cauliflower-like growths on dewlap. Bovine Papillomavirus Type 2. Autogenous vaccine prepared from excised warts. Under treatment.');

  // ── Farm 2: Singh Heritage Dairy (Sahiwal + Red Sindhi) ──
  insHealth.run(rid('SD-SAH-2016-F01'), 'disease', 'Tick Infestation (Boophilus)', '2025-07-15', 'treated', 'mild', 'Ivermectin pour-on applied. Regular dipping schedule initiated.');
  insHealth.run(rid('SD-SAH-2020-M01'), 'disease', 'Foot Rot (Interdigital Necrobacillosis)', '2025-11-20', 'active', 'moderate', 'Currently under treatment — Oxytetracycline + foot bath with CuSO4. Prognosis: good.');
  insHealth.run(rid('SD-RED-2017-F01'), 'genetic', 'Carrier — Bovine Leukocyte Adhesion Deficiency', '2024-08-12', 'chronic', 'mild', 'Detected via genetic screening. Not affected, but carrier. Breeding restricted.');
  insHealth.run(rid('SD-SAH-2016-M01'), 'disease', 'Anaplasmosis (Tick Fever)', '2025-08-28', 'treated', 'severe', 'High fever 106°F, severe anemia (PCV 15%), icterus. Blood smear: Anaplasma marginale confirmed. Treated with Oxytetracycline LA 20mg/kg + supportive iron+B12. Recovered in 2 weeks.');
  insHealth.run(rid('SD-SAH-2019-F01'), 'disease', 'Babesiosis (Red Water Disease)', '2025-06-10', 'treated', 'severe', 'Hemoglobinuria (red urine), fever 105°F. Blood smear: Babesia bigemina. Diminazene aceturate 3.5mg/kg deep IM. Blood transfusion given. Recovered.');
  insHealth.run(rid('SD-SAH-2019-F02'), 'reproductive', 'Retained Placenta', '2025-03-18', 'treated', 'moderate', 'Placenta not expelled within 12 hours post-calving. Manual removal attempted. Intrauterine Lugol iodine wash + systemic antibiotics. Resolved day 5.');
  insHealth.run(rid('SD-SAH-2017-F01'), 'disease', 'Johne\'s Disease (Paratuberculosis)', '2025-01-08', 'chronic', 'severe', 'Chronic persistent diarrhea, progressive weight loss despite good appetite. ELISA positive for MAP antibodies. Confirmatory fecal PCR positive. No cure — isolated from herd. On palliative care.');
  insHealth.run(rid('SD-SAH-2019-M01'), 'disease', 'Coccidiosis', '2025-04-22', 'treated', 'moderate', 'Bloody diarrhea, straining, weight loss. Fecal oocyst count: 8500 OPG. Treated with Amprolium 10mg/kg × 5 days + fluid therapy. Full recovery.');
  insHealth.run(rid('SD-SAH-2017-M01'), 'disease', 'Trypanosomiasis (Surra)', '2025-09-12', 'treated', 'severe', 'Progressive emaciation, intermittent fever, lacrimation. Blood smear: Trypanosoma evansi flagellates. Treated with Diminazene aceturate. Improved in 1 week.');
  insHealth.run(rid('SD-SAH-2020-F01'), 'disease', 'Dermatophilosis (Rain Scald)', '2025-07-30', 'treated', 'mild', 'Crusty scab lesions on dorsum after monsoon. Dermatophilus congolensis confirmed. Parenteral Penicillin-Streptomycin + topical chlorhexidine. Cleared in 2 weeks.');
  insHealth.run(rid('SD-SAH-2021-F01'), 'disease', 'Bovine Viral Diarrhea (BVD)', '2025-05-18', 'treated', 'moderate', 'Mucosal erosions, diarrhea, fever. Antigen ELISA: BVD positive (transient infection, not PI). Supportive care + NSAIDs. Recovered in 10 days. Re-tested negative.');
  insHealth.run(rid('SD-RED-2017-F01'), 'disease', 'Theileriosis (Tropical)', '2025-09-25', 'treated', 'severe', 'High fever 106°F, enlarged lymph nodes, anemia. Blood smear: Theileria annulata schizonts in lymphocytes. Treated with Buparvaquone 2.5mg/kg IM. Recovered after 2 doses.');

  console.log('✅ Health records inserted');

  // ════════════════════════════════════════════════════════
  // VET REPORTS
  // ════════════════════════════════════════════════════════
  const insReport = db.prepare(`INSERT INTO vet_reports (cow_id, vet_id, report_type, diagnosis, treatment, symptoms, severity, status) VALUES (?,?,?,?,?,?,?,?)`);

  insReport.run(rid('KG-GIR-2016-M01'), 1, 'health', 'Annual health checkup — Fit for breeding', 'No treatment required. Body condition score: 3.5/5.', 'None — routine exam', 'mild', 'completed');
  insReport.run(rid('KG-GIR-2016-F01'), 1, 'dna', 'DNA Verified — A2A2 homozygous genotype confirmed via PCR', 'N/A', 'N/A', null, 'completed');
  insReport.run(rid('KG-GIR-2019-F01'), 1, 'health', 'Post-partum examination — normal recovery', 'Calcium + mineral supplement prescribed', 'Mild lethargy post-calving', 'moderate', 'completed');
  insReport.run(rid('SD-SAH-2016-M01'), 2, 'dna', 'DNA Verified — A2A2 genotype. Lineage purity confirmed via microsatellite analysis.', 'N/A', 'N/A', null, 'completed');
  insReport.run(rid('SD-SAH-2020-M01'), 2, 'health', 'Foot Rot — active treatment', 'Oxytetracycline LA injection + CuSO4 foot bath daily', 'Lameness in left hind foot, swelling between digits', 'moderate', 'completed');
  insReport.run(rid('SD-SAH-2019-F01'), 2, 'vaccination', 'Annual vaccination compliance verified', 'All mandatory vaccines administered on schedule', 'None', 'mild', 'completed');

  console.log('✅ Vet reports inserted');

  // ════════════════════════════════════════════════════════
  // MATING COMPATIBILITY
  // ════════════════════════════════════════════════════════
  const insComp = db.prepare(`INSERT INTO mating_compatibility (cow_id, bull_id, compatibility_score, genetic_diversity_score, health_compatibility_score, breed_match, inbreeding_risk, common_ancestor_generations, recommendation_rank, notes) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  const matureFemales = db.prepare(`SELECT id, breed, farmer_id, father_id, mother_id FROM cows WHERE gender='female' AND birth_date < '2023-06-01'`).all();
  const matureMales = db.prepare(`SELECT id, breed, farmer_id, father_id, mother_id FROM cows WHERE gender='male' AND birth_date < '2023-06-01'`).all();

  matureFemales.forEach(cow => {
    let rank = 1;
    matureMales.forEach(bull => {
      if (cow.id === bull.id) return;
      const related = (cow.father_id === bull.id || cow.mother_id === bull.id || cow.father_id === bull.father_id || cow.mother_id === bull.mother_id);
      const breedMatch = cow.breed === bull.breed;
      const crossFarm = cow.farmer_id !== bull.farmer_id;
      const genScore = related ? 35 : (crossFarm ? 97 : 88);
      const healthScore = rng(80, 95);
      const total = Math.round((genScore * 0.6 + healthScore * 0.4) + (breedMatch ? 5 : -10) + (crossFarm ? 5 : 0));
      const risk = related ? 'high' : (crossFarm ? 'none' : 'low');

      if (!related && rank <= 3) {
        insComp.run(cow.id, bull.id, Math.min(total, 98), genScore, healthScore, breedMatch ? 1 : 0, risk, related ? 2 : null, rank,
          crossFarm ? 'Excellent — cross-farm pairing maximizes genetic diversity' : (breedMatch ? 'Good — same breed, different lineage' : 'Acceptable — cross-breed for hybrid vigour'));
        rank++;
      }
    });
  });
  console.log('✅ Mating compatibility inserted');

  // ════════════════════════════════════════════════════════
  // MILK RECORDS — 14 days for milking cows
  // Breed-accurate yields: Sahiwal 8-14L/day, Gir 6-12L/day
  // ════════════════════════════════════════════════════════
  const insMilk = db.prepare(`INSERT INTO milk_records (cow_id, farmer_id, quantity_liters, collection_time, collection_date, quality_grade, batch_id) VALUES (?,?,?,?,?,?,?)`);
  const insBatch = db.prepare(`INSERT OR IGNORE INTO milk_batches (batch_code, farmer_id, cow_id, collection_date, quantity_liters, is_a2, cow_breed, farm_location, dna_verified, qr_data) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  const milkingCows = db.prepare(`
    SELECT c.id, c.rfid_number, c.breed, c.farmer_id, c.dna_status, f.location, g.a2_gene_status
    FROM cows c JOIN farmers f ON c.farmer_id=f.id LEFT JOIN cow_genetics g ON c.id=g.cow_id
    WHERE c.gender='female' AND c.birth_date < '2022-01-01'
  `).all();

  // Breed-specific daily yield ranges (morning session)
  const yieldMap = { 'Gir': [3.2, 5.8], 'Sahiwal': [4.0, 6.5], 'Red Sindhi': [2.8, 4.2], 'Kankrej': [2.5, 3.8], 'Tharparkar': [3.0, 4.5] };

  const dates14 = [];
  for (let d = 22; d <= 28; d++) dates14.push(`2026-02-${d.toString().padStart(2, '0')}`);
  for (let d = 1; d <= 7; d++) dates14.push(`2026-03-${d.toString().padStart(2, '0')}`);

  milkingCows.forEach(cow => {
    const [minY, maxY] = yieldMap[cow.breed] || [3, 5];
    dates14.forEach(date => {
      const am = +(minY + Math.random() * (maxY - minY)).toFixed(1);
      const pm = +(am * (0.7 + Math.random() * 0.2)).toFixed(1);
      const batchCode = `BATCH-${cow.rfid_number}-${date}`;
      const isA2 = (cow.a2_gene_status === 'A2A2') ? 1 : 0;

      insMilk.run(cow.id, cow.farmer_id, am, 'morning', date, 'A', batchCode);
      insMilk.run(cow.id, cow.farmer_id, pm, 'evening', date, 'A', batchCode);

      const qr = JSON.stringify({
        batch: batchCode, breed: cow.breed, farm: cow.location,
        dna_verified: cow.dna_status === 'verified', a2: cow.a2_gene_status || 'unknown',
        date, total_liters: +(am + pm).toFixed(1)
      });
      insBatch.run(batchCode, cow.farmer_id, cow.id, date, +(am + pm).toFixed(1), isA2, cow.breed, cow.location, cow.dna_status === 'verified' ? 1 : 0, qr);
    });
  });
  console.log('✅ Milk records (14 days) + batches inserted');

  // ════════════════════════════════════════════════════════
  // MARKETPLACE — genuine Indian dairy prices
  // ════════════════════════════════════════════════════════
  const insProd = db.prepare(`INSERT INTO marketplace_products (farmer_id, product_name, product_type, description, price, unit, stock_quantity, is_verified, is_a2_certified, status) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  // Farm 1 products (Gujarat, Gir-based)
  insProd.run(f1, 'Gir Cow A2 Milk — Farm Fresh', 'milk', 'Pure A2 beta-casein milk from DNA-verified Gir cows of Junagadh. Raw, unprocessed, delivered same-day.', 95, 'liter', 120, 1, 1, 'active');
  insProd.run(f1, 'Bilona Ghee — Gir Cow A2', 'ghee', 'Traditional hand-churned bilona ghee from Gir A2 milk. Curd-route method, wood-fired. Golden granular texture.', 1200, 'kg', 15, 1, 1, 'active');
  insProd.run(f1, 'Gir Cow Panchagavya Kit', 'other', 'Organic panchagavya (5 cow products) kit for agricultural use. Prepared from verified Gir cows.', 350, 'kit', 25, 1, 1, 'active');
  insProd.run(f1, 'A2 Curd — Set Dahi', 'curd', 'Thick set curd from Gir cow A2 milk. No preservatives. Culture-based fermentation.', 80, 'kg', 30, 1, 1, 'active');
  insProd.run(f1, 'Cow Dung Cakes — Organic', 'other', 'Sun-dried gobar for havans, agnihotra, composting. Pack of 20 cakes.', 150, 'pack', 100, 1, 0, 'active');

  // Farm 2 products (Punjab, Sahiwal-based)
  insProd.run(f2, 'Sahiwal A2 Full Cream Milk', 'milk', 'High-fat Sahiwal A2 milk, 4.5% fat content. Fresh from Fazilka farms. Ideal for sweets & chai.', 85, 'liter', 200, 1, 1, 'active');
  insProd.run(f2, 'Desi Makhan — Sahiwal', 'butter', 'Hand-churned white butter (makhan) from Sahiwal cream. Unsalted, fresh daily.', 600, 'kg', 10, 1, 1, 'active');
  insProd.run(f2, 'Paneer — Full Fat A2', 'paneer', 'Fresh paneer from Sahiwal A2 milk. Soft, supple texture. No additives.', 450, 'kg', 8, 1, 1, 'active');
  insProd.run(f2, 'Lassi — Sweet Punjabi', 'other', 'Traditional Punjabi lassi from Sahiwal curd. 500ml bottles, served chilled.', 40, 'bottle', 50, 1, 0, 'active');
  insProd.run(f2, 'Sahiwal Ghee — Vedic Method', 'ghee', 'Slow-cooked ghee from Sahiwal A2 milk using Vedic bilona process. Cow-positive farm.', 1100, 'kg', 12, 1, 1, 'active');

  console.log('✅ Marketplace products inserted');

  // ─── Sample Orders ───
  const insOrder = db.prepare(`INSERT INTO orders (product_id, buyer_name, buyer_phone, buyer_address, quantity, total_price, status) VALUES (?,?,?,?,?,?,?)`);
  insOrder.run(1, 'Amit Verma', '+91-9900112233', '12/B, Satellite Road, Ahmedabad', 10, 950, 'delivered');
  insOrder.run(1, 'Neha Joshi', '+91-9900445566', '45, Vastrapur, Ahmedabad', 5, 475, 'shipped');
  insOrder.run(2, 'Kunal Shah', '+91-9900778899', '7, C.G. Road, Rajkot', 2, 2400, 'confirmed');
  insOrder.run(6, 'Harpreet Kaur', '+91-9800112233', '22, Model Town, Ludhiana', 20, 1700, 'delivered');
  insOrder.run(8, 'Vikram Bajwa', '+91-9800445566', '8, Sector 17, Chandigarh', 3, 1350, 'shipped');
  insOrder.run(7, 'Simran Gill', '+91-9800778899', '15, Lawrence Road, Amritsar', 1, 600, 'delivered');
  console.log('✅ Orders inserted');

  // ════════════════════════════════════════════════════════
  // INSURANCE — Indian livestock insurance providers
  // ════════════════════════════════════════════════════════
  const insPolicy = db.prepare(`INSERT INTO insurance_policies (cow_id, farmer_id, policy_number, provider, coverage_type, premium_amount, coverage_amount, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  const verifiedCows = db.prepare(`SELECT id, farmer_id FROM cows WHERE is_verified=1`).all();
  const providers = [
    { name: 'National Insurance Company Ltd.', types: ['basic','standard','premium'], premiums: [1500,3200,5500], coverages: [30000,65000,120000] },
    { name: 'United India Insurance Co.', types: ['basic','standard','premium'], premiums: [1400,3000,5200], coverages: [28000,60000,110000] },
    { name: 'IFFCO Tokio General Insurance', types: ['basic','standard','premium'], premiums: [1600,3500,6000], coverages: [32000,70000,130000] },
  ];

  verifiedCows.slice(0, 8).forEach((cow, i) => {
    const prov = providers[i % 3];
    const tier = i % 3;
    const polNum = `GS-LIP-2026-${(i + 1).toString().padStart(4, '0')}`;
    insPolicy.run(cow.id, cow.farmer_id, polNum,
      prov.name, prov.types[tier], prov.premiums[tier], prov.coverages[tier], '2026-01-01', '2027-01-01', 'active');
  });
  console.log('✅ Insurance policies inserted');

  // ════════════════════════════════════════════════════════
  // DISEASE ALERTS — real Indian cattle disease scenarios
  // ════════════════════════════════════════════════════════
  const insAlert = db.prepare(`INSERT INTO disease_alerts (disease_name, region, severity, affected_count, alert_date, status, description) VALUES (?,?,?,?,?,?,?)`);

  insAlert.run('Foot and Mouth Disease (FMD)', 'Gujarat — Junagadh District', 'high', 34,
    '2026-02-10', 'active', 'FMD serotype O outbreak in Junagadh taluka. 34 cattle affected across 8 farms. Ring vaccination within 10km radius ordered by District Animal Husbandry Officer.');
  insAlert.run('Lumpy Skin Disease (LSD)', 'Punjab — Fazilka District', 'medium', 12,
    '2026-02-25', 'active', 'Sporadic LSD cases in border villages. Goat-pox vaccine prophylaxis initiated for all cattle within affected panchayats.');
  insAlert.run('Brucellosis', 'Rajasthan — Barmer', 'low', 5,
    '2026-01-15', 'active', 'Isolated brucellosis cases in nomadic Rathi cattle herds. RBPT screening of all contact animals underway.');
  insAlert.run('Hemorrhagic Septicemia (HS)', 'Maharashtra — Satara', 'high', 18,
    '2025-09-05', 'resolved', 'Post-monsoon HS outbreak contained. Emergency vaccination of 2,400 cattle completed. Zero mortality after intervention.');
  insAlert.run('Theileriosis (Tropical)', 'Karnataka — Dharwad', 'medium', 9,
    '2026-03-01', 'active', 'Tick-borne theileriosis in crossbred cattle. Acaricide spray campaign initiated. Indigenous breeds appear resistant.');
  insAlert.run('Black Quarter (BQ)', 'Madhya Pradesh — Indore', 'low', 3,
    '2026-01-28', 'resolved', 'BQ detected in 3 young cattle. Immediate vaccine administration. No further spread. Soil contamination source identified.');

  console.log('✅ Disease alerts inserted');

  // ════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════
  const totalCows = db.prepare('SELECT count(*) as c FROM cows').get().c;
  const totalVacc = db.prepare('SELECT count(*) as c FROM vaccinations').get().c;
  const totalMilk = db.prepare('SELECT count(*) as c FROM milk_records').get().c;

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database initialization complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📊 ${totalCows} cattle | ${totalVacc} vaccinations | ${totalMilk} milk records`);
  console.log('');
  console.log('   🧑‍🌾 FARMERS:');
  console.log('   demo@farmer.com / demo123  (Kamdhenu Gaushala, Gujarat — 25 cattle)');
  console.log('   raj@farm.com / demo123     (Singh Heritage Dairy, Punjab — 25 cattle)');
  console.log('   priya@farm.com / demo123   (Narmada Organic Farm, Gujarat)');
  console.log('');
  console.log('   🩺 VETERINARIANS:');
  console.log('   dr.mehta@vet.com / demo123 (Gujarat)');
  console.log('   dr.kumar@vet.com / demo123 (Punjab)');
  console.log('');
  console.log('   🏛️  GOVERNMENT:');
  console.log('   gov.mh@govt.com / demo123     (Maharashtra — State level)');
  console.log('   gov.pb@govt.com / demo123     (Punjab — District level)');
  console.log('   gov.national@govt.com / demo123 (National — DAHD)');
  console.log('');
  console.log('   📱 Mock OTP: 123456 (any phone number)');
  console.log('');
};

try {
  initDatabase();
  seedDemoData();
} catch (error) {
  console.error('❌ Database initialization error:', error);
  process.exit(1);
}

module.exports = db;
