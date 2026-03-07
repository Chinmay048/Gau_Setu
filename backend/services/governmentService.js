const { getDatabase } = require('../database/db');

/**
 * Government Analytics Dashboard
 * Provides aggregated data for government officials
 */

// ─── Regional Cattle Population ──────────────────────────

const getRegionalStats = (region) => {
  const db = getDatabase();

  let regionFilter = '';
  const params = [];
  if (region && region !== 'India') {
    regionFilter = 'WHERE f.location LIKE ?';
    params.push(`%${region}%`);
  }

  const totalCattle = db.prepare(`
    SELECT COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter}
  `).get(...params).count;

  const totalFarmers = db.prepare(`
    SELECT COUNT(DISTINCT c.farmer_id) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter}
  `).get(...params).count;

  const byGender = db.prepare(`
    SELECT c.gender, COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter} GROUP BY c.gender
  `).all(...params);

  const byBreed = db.prepare(`
    SELECT c.breed, COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter} GROUP BY c.breed ORDER BY count DESC
  `).all(...params);

  const verifiedCattle = db.prepare(`
    SELECT COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter ? regionFilter + ' AND' : 'WHERE'} c.is_verified = 1
  `).get(...params).count;

  const dnaVerified = db.prepare(`
    SELECT COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id ${regionFilter ? regionFilter + ' AND' : 'WHERE'} c.dna_status = 'verified'
  `).get(...params).count;

  return {
    region: region || 'All India',
    totalCattle,
    totalFarmers,
    verifiedCattle,
    dnaVerified,
    verificationRate: totalCattle > 0 ? Math.round((verifiedCattle / totalCattle) * 100) : 0,
    genderBreakdown: byGender.map(g => ({ gender: g.gender, count: g.count })),
    breedDistribution: byBreed.map(b => ({ breed: b.breed || 'Unknown', count: b.count })),
  };
};

// ─── Indigenous Breed Statistics ──────────────────────────

const getBreedStatistics = (region) => {
  const db = getDatabase();

  const indigenousBreeds = ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Rathi', 'Ongole', 'Kangayam', 'Hallikar', 'Amritmahal', 'Deoni'];

  let regionFilter = '';
  const params = [];
  if (region && region !== 'India') {
    regionFilter = 'AND f.location LIKE ?';
    params.push(`%${region}%`);
  }

  const breedData = db.prepare(`
    SELECT c.breed, COUNT(*) as count,
           SUM(CASE WHEN c.dna_status = 'verified' THEN 1 ELSE 0 END) as dna_verified,
           SUM(CASE WHEN c.is_verified = 1 THEN 1 ELSE 0 END) as fully_verified
    FROM cows c
    JOIN farmers f ON c.farmer_id = f.id
    WHERE c.breed IS NOT NULL ${regionFilter}
    GROUP BY c.breed
    ORDER BY count DESC
  `).all(...params);

  const totalCattle = breedData.reduce((sum, b) => sum + b.count, 0);
  const indigenousCount = breedData.filter(b => indigenousBreeds.includes(b.breed)).reduce((sum, b) => sum + b.count, 0);

  // A2 gene stats
  const a2Stats = db.prepare(`
    SELECT g.a2_gene_status, COUNT(*) as count
    FROM cow_genetics g
    JOIN cows c ON g.cow_id = c.id
    JOIN farmers f ON c.farmer_id = f.id
    WHERE g.a2_gene_status != 'unknown' ${regionFilter}
    GROUP BY g.a2_gene_status
  `).all(...params);

  return {
    region: region || 'All India',
    totalCattle,
    indigenousCount,
    indigenousPercentage: totalCattle > 0 ? Math.round((indigenousCount / totalCattle) * 100) : 0,
    breeds: breedData.map(b => ({
      breed: b.breed,
      count: b.count,
      percentage: totalCattle > 0 ? parseFloat(((b.count / totalCattle) * 100).toFixed(1)) : 0,
      dnaVerified: b.dna_verified,
      fullyVerified: b.fully_verified,
      isIndigenous: indigenousBreeds.includes(b.breed),
    })),
    a2GeneDistribution: a2Stats.map(s => ({ status: s.a2_gene_status, count: s.count })),
  };
};

// ─── Vaccination Coverage ────────────────────────────────

