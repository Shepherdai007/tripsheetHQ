import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

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

// Explicitly persist login across full app closes (important for PWAs,
// where storage behavior can otherwise be inconsistent between sessions).
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // If this fails (e.g. private browsing), auth falls back to default behavior.
  });
}

export const getMessagingInstance = async () => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
};