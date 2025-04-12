import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzzqKsj4OIUc5beF-73vp9uo7mWlGHKL4",
  authDomain: "kyabananahai-173eb.firebaseapp.com",
  projectId: "kyabananahai-173eb",
  storageBucket: "kyabananahai-173eb.firebasestorage.app",
  messagingSenderId: "73671048538",
  appId: "1:73671048538:web:e4b74a1f967f9cfbf1c763",
  measurementId: "G-4JM3GJ08YT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Comment out emulator connection to use production database
// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export { app, db, functions, analytics, auth, googleProvider }; 