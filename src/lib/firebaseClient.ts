import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { normalizeEnvValue } from "./env";

const firebaseConfig = {
  apiKey: normalizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: normalizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: normalizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: normalizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: normalizeEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: normalizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!firebaseConfig.projectId) {
    throw new Error(
      "Missing Firebase client configuration. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }

  return initializeApp(firebaseConfig);
}

export function getClientDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp());
}
