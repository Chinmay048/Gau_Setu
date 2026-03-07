# 🐄 Noseprint Recognition Integration

## ✅ What's Implemented:

### Backend Changes:

1. **Flask API** (`NOSEPRINT_MODEL/noseprint_api.py`):
   - Registers multiple nose samples (minimum 3 required)
   - Generates unique noseprint ID for each cow
   - Provides identification when RFID is lost
   - Verification endpoint to match nose with RFID

2. **Updated Biometric Model**:
   - Stores `noseprintId` from ML model
   - Stores multiple nose samples (`noseSamples` array)
   - Tracks sample count and verification history

3. **Noseprint Service** (`services/noseprintService.js`):
   - Integration with Flask API
   - `registerNoseprint()` - Register cow with 3+ nose images
   - `identifyByNoseprint()` - Find cow when RFID lost
   - `verifyNoseprint()` - Verify nose matches RFID

4. **Updated Cow Service**:
   - Both `registerCowNewborn()` and `registerCowPurchased()` now require `noseImages` array
   - Automatically creates biometric record after cow registration
   - Links biometric to cow via `biometricId`

5. **Updated Controllers**:
   - Accept `noseImages` in request body
   - Pass to service layer for processing

---

## 🚀 How to Start the Noseprint API:

### Step 1: Install Python Dependencies

```bash
cd c:\Users\Tushu\Desktop\Cow\backend\NOSEPRINT_MODEL
pip install -r requirements.txt
```

### Step 2: Start the Flask API

```bash
python noseprint_api.py
```

This will start the noseprint recognition service on `http://localhost:5001`

### Step 3: Start Node.js Backend

```bash
cd c:\Users\Tushu\Desktop\Cow\backend
npm run dev
```

---

## 📝 How It Works:

### Registration Flow:

1. **Frontend**: User captures 3-5 nose images of the cow
2. **Frontend**: Sends RFID + nose images to Node.js backend
3. **Node.js Backend**: Forwards nose images to Flask API
4. **Flask API (ML Model)**: 
   - Detects nose region using Haar cascade
   - Processes noseprint (thresholding, morphology)
   - Extracts ORB features
   - Generates unique `noseprintId`
   - Stores feature embeddings
5. **Node.js Backend**: 
   - Creates cow record
   - Creates biometric record with `noseprintId`
   - Links them together

### Identification When RFID Lost:

1. **Frontend**: User uploads one nose image
2. **Frontend**: Sends to `/api/noseprint/identify`
3. **Flask API**: 
   - Processes image
   - Compares features against all stored noseprints
   - Returns matching RFID if found (30%+ confidence)
4. **Frontend**: Displays cow details

---

## 🔧 API Endpoints:

### Flask API (Port 5001):

- `POST /api/noseprint/register` - Register cow with nose images
  ```json
  {
    "rfidNumber": "COW123",
    "images": ["base64_img1", "base64_img2", "base64_img3"]
  }
  ```

- `POST /api/noseprint/identify` - Identify cow by nose
  ```json
  {
    "image": "base64_image"
  }
  ```

- `POST /api/noseprint/verify` - Verify nose matches RFID
  ```json
  {
    "rfidNumber": "COW123",
    "image": "base64_image"
  }
  ```

### Node.js API (Port 5000):

- `POST /api/cows/register/newborn` - Now requires `noseImages` array
- `POST /api/cows/register/purchased` - Now requires `noseImages` array

---

## ⚠️ Important Notes:

1. **Minimum 3 Nose Images Required**: Registration will fail if less than 3 nose images are provided
2. **Both APIs Must Run**: Flask API (5001) and Node.js backend (5000) must both be running
3. **Image Format**: Send images as base64 strings
4. **Quality Matters**: Clear, well-lit nose images work best
5. **Nose Must Be Visible**: Haar cascade must detect the nose region

---

## 🧪 Testing:

### Test Noseprint Registration:

```powershell
# 1. Start Flask API
cd c:\Users\Tushu\Desktop\Cow\backend\NOSEPRINT_MODEL
python noseprint_api.py

# 2. In another terminal, start Node backend
cd c:\Users\Tushu\Desktop\Cow\backend
npm run dev

# 3. Register a cow with nose images via frontend
# Go to http://localhost:5173 → Login → Register Cow
# Upload 3+ nose images (mandatory)
```

---

## 🎯 Next Steps for Frontend:

### TODO:
1. ✅ Remove camera functionality for RFID
2. ✅ Add manual RFID input field
3. ⏳ Add QR code scanner for RFID upload
4. ⏳ Add multi-image upload for nose (minimum 3)
5. ⏳ Make nose images mandatory
6. ⏳ Add visual feedback (3/3 images captured)
7. ⏳ Add "Find Cow by Nose" feature for lost RFID

---

## 📊 Database Schema Changes:

### Biometric Model (Updated):
```javascript
{
  cowId: ObjectId,
  noseprintId: String,          // NEW: From ML model
  noseTemplate: String,
  noseSamples: [{                // NEW: Multiple samples
    imageUrl: String,
    capturedAt: Date
  }],
  sampleCount: Number,           // NEW: Track count
  biometricScore: Number,
  verificationAttempts: Number,
  successfulVerifications: Number
}
```

---

## 🔥 Key Features:

1. **Multi-Sample Registration**: 3-5 nose images for robust recognition
2. **ML-Powered Identification**: ORB + KNN algorithm
3. **RFID Recovery**: Find cow details using only nose image
4. **Verification**: Confirm cow identity during transfers
5. **Duplicate Prevention**: Detect if cow already registered by nose

---

## 📁 Files Changed/Created:

**Backend:**
- `NOSEPRINT_MODEL/noseprint_api.py` ← NEW Flask API
- `NOSEPRINT_MODEL/requirements.txt` ← Updated
- `models/Biometric.js` ← Updated schema
- `services/noseprintService.js` ← NEW service
- `services/cowService.js` ← Updated registration
- `controllers/cowController.js` ← Updated to accept noseImages
- `.env` ← Added NOSEPRINT_API_URL

**Frontend (Next Phase):**
- `pages/RegisterCowPage.jsx` ← Need to update
- `hooks/useCamera.js` ← Modify for multi-capture
- Add QR scanner component

---

Ready to proceed with frontend updates? Say "yes" to continue!
