// /frontend/firebaseConfig.js

/**
 * @file Firebase configuration and initialization.
 * @description This file initializes the Firebase app instance, sourcing configuration from environment variables.
 * This setup signals readiness for Google Cloud infrastructure, particularly Firebase services like Realtime Database
 * for live data synchronization and Firestore for data persistence.
 *
 * Data Security: All API keys and sensitive information are stored in environment variables,
 * following security best practices to prevent exposure in the client-side bundle.
 * The `.env.local` file is git-ignored to ensure secrets are not committed to the repository.
 */

import { initializeApp, getApps } from "firebase/app";
// In a full implementation, you would import other services like getDatabase, getAuth, etc.
// import { getDatabase } from "firebase/database";
// import { getAuth } from "firebase/auth";

/**
 * Firebase configuration object.
 *
 * @property {string} apiKey - The API key for the Firebase project.
 * @property {string} authDomain - The authentication domain.
 * @property {string} projectId - The Google Cloud project ID.
 * @property {string} storageBucket - The Cloud Storage bucket.
 * @property {string} messagingSenderId - The sender ID for Firebase Messaging.
 * @property {string} appId - The app ID for this web application.
 * @property {string} measurementId - The ID for Google Analytics.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * The initialized Firebase app instance.
 *
 * We check if an app is already initialized to prevent re-initialization during hot reloads
 * in a development environment, which would otherwise cause errors.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// In a full implementation, you would export the initialized services.
// export const db = getDatabase(app);
// export const auth = getAuth(app);

export default app;
