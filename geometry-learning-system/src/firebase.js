import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCS58GW60dHqh33ubM6LfHJ5dKXTzROooQ",
  authDomain: "geometry-155f4.firebaseapp.com",
  projectId: "geometry-155f4",
  storageBucket: "geometry-155f4.firebasestorage.app",
  messagingSenderId: "852304006503",
  appId: "1:852304006503:web:2aa39ac8cb74aa1ae3f3c2",
  measurementId: "G-BNLREVQ9D8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

