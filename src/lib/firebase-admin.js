import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Uses the SAME environment variable names already set up for
// /api/send-notification, so there's only one Firebase Admin
// configuration for the whole project - no duplicates.
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

const adminApp = getApps().length ? getApps()[0] : initializeApp(firebaseAdminConfig);
export const adminDb = getFirestore(adminApp);
