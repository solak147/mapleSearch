import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9xCT9U1z6tGRAMEz9kS-glyfaPewEouQ",
  authDomain: "maplesearch-cee92.firebaseapp.com",
  projectId: "maplesearch-cee92",
  storageBucket: "maplesearch-cee92.firebasestorage.app",
  messagingSenderId: "82569881003",
  appId: "1:82569881003:web:623e3c08a80b4a15b89eee",
  measurementId: "G-WSZNYBV1E2",
};

export const getFirebaseApp = () =>
  getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const getFirebaseDb = () => getFirestore(getFirebaseApp());
