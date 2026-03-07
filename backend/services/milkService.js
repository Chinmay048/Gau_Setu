const { getDatabase } = require('../database/db');
const crypto = require('crypto');

/**
 * Phase 3: Milk Production Tracking & QR System
 */

// ─── Log Milk Production ─────────────────────────────────

const logMilkProduction = (farmerId, cowId, quantityLiters, collectionTime, collectionDate, qualityGrade) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT c.*, g.a2_gene_status, f.location as farm_location FROM cows c LEFT JOIN cow_genetics g ON c.id = g.cow_id JOIN farmers f ON c.farmer_id = f.id WHERE c.id = ? AND c.farmer_id = ?')
    .get(cowId, farmerId);
  if (!cow) throw new Error('Cow not found or not authorized');
  if (cow.gender !== 'female') throw new Error('Milk records are only for female cows');

  const date = collectionDate || new Date().toISOString().split('T')[0];
  const time = collectionTime || 'morning';
  const batchCode = `GS-${cow.rfid_number}-${date}-${time.charAt(0).toUpperCase()}`;

  const result = db.prepare(`
    INSERT INTO milk_records (cow_id, farmer_id, quantity_liters, collection_time, collection_date, quality_grade, batch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(cowId, farmerId, quantityLiters, time, date, qualityGrade || 'A', batchCode);

  // Create milk batch
  const isA2 = cow.a2_gene_status === 'A2A2' ? 1 : 0;
  const qrData = JSON.stringify({
    batch: batchCode,
    cow_rfid: cow.rfid_number,
    cow_breed: cow.breed,
    farm_location: cow.farm_location,
    dna_verified: cow.dna_status === 'verified',
    a2_status: cow.a2_gene_status || 'unknown',
    collection_date: date,
    collection_time: time,
    quantity: quantityLiters,
  });

  // Upsert batch (accumulate if same day)
  const existingBatch = db.prepare('SELECT * FROM milk_batches WHERE batch_code = ?').get(batchCode);
  if (existingBatch) {
    db.prepare('UPDATE milk_batches SET quantity_liters = quantity_liters + ? WHERE batch_code = ?')
      .run(quantityLiters, batchCode);
  } else {
    db.prepare(`
      INSERT INTO milk_batches (batch_code, farmer_id, cow_id, collection_date, quantity_liters, is_a2, cow_breed, farm_location, dna_verified, qr_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(batchCode, farmerId, cowId, date, quantityLiters, isA2, cow.breed, cow.farm_location, cow.dna_status === 'verified' ? 1 : 0, qrData);
  }

  return {
    id: result.lastInsertRowid,
    batchCode,
    cowRFID: cow.rfid_number,
    quantityLiters,
    collectionTime: time,
    collectionDate: date,
    qualityGrade: qualityGrade || 'A',
    isA2: isA2 === 1,
    milkLabel: isA2 ? 'Verified A2 Milk' : 'Standard Milk',
  };
};

// ─── Get Milk Records by Farmer ──────────────────────────

const getMilkRecordsByFarmer = (farmerId, dateFrom, dateTo) => {
  const db = getDatabase();

  let query = `
    SELECT mr.*, c.rfid_number, c.breed, g.a2_gene_status
    FROM milk_records mr
    JOIN cows c ON mr.cow_id = c.id
    LEFT JOIN cow_genetics g ON c.id = g.cow_id
    WHERE mr.farmer_id = ?
  `;
  const params = [farmerId];

  if (dateFrom) {
    query += ' AND mr.collection_date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    query += ' AND mr.collection_date <= ?';
    params.push(dateTo);
  }

  query += ' ORDER BY mr.collection_date DESC, mr.collection_time ASC';

  const records = db.prepare(query).all(...params);

  // Summary
  const totalLiters = records.reduce((sum, r) => sum + r.quantity_liters, 0);
  const a2Liters = records.filter(r => r.a2_gene_status === 'A2A2').reduce((sum, r) => sum + r.quantity_liters, 0);

  return {
    records: records.map(r => ({
      id: r.id,
      cowRFID: r.rfid_number,
      breed: r.breed,
      quantityLiters: r.quantity_liters,
      collectionTime: r.collection_time,
      collectionDate: r.collection_date,
      qualityGrade: r.quality_grade,
      batchId: r.batch_id,
      isA2: r.a2_gene_status === 'A2A2',
    })),
    summary: {
      totalRecords: records.length,
      totalLiters: parseFloat(totalLiters.toFixed(1)),
      a2Liters: parseFloat(a2Liters.toFixed(1)),
      standardLiters: parseFloat((totalLiters - a2Liters).toFixed(1)),
    },
  };
};

