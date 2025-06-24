import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage' // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyCS58GW60dHqh33ubM6LfHJ5dKXTzROooQ",
  authDomain: "geometry-155f4.firebaseapp.com",
  projectId: "geometry-155f4",
  storageBucket: "geometry-155f4.appspot.com", // ✅ FIXED: correct domain
  messagingSenderId: "852304006503",
  appId: "1:852304006503:web:2aa39ac8cb74aa1ae3f3c2",
  measurementId: "G-BNLREVQ9D8"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app) // ✅ Add this

// Export services
export { auth, db, storage } // ✅ Export storage too