const getVaccinationCoverage = (region) => {
  const db = getDatabase();

  let regionFilter = '';
  const params = [];
  if (region && region !== 'India') {
    regionFilter = 'AND f.location LIKE ?';
    params.push(`%${region}%`);
  }

  const totalCattle = db.prepare(`SELECT COUNT(*) as count FROM cows c JOIN farmers f ON c.farmer_id = f.id WHERE 1=1 ${regionFilter}`).get(...params).count;

  const vaccinatedCattle = db.prepare(`
    SELECT COUNT(DISTINCT v.cow_id) as count
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    JOIN farmers f ON c.farmer_id = f.id
    WHERE 1=1 ${regionFilter}
  `).get(...params).count;

  const byVaccine = db.prepare(`
    SELECT v.vaccine_name, COUNT(DISTINCT v.cow_id) as cattle_count
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    JOIN farmers f ON c.farmer_id = f.id
    WHERE 1=1 ${regionFilter}
    GROUP BY v.vaccine_name
    ORDER BY cattle_count DESC
  `).all(...params);

  const overdue = db.prepare(`
    SELECT COUNT(DISTINCT v.cow_id) as count
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    JOIN farmers f ON c.farmer_id = f.id
    WHERE v.next_due_date < date('now') AND v.next_due_date IS NOT NULL ${regionFilter}
  `).get(...params).count;

  return {
    region: region || 'All India',
    totalCattle,
    vaccinatedCattle,
    coveragePercent: totalCattle > 0 ? Math.round((vaccinatedCattle / totalCattle) * 100) : 0,
    overdueVaccinations: overdue,
    byVaccine: byVaccine.map(v => ({
      vaccineName: v.vaccine_name,
      cattleCount: v.cattle_count,
      coveragePercent: totalCattle > 0 ? Math.round((v.cattle_count / totalCattle) * 100) : 0,
    })),
  };
};

// ─── Disease Alerts ──────────────────────────────────────

const getDiseaseAlerts = (region) => {
  const db = getDatabase();

  let query = 'SELECT * FROM disease_alerts';
  const params = [];
  if (region && region !== 'India') {
    query += ' WHERE region LIKE ?';
    params.push(`%${region}%`);
  }
  query += ' ORDER BY alert_date DESC';

  const alerts = db.prepare(query).all(...params);

  return alerts.map(a => ({
    id: a.id,
    diseaseName: a.disease_name,
    region: a.region,
    severity: a.severity,
    affectedCount: a.affected_count,
    alertDate: a.alert_date,
    status: a.status,
    description: a.description,
  }));
};

// ─── Create Disease Alert ────────────────────────────────

const createDiseaseAlert = (alertData) => {
  const db = getDatabase();
  const { diseaseName, region, severity, affectedCount, description, reportedBy } = alertData;

  const result = db.prepare(`
    INSERT INTO disease_alerts (disease_name, region, severity, affected_count, alert_date, status, description, reported_by)
    VALUES (?, ?, ?, ?, date('now'), 'active', ?, ?)
  `).run(diseaseName, region, severity || 'medium', affectedCount || 1, description || '', reportedBy || null);

  return db.prepare('SELECT * FROM disease_alerts WHERE id = ?').get(result.lastInsertRowid);
};

// ─── Dashboard Summary ───────────────────────────────────

const getDashboardSummary = (region) => {
  const db = getDatabase();

  const cattleStats = getRegionalStats(region);
  const breedStats = getBreedStatistics(region);
  const vaccinationStats = getVaccinationCoverage(region);
  const alerts = getDiseaseAlerts(region);

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return {
    region: region || 'All India',
    overview: {
      totalCattle: cattleStats.totalCattle,
      totalFarmers: cattleStats.totalFarmers,
      verifiedCattle: cattleStats.verifiedCattle,
      verificationRate: cattleStats.verificationRate,
      indigenousPercentage: breedStats.indigenousPercentage,
      vaccinationCoverage: vaccinationStats.coveragePercent,
      activeAlerts: activeAlerts.length,
    },
    cattleStats,
    breedStats,
    vaccinationStats,
    diseaseAlerts: activeAlerts.slice(0, 10),
  };
};

module.exports = {
  getRegionalStats,
  getBreedStatistics,
  getVaccinationCoverage,
  getDiseaseAlerts,
  createDiseaseAlert,
  getDashboardSummary,
};
