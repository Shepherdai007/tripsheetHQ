import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFXRuGqQ8qmUIe08G8xJh_xcv_vRQDE-U",
  authDomain: "tripsheethq.firebaseapp.com",
  projectId: "tripsheethq",
  storageBucket: "tripsheethq.firebasestorage.app",
  messagingSenderId: "470095071606",
  appId: "1:470095071606:web:c76fc911e0cba7c628d257",
  measurementId: "G-0QY50KR12F"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);