const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getDatabase } = require('../database/db');

// Public: verify cattle ownership by RFID (no auth)
router.get('/public/verify/:rfid', (req, res) => {
  try {
    const db = getDatabase();
    const cow = db.prepare(`
      SELECT c.rfid_number, c.breed, c.gender, c.birth_date, c.is_verified,
             f.farm_name as owner_name, f.farm_name, f.location as farm_location
      FROM cows c
      JOIN farmers f ON c.farmer_id = f.id
      WHERE c.rfid_number = ?
    `).get(req.params.rfid);

    if (!cow) {
      return res.status(404).json({ success: false, message: 'No cattle found with this RFID tag' });
    }
    const transferCount = db.prepare(`SELECT COUNT(*) as count FROM ownership_transfers WHERE cow_id = (SELECT id FROM cows WHERE rfid_number = ?) AND status = 'completed'`).get(req.params.rfid).count;
    res.json({
      success: true,
      cattle: {
        rfid: cow.rfid_number,
        breed: cow.breed,
        gender: cow.gender,
        birthDate: cow.birth_date,
        isVerified: cow.is_verified === 1,
        currentOwner: cow.owner_name,
        farmName: cow.farm_name,
        farmLocation: cow.farm_location,
        totalTransfers: transferCount,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Public: recent completed transfers (no auth)
router.get('/public/recent', (req, res) => {
  try {
    const db = getDatabase();
    const transfers = db.prepare(`
      SELECT t.id, c.rfid_number, c.breed,
             uf.farm_name as from_farm, ut.farm_name as to_farm,
             t.transfer_date, t.status
      FROM ownership_transfers t
      JOIN cows c ON t.cow_id = c.id
      JOIN farmers uf ON t.from_farmer_id = uf.id
      JOIN farmers ut ON t.to_farmer_id = ut.id
      WHERE t.status = 'completed'
      ORDER BY t.transfer_date DESC LIMIT 10
    `).all();
    res.json({ success: true, transfers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// All transfer routes require farmer auth
router.use(auth, rbac(['farmer']));

router.post('/initiate', transferController.initiateTransfer);
router.put('/:transferId/accept', transferController.acceptTransfer);
router.put('/:transferId/reject', transferController.rejectTransfer);
router.get('/my', transferController.getMyTransfers);
router.get('/pending', transferController.getPendingTransfers);

module.exports = router;
