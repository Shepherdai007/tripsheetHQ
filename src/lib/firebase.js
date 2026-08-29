import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDFXRuGqQ8qmUIe08G8xJh_xcv_vRQDE-U",
  authDomain: "tripsheethq.firebaseapp.com",
  projectId: "tripsheethq",
  storageBucket: "tripsheethq.firebasestorage.app",
  messagingSenderId: "470095071606",
  appId: "1:470095071606:web:c76fc911e0cba7c628d257",
  measurementId: "G-0QY50KR12F",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Using initializeAuth with persistence set at creation (not
// getAuth() + setPersistence() afterward) - this avoids a known race
// condition where the session restore can lose the current user right
// at startup, especially in installed PWAs. Falls back to getAuth()
// if the app was already initialized elsewhere (e.g. hot reload).
let auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  });
} catch (err) {
  // initializeAuth throws if already called once for this app (e.g. Next.js
  // hot reload in dev) - just grab the existing instance instead.
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

export const getMessagingInstance = async () => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
};