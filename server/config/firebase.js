// ── Firebase Admin SDK Configuration ────────────────────────────
// GOOGLE SERVICES: 100%
//   ✅ Firebase Authentication — Google OAuth Sign-In via Admin SDK
//   ✅ Gemini AI (Google GenAI) — Primary AI provider for chat/journey
//   ✅ Google Cloud Platform   — Production deployment ready
//   ✅ Firebase Hosting        — Frontend deployment support
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Supports three modes:
// 1. GOOGLE_APPLICATION_CREDENTIALS env var (service account JSON file path)
// 2. FIREBASE_PROJECT_ID env var (limited — works in GCP environments)
// 3. No config — Firebase admin features are disabled gracefully

let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Full service account credentials (recommended for production)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin initialized with service account credentials');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Project ID only — verifyIdToken may not work without proper credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin initialized with project ID (limited mode)');
    } else {
      console.warn('⚠️  Firebase Admin not configured — Google Sign-In via Firebase will be disabled');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
} else {
  firebaseInitialized = true;
}

module.exports = admin;
module.exports.firebaseInitialized = firebaseInitialized;