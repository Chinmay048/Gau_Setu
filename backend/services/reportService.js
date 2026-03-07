const { getDatabase } = require('../database/db');

// ─── Create Health Report ────────────────────────────────

const createHealthReport = (reportData) => {
  const db = getDatabase();
  const { cowId, vetId, reportType, diagnosis, treatment, symptoms, severity } = reportData;

  // Verify cow exists
  const cow = db.prepare('SELECT id FROM cows WHERE id = ?').get(cowId);
  if (!cow) throw new Error('Cow not found');

  const result = db.prepare(`
    INSERT INTO vet_reports (cow_id, vet_id, report_type, diagnosis, treatment, symptoms, severity, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
  `).run(cowId, vetId, reportType || 'health', diagnosis, treatment, symptoms, severity);

  return getReportById(result.lastInsertRowid);
};

// ─── Submit Health Report ────────────────────────────────

const submitHealthReport = (reportId, vetId, reportPdf) => {
  const db = getDatabase();

  const report = db.prepare('SELECT * FROM vet_reports WHERE id = ? AND vet_id = ?').get(reportId, vetId);
  if (!report) throw new Error('Report not found or not authorized');

  db.prepare('UPDATE vet_reports SET status = ?, report_pdf = ? WHERE id = ?')
    .run('completed', reportPdf || null, reportId);

  // If it's a DNA report, update cow's DNA status
  if (report.report_type === 'dna') {
    db.prepare('UPDATE cows SET dna_status = ? WHERE id = ?').run('verified', report.cow_id);
  }

  // If health report, add to health_records
  if (report.report_type === 'health' && report.diagnosis) {
    db.prepare(`
      INSERT INTO health_records (cow_id, condition_type, condition_name, diagnosed_date, status, severity, notes)
      VALUES (?, 'disease', ?, date('now'), 'active', ?, ?)
    `).run(report.cow_id, report.diagnosis, report.severity || 'moderate', report.treatment);
  }

  return getReportById(reportId);
};

// ─── Upload DNA Verification ─────────────────────────────

const uploadDNAVerification = (cowId, vetId, dnaReportUrl, geneticsData) => {
  const db = getDatabase();

  // Create the vet report
  const result = db.prepare(`
    INSERT INTO vet_reports (cow_id, vet_id, report_type, diagnosis, treatment, report_pdf, status)
    VALUES (?, ?, 'dna', 'DNA Verification Report', 'N/A', ?, 'completed')
  `).run(cowId, vetId, dnaReportUrl || '');

  // Update cow DNA status
  db.prepare('UPDATE cows SET dna_status = ?, dna_report_url = ? WHERE id = ?')
    .run('verified', dnaReportUrl || '', cowId);

  // Insert/update genetics data
  if (geneticsData) {
    const existing = db.prepare('SELECT id FROM cow_genetics WHERE cow_id = ?').get(cowId);
    if (existing) {
      db.prepare(`
        UPDATE cow_genetics SET a2_gene_status = ?, heat_tolerance = ?, disease_resistance = ?, milk_yield_potential = ?, lineage_purity = ?
        WHERE cow_id = ?
      `).run(
        geneticsData.a2GeneStatus || 'unknown',
        geneticsData.heatTolerance || 50,
        geneticsData.diseaseResistance || 50,
        geneticsData.milkYieldPotential || 50,
        geneticsData.lineagePurity || 50,
        cowId
      );
    } else {
      db.prepare(`
        INSERT INTO cow_genetics (cow_id, a2_gene_status, heat_tolerance, disease_resistance, milk_yield_potential, lineage_purity)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        cowId,
        geneticsData.a2GeneStatus || 'unknown',
        geneticsData.heatTolerance || 50,
        geneticsData.diseaseResistance || 50,
        geneticsData.milkYieldPotential || 50,
        geneticsData.lineagePurity || 50
      );
    }
  }

  return getReportById(result.lastInsertRowid);
};

// ─── Verify Vaccination ──────────────────────────────────

const verifyVaccination = (vaccinationId, vetId) => {
  const db = getDatabase();

  const vaccination = db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(vaccinationId);
  if (!vaccination) throw new Error('Vaccination record not found');

  db.prepare('UPDATE vaccinations SET verified = 1, vet_id = ? WHERE id = ?')
    .run(vetId, vaccinationId);

  return db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(vaccinationId);
};

// ─── Get Reports ─────────────────────────────────────────

const getReportsByCow = (cowId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, v.name as vet_name, v.clinic_name as vet_clinic
    FROM vet_reports r
    JOIN vets v ON r.vet_id = v.id
    WHERE r.cow_id = ?
    ORDER BY r.created_at DESC
  `).all(cowId).map(formatReport);
};

const getReportsByVet = (vetId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, c.rfid_number as cow_rfid, c.breed as cow_breed
    FROM vet_reports r
    JOIN cows c ON r.cow_id = c.id
    WHERE r.vet_id = ?
    ORDER BY r.created_at DESC
  `).all(vetId).map(formatReport);
};

const getReportById = (id) => {
  const db = getDatabase();
  const r = db.prepare(`
    SELECT r.*, v.name as vet_name, v.clinic_name as vet_clinic, c.rfid_number as cow_rfid
    FROM vet_reports r
    JOIN vets v ON r.vet_id = v.id
    JOIN cows c ON r.cow_id = c.id
    WHERE r.id = ?
  `).get(id);
  return r ? formatReport(r) : null;
};

const formatReport = (r) => ({
  id: r.id,
  cowId: r.cow_id,
  cowRFID: r.cow_rfid,
  cowBreed: r.cow_breed,
  vetId: r.vet_id,
  vetName: r.vet_name,
  vetClinic: r.vet_clinic,
  reportType: r.report_type,
  diagnosis: r.diagnosis,
  treatment: r.treatment,
  symptoms: r.symptoms,
  severity: r.severity,
  reportPdf: r.report_pdf,
  status: r.status,
  createdAt: r.created_at,
});

module.exports = {
  createHealthReport,
  submitHealthReport,
  uploadDNAVerification,
  verifyVaccination,
  getReportsByCow,
  getReportsByVet,
};
