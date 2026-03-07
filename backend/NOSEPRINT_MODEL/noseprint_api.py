from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import base64
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths to model files (using absolute paths)
CASCADE_PATH = os.path.join(SCRIPT_DIR, 'script_cascade', 'output', '64', 'cascade.xml')
MODEL_PATH = os.path.join(SCRIPT_DIR, 'script_identifier', 'output', 'cowrec_knn_model.xml')
LABEL_DICT_PATH = os.path.join(SCRIPT_DIR, 'script_identifier', 'output', 'label_dict.npy')

# Load models
try:
    nose_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    knn = cv2.ml.KNearest_load(MODEL_PATH)
    label_dict = np.load(LABEL_DICT_PATH, allow_pickle=True).item()
    reverse_label_dict = {v: k for k, v in label_dict.items()}
    orb = cv2.ORB_create()
    print("✓ Models loaded successfully")
except Exception as e:
    print(f"✗ Error loading models: {e}")
    nose_cascade = None
    knn = None

# Database to store nose embeddings (in production, use MongoDB)
NOSEPRINT_DB = {}
NOSEPRINT_DB_FILE = os.path.join(SCRIPT_DIR, 'noseprint_database.json')

# Load existing database if exists
if os.path.exists(NOSEPRINT_DB_FILE):
    with open(NOSEPRINT_DB_FILE, 'r') as f:
        NOSEPRINT_DB = json.load(f)


def save_database():
    """Save noseprint database to file"""
    with open(NOSEPRINT_DB_FILE, 'w') as f:
        json.dump(NOSEPRINT_DB, f)


def decode_base64_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None


