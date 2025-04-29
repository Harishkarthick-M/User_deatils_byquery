import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHwE4t3babjLanrWxFJZJGo8sdyybV_AU",
  authDomain: "user-details-958a8.firebaseapp.com",
  projectId: "user-details-958a8",
  storageBucket: "user-details-958a8.firebasestorage.app",
  messagingSenderId: "540353035455",
  appId: "1:540353035455:web:4fcad22a8b087fe7869a0a",
  measurementId: "G-H32D488GD6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
