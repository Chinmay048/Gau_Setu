// Firebase Configuration — GauSetu Cloud Sync
// Connected to Firebase for real-time livestock data synchronization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD8kR4mHp3xVbGcLdE9fJv2nQwTy5K7aXo",
  authDomain: "gausetu-livestock.firebaseapp.com",
  projectId: "gausetu-livestock",
  storageBucket: "gausetu-livestock.appspot.com",
  messagingSenderId: "294817365028",
  appId: "1:294817365028:web:c5f8a3d9e1b7402f6d8e9a",
  measurementId: "G-RK7VN3MXEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const firebaseDb = getFirestore(app);
export const firebaseAuth = getAuth(app);
export const firebaseStorage = getStorage(app);

console.log('🔥 Firebase connected — GauSetu Cloud Sync active');
console.log('📡 Firestore: gausetu-livestock.firebaseapp.com');
console.log('🔐 Firebase Auth: initialized');
console.log('💾 Cloud Storage: gausetu-livestock.appspot.com');

export default app;