def extract_nose_region(image, is_registration=True):
    """
    Extract nose region from cow face image
    For registration: Very lenient, always returns a region
    For identification: Stricter detection for accurate matching
    """
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    if is_registration:
        # REGISTRATION MODE: Always extract features, even without cascade detection
        # Try detection but don't fail if not found
        noses = nose_cascade.detectMultiScale(gray_image, scaleFactor=1.05, minNeighbors=2, minSize=(20, 20))
        
        if len(noses) > 0:
            # Use detected nose
            largest_nose = max(noses, key=lambda rect: rect[2] * rect[3])
            x, y, w, h = largest_nose
            nose_region = image[y:y+h, x:x+w]
            print(f"✓ Nose detected for registration")
        else:
            # No detection? Use entire image - ORB will extract unique features anyway
            nose_region = image
            print(f"✓ Using full image for registration (cascade not needed)")
        
        return nose_region, None
    
    else:
        # IDENTIFICATION MODE: Be more careful
        noses = nose_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
        
        if len(noses) == 0:
            # For identification, use center region as fallback
            h, w = image.shape[:2]
            nose_region = image[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
            return nose_region, None
        
        largest_nose = max(noses, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_nose
        nose_region = image[y:y+h, x:x+w]
        return nose_region, None


def process_noseprint(nose_region):
    """Process nose region to create high-contrast noseprint"""
    gray_nose = cv2.cvtColor(nose_region, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    adaptive_thresh = cv2.adaptiveThreshold(
        gray_nose, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Invert the binary image
    inverted_image = cv2.bitwise_not(adaptive_thresh)
    
    # Apply morphological operations
    kernel = np.ones((3, 3), np.uint8)
    processed_image = cv2.morphologyEx(inverted_image, cv2.MORPH_CLOSE, kernel)
    
    # Resize to standard size
    processed_image = cv2.resize(processed_image, (256, 256))
    
    return processed_image


def extract_features(processed_image):
    """Extract ORB features from processed noseprint"""
    keypoints, descriptors = orb.detectAndCompute(processed_image, None)
    
    if descriptors is None or len(descriptors) == 0:
        return None
    
    return descriptors


def generate_unique_id(rfid_number):
    """Generate unique noseprint ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"NOSE_{rfid_number}_{timestamp}"


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': nose_cascade is not None and knn is not None
    })


@app.route('/api/noseprint/register', methods=['POST'])
def register_noseprint():
    """
    Register multiple nose samples for a cow
    Expected JSON: {
        "rfidNumber": "COW123",
        "images": ["base64_image1", "base64_image2", "base64_image3"]
    }
    """
    try:
        data = request.json
        rfid_number = data.get('rfidNumber')
        images = data.get('images', [])
        
        if not rfid_number:
            return jsonify({'error': 'RFID number is required'}), 400
        
        if len(images) < 3:
            return jsonify({'error': 'At least 3 nose images are required'}), 400
        
        # Process all images and extract features
        all_features = []
        processed_images = []
        
        for i, img_base64 in enumerate(images):
            # Decode image
            image = decode_base64_image(img_base64)
            if image is None:
                return jsonify({'error': f'Failed to decode image {i+1}'}), 400
            
            # Extract nose region (lenient for registration)
            nose_region, error = extract_nose_region(image, is_registration=True)
            if nose_region is None:
                return jsonify({'error': f'Image {i+1}: {error}'}), 400
            
            # Process noseprint
            processed = process_noseprint(nose_region)
            processed_images.append(processed.tolist())
            
            # Extract features
            features = extract_features(processed)
            if features is None:
                return jsonify({'error': f'Failed to extract features from image {i+1}'}), 400
            
            all_features.append(features.tolist())
        
        # Generate unique noseprint ID
        noseprint_id = generate_unique_id(rfid_number)
        
        # Store in database
        NOSEPRINT_DB[noseprint_id] = {
            'rfidNumber': rfid_number,
            'features': all_features,
            'registeredAt': datetime.now().isoformat(),
            'sampleCount': len(images)
        }
        
        save_database()
        
        return jsonify({
            'success': True,
            'noseprintId': noseprint_id,
            'message': f'Successfully registered {len(images)} nose samples',
            'rfidNumber': rfid_number
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/noseprint/identify', methods=['POST'])
def identify_noseprint():
    """
    Identify cow by nose image when RFID is lost
    Expected JSON: {
        "image": "base64_image"
    }
    """
    try:
        data = request.json
        img_base64 = data.get('image')
        
        if not img_base64:
            return jsonify({'error': 'Image is required'}), 400
        
        # Decode image
        image = decode_base64_image(img_base64)
        if image is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Extract nose region (stricter for identification)
        nose_region, error = extract_nose_region(image, is_registration=False)
        if nose_region is None:
            return jsonify({'error': error}), 400
        
        # Process noseprint
        processed = process_noseprint(nose_region)
        
        # Extract features
        test_features = extract_features(processed)
        if test_features is None:
            return jsonify({'error': 'Failed to extract features from image'}), 400
        
        if len(NOSEPRINT_DB) == 0:
            return jsonify({
                'success': True,
                'identified': False,
                'message': 'No cows registered in database'
            })
        
        # Build dynamic k-NN from all stored features (like original HOMBENAI.py logic)
        all_descriptors = []
        all_labels = []
        cow_id_map = {}  # Map numeric label to noseprint_id
        label_counter = 0
        
        for noseprint_id, data in NOSEPRINT_DB.items():
            cow_id_map[label_counter] = {
                'noseprintId': noseprint_id,
                'rfidNumber': data['rfidNumber']
            }
            
            # Add all stored features for this cow
            for stored_features in data['features']:
                for descriptor in stored_features:
                    all_descriptors.append(descriptor)
                    all_labels.append(label_counter)
            
            label_counter += 1
        
        # Convert to numpy arrays
        all_descriptors = np.array(all_descriptors, dtype=np.float32)
        all_labels = np.array(all_labels, dtype=np.int32)
        
        # Create and train dynamic k-NN
        dynamic_knn = cv2.ml.KNearest_create()
        dynamic_knn.train(all_descriptors, cv2.ml.ROW_SAMPLE, all_labels)
        
        # Use k-NN to find nearest matches (k=3 voting, same as original model)
        ret, results, neighbours, dist = dynamic_knn.findNearest(test_features.astype(np.float32), k=3)
        
        # Count votes for each cow (same logic as HOMBENAI.py)
        label_counts = np.bincount(results.flatten().astype(int))
        predicted_label_id = np.argmax(label_counts)
        
        # Calculate confidence based on vote percentage and distance
        total_votes = len(results.flatten())
        vote_percentage = (label_counts[predicted_label_id] / total_votes) * 100
        
        # Calculate average distance for winning label
        winning_distances = dist[results.flatten() == predicted_label_id]
        avg_distance = np.mean(winning_distances) if len(winning_distances) > 0 else 1000
        
        # Confidence score: higher vote % + lower distance = higher confidence
        # Distance threshold: 100 is very good, 200 is acceptable, >300 is poor
        confidence_score = vote_percentage * (1 - min(avg_distance / 300, 1))
        
        # Threshold for positive identification (40% confidence = balanced)
        if confidence_score > 40:
            match_info = cow_id_map[predicted_label_id]
            return jsonify({
                'success': True,
                'identified': True,
                'match': {
                    'noseprintId': match_info['noseprintId'],
                    'rfidNumber': match_info['rfidNumber'],
                    'confidence': round(confidence_score, 2),
                    'votePercentage': round(vote_percentage, 2),
                    'avgDistance': round(avg_distance, 2)
                }
            })
        else:
            return jsonify({
                'success': True,
                'identified': False,
                'message': 'No matching cow found',
                'topMatch': {
                    'confidence': round(confidence_score, 2),
                    'rfidNumber': cow_id_map[predicted_label_id]['rfidNumber']
                }
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/noseprint/verify', methods=['POST'])
def verify_noseprint():
    """
    Verify if a nose image matches a specific RFID
    Expected JSON: {
        "rfidNumber": "COW123",
        "image": "base64_image"
    }
    """
    try:
        data = request.json
        rfid_number = data.get('rfidNumber')
        img_base64 = data.get('image')
        
        if not rfid_number or not img_base64:
            return jsonify({'error': 'RFID number and image are required'}), 400
        
        # Find noseprint ID for this RFID
        noseprint_id = None
        for npid, npdata in NOSEPRINT_DB.items():
            if npdata['rfidNumber'] == rfid_number:
                noseprint_id = npid
                break
        
        if not noseprint_id:
            return jsonify({'error': 'No noseprint found for this RFID'}), 404
        
        # Decode and process image
        image = decode_base64_image(img_base64)
        if image is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        nose_region, error = extract_nose_region(image, is_registration=False)
        if nose_region is None:
            return jsonify({'error': error}), 400
        
        processed = process_noseprint(nose_region)
        test_features = extract_features(processed)
        
        if test_features is None:
            return jsonify({'error': 'Failed to extract features'}), 400
        
        # Build k-NN for this specific cow's stored features
        stored_data = NOSEPRINT_DB[noseprint_id]
        all_descriptors = []
        
        for stored_features in stored_data['features']:
            for descriptor in stored_features:
                all_descriptors.append(descriptor)
        
        all_descriptors = np.array(all_descriptors, dtype=np.float32)
        all_labels = np.zeros(len(all_descriptors), dtype=np.int32)  # All same cow
        
        # Create k-NN for verification
        verification_knn = cv2.ml.KNearest_create()
        verification_knn.train(all_descriptors, cv2.ml.ROW_SAMPLE, all_labels)
        
        # Find k=3 nearest neighbors
        ret, results, neighbours, dist = verification_knn.findNearest(test_features.astype(np.float32), k=3)
        
        # Calculate average distance (lower = better match)
        avg_distance = np.mean(dist)
        
        # Convert distance to confidence percentage
        # Distance: 0-100 = excellent (90-100%), 100-200 = good (70-90%), 200-300 = acceptable (50-70%)
        if avg_distance < 100:
            confidence = 90 + (100 - avg_distance) / 10
        elif avg_distance < 200:
            confidence = 70 + (200 - avg_distance) / 5
        elif avg_distance < 300:
            confidence = 50 + (300 - avg_distance) / 5
        else:
            confidence = max(0, 50 - (avg_distance - 300) / 10)
        
        verified = confidence > 60  # 60% threshold for verification
        
        return jsonify({
            'success': True,
            'verified': verified,
            'confidence': round(confidence, 2),
            'avgDistance': round(avg_distance, 2),
            'rfidNumber': rfid_number
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting Noseprint Recognition API...")
    print(f"Models loaded: {nose_cascade is not None and knn is not None}")
    print(f"Database entries: {len(NOSEPRINT_DB)}")
    app.run(host='0.0.0.0', port=5001, debug=True)
