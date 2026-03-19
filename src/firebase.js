import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCjMxcRGHAMquEPBuit-3CiZtMRnBmRTTE",
  authDomain: "hfr-artist-pro.firebaseapp.com",
  projectId: "hfr-artist-pro",
  storageBucket: "hfr-artist-pro.firebasestorage.app",
  messagingSenderId: "618148281688",
  appId: "1:618148281688:web:5c89056553e82c9c84392d"
};

const app = initializeApp(firebaseConfig);

// On exporte les outils dont on a besoin
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);