// ─── Get Milk Batch by QR Code ───────────────────────────

const getMilkBatchByCode = (batchCode) => {
  const db = getDatabase();

  const batch = db.prepare(`
    SELECT mb.*, f.farm_name, f.location as farm_location_name
    FROM milk_batches mb
    JOIN farmers f ON mb.farmer_id = f.id
    WHERE mb.batch_code = ?
  `).get(batchCode);

  if (!batch) throw new Error('Batch not found');

  return {
    batchCode: batch.batch_code,
    cowBreed: batch.cow_breed,
    farmName: batch.farm_name,
    farmLocation: batch.farm_location_name || batch.farm_location,
    collectionDate: batch.collection_date,
    quantityLiters: batch.quantity_liters,
    dnaVerified: batch.dna_verified === 1,
    isA2: batch.is_a2 === 1,
    a2Status: batch.is_a2 === 1 ? 'A2A2' : 'Standard',
    milkLabel: batch.is_a2 === 1 ? 'Verified A2 Milk' : 'Standard Milk',
    qrData: batch.qr_data ? JSON.parse(batch.qr_data) : null,
    verificationUrl: `/api/milk/verify/${batch.batch_code}`,
  };
};

// ─── Get Milk Production Stats ───────────────────────────

const getMilkStats = (farmerId) => {
  const db = getDatabase();

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayTotal = db.prepare('SELECT COALESCE(SUM(quantity_liters), 0) as total FROM milk_records WHERE farmer_id = ? AND collection_date = ?')
    .get(farmerId, today).total;

  const weekTotal = db.prepare('SELECT COALESCE(SUM(quantity_liters), 0) as total FROM milk_records WHERE farmer_id = ? AND collection_date >= ?')
    .get(farmerId, weekAgo).total;

  const dailyAvg = db.prepare(`
    SELECT COALESCE(AVG(daily_total), 0) as avg FROM (
      SELECT SUM(quantity_liters) as daily_total FROM milk_records WHERE farmer_id = ? AND collection_date >= ? GROUP BY collection_date
    )
  `).get(farmerId, weekAgo).avg;

  const topProducers = db.prepare(`
    SELECT c.rfid_number, c.breed, SUM(mr.quantity_liters) as total_liters
    FROM milk_records mr
    JOIN cows c ON mr.cow_id = c.id
    WHERE mr.farmer_id = ? AND mr.collection_date >= ?
    GROUP BY mr.cow_id
    ORDER BY total_liters DESC
    LIMIT 5
  `).all(farmerId, weekAgo);

  return {
    todayTotal: parseFloat(todayTotal.toFixed(1)),
    weekTotal: parseFloat(weekTotal.toFixed(1)),
    dailyAverage: parseFloat(dailyAvg.toFixed(1)),
    topProducers: topProducers.map(p => ({
      rfidNumber: p.rfid_number,
      breed: p.breed,
      totalLiters: parseFloat(p.total_liters.toFixed(1)),
    })),
  };
};

module.exports = {
  logMilkProduction,
  getMilkRecordsByFarmer,
  getMilkBatchByCode,
  getMilkStats,
};
