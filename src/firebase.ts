import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCtnIe5TGdGc-CW40SASoxkG_PMy-nnrMk",
  authDomain: "tariffdefense-42699.firebaseapp.com",
  projectId: "tariffdefense-42699",
  storageBucket: "tariffdefense-42699.firebasestorage.app",
  messagingSenderId: "702792687411",
  appId: "1:702792687411:web:e3590d41cdaf37c9b2a846",
  measurementId: "G-M66E53P9WT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 