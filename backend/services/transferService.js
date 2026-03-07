const { getDatabase } = require('../database/db');

// ─── Initiate Transfer ───────────────────────────────────

const initiateTransfer = (cowId, fromFarmerId, toFarmerIdentifier, transferPrice) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ? AND farmer_id = ?').get(cowId, fromFarmerId);
  if (!cow) throw new Error('Cow not found or you do not own this cow');

  // Find target farmer by email, phone, or id
  let toFarmer = db.prepare('SELECT id FROM farmers WHERE id = ? OR email = ? OR phone_number = ?')
    .get(toFarmerIdentifier, toFarmerIdentifier, toFarmerIdentifier);
  if (!toFarmer) throw new Error('Target farmer not found');
  if (toFarmer.id === fromFarmerId) throw new Error('Cannot transfer to yourself');

  // Check for pending transfers on same cow
  const pending = db.prepare('SELECT id FROM ownership_transfers WHERE cow_id = ? AND status = ?').get(cowId, 'pending');
  if (pending) throw new Error('This cow already has a pending transfer');

  const result = db.prepare(`
    INSERT INTO ownership_transfers (cow_id, from_farmer_id, to_farmer_id, transfer_date, transfer_price, status, verification_method)
    VALUES (?, ?, ?, date('now'), ?, 'pending', 'rfid')
  `).run(cowId, fromFarmerId, toFarmer.id, transferPrice || 0);

  return getTransferById(result.lastInsertRowid);
};

// ─── Accept Transfer ─────────────────────────────────────

const acceptTransfer = (transferId, farmerId) => {
  const db = getDatabase();

  const transfer = db.prepare('SELECT * FROM ownership_transfers WHERE id = ? AND to_farmer_id = ? AND status = ?')
    .get(transferId, farmerId, 'pending');
  if (!transfer) throw new Error('Transfer not found or not authorized');

  // Update cow ownership
  db.prepare('UPDATE cows SET farmer_id = ? WHERE id = ?').run(transfer.to_farmer_id, transfer.cow_id);

  // Complete transfer
  db.prepare('UPDATE ownership_transfers SET status = ? WHERE id = ?').run('completed', transferId);

  return getTransferById(transferId);
};

// ─── Reject Transfer ─────────────────────────────────────

const rejectTransfer = (transferId, farmerId) => {
  const db = getDatabase();

  const transfer = db.prepare('SELECT * FROM ownership_transfers WHERE id = ? AND to_farmer_id = ? AND status = ?')
    .get(transferId, farmerId, 'pending');
  if (!transfer) throw new Error('Transfer not found or not authorized');

  db.prepare('UPDATE ownership_transfers SET status = ? WHERE id = ?').run('rejected', transferId);
  return getTransferById(transferId);
};

// ─── Get Transfers ───────────────────────────────────────

const getTransfersByFarmer = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT t.*,
           c.rfid_number as cow_rfid, c.breed as cow_breed,
           ff.farm_name as from_farm_name, ff.phone_number as from_phone,
           tf.farm_name as to_farm_name, tf.phone_number as to_phone
    FROM ownership_transfers t
    JOIN cows c ON t.cow_id = c.id
    JOIN farmers ff ON t.from_farmer_id = ff.id
    JOIN farmers tf ON t.to_farmer_id = tf.id
    WHERE t.from_farmer_id = ? OR t.to_farmer_id = ?
    ORDER BY t.created_at DESC
  `).all(farmerId, farmerId).map(formatTransfer);
};

const getPendingTransfers = (farmerId) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT t.*,
           c.rfid_number as cow_rfid, c.breed as cow_breed,
           ff.farm_name as from_farm_name, ff.phone_number as from_phone,
           tf.farm_name as to_farm_name, tf.phone_number as to_phone
    FROM ownership_transfers t
    JOIN cows c ON t.cow_id = c.id
    JOIN farmers ff ON t.from_farmer_id = ff.id
    JOIN farmers tf ON t.to_farmer_id = tf.id
    WHERE (t.from_farmer_id = ? OR t.to_farmer_id = ?) AND t.status = 'pending'
    ORDER BY t.created_at DESC
  `).all(farmerId, farmerId).map(formatTransfer);
};

const getTransferById = (id) => {
  const db = getDatabase();
  const t = db.prepare(`
    SELECT t.*,
           c.rfid_number as cow_rfid, c.breed as cow_breed,
           ff.farm_name as from_farm_name,
           tf.farm_name as to_farm_name
    FROM ownership_transfers t
    JOIN cows c ON t.cow_id = c.id
    JOIN farmers ff ON t.from_farmer_id = ff.id
    JOIN farmers tf ON t.to_farmer_id = tf.id
    WHERE t.id = ?
  `).get(id);
  return t ? formatTransfer(t) : null;
};

const formatTransfer = (t) => ({
  id: t.id,
  cowId: t.cow_id,
  cowRFID: t.cow_rfid,
  cowBreed: t.cow_breed,
  fromFarmerId: t.from_farmer_id,
  fromFarmName: t.from_farm_name,
  toFarmerId: t.to_farmer_id,
  toFarmName: t.to_farm_name,
  transferDate: t.transfer_date,
  transferPrice: t.transfer_price,
  status: t.status,
  verificationMethod: t.verification_method,
  createdAt: t.created_at,
});

module.exports = {
  initiateTransfer,
  acceptTransfer,
  rejectTransfer,
  getTransfersByFarmer,
  getPendingTransfers,
};
