import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let _app = null;

/**
 * Returns an initialised Firebase Admin app (singleton).
 *
 * Credential resolution order (first match wins):
 *  1. Individual env vars  – FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL
 *     → Best for Vercel free tier (each var stays under 4KB)
 *  2. FIREBASE_SERVICE_ACCOUNT_JSON env var  – full JSON as one string (paid tiers / larger limits)
 *  3. serviceAccountKey.json in project root  – local development convenience
 */
function getAdminApp() {
  if (_app) return _app;

  if (admin.apps.length > 0) {
    _app = admin.apps[0];
    return _app;
  }

  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'jayambe-integrators.firebasestorage.app';

  let credential;

  // ── Option 1: Individual env vars (Vercel free-tier friendly) ─────────────
  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  ) {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID || '',
      // Vercel escapes \n — replace literal \n back to real newlines
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };
    credential = admin.credential.cert(serviceAccount);
    console.log('[Firebase Admin] ✅ Using individual FIREBASE_ADMIN_* env variables.');
  }

  // ── Option 2: Full JSON env var (larger hosting tiers) ───────────────────
  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
      console.log('[Firebase Admin] ✅ Using FIREBASE_SERVICE_ACCOUNT_JSON env variable.');
    } catch (err) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: ' + err.message);
    }
  }

  // ── Option 3: Local JSON file (local development) ─────────────────────────
  if (!credential) {
    try {
      const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('[Firebase Admin] ✅ Using serviceAccountKey.json from project root.');
    } catch {
      // File not found — will throw below
    }
  }

  if (!credential) {
    throw new Error(
      '[Firebase Admin] No credentials found. Set one of:\n' +
      '  • FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL (recommended for Vercel free)\n' +
      '  • FIREBASE_SERVICE_ACCOUNT_JSON (full JSON string)\n' +
      '  • serviceAccountKey.json in project root (local dev)'
    );
  }

  _app = admin.initializeApp({ credential, storageBucket });
  return _app;
}

/**
 * Returns the Firebase Admin Storage bucket.
 * Uploads via this bypass Firebase Storage security rules entirely.
 */
export function getAdminStorageBucket() {
  const app = getAdminApp();
  return admin.storage(app).bucket();
}
