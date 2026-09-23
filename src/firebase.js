import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoURieYHsRZ1bFhay0yVvYyzZtB_QbWh8",
  authDomain: "smartchip-5de59.firebaseapp.com",
  projectId: "smartchip-5de59",
  storageBucket: "smartchip-5de59.firebasestorage.app",
  messagingSenderId: "546048983325",
  appId: "1:546048983325:web:790bb6d4e05bef460a21f4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
