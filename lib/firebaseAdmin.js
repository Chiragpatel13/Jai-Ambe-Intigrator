import admin, { getApps, initializeApp, cert } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

let _app = null;

/**
 * Returns an initialised Firebase Admin app (singleton).
 */
function getAdminApp() {
  if (_app) return _app;

  const existingApps = getApps();
  if (existingApps && existingApps.length > 0) {
    _app = existingApps[0];
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
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };
    credential = cert(serviceAccount);
  }

  // ── Option 2: Full JSON env var (larger hosting tiers) ───────────────────
  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = cert(serviceAccount);
    } catch (err) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: ' + err.message);
    }
  }

  // ── Option 3: Local JSON file (local development) ─────────────────────────
  if (!credential) {
    try {
      const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        credential = cert(serviceAccount);
      }
    } catch {}
  }

  if (!credential) {
    throw new Error(
      '[Firebase Admin] No credentials found. Set one of:\n' +
      '  • FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL\n' +
      '  • FIREBASE_SERVICE_ACCOUNT_JSON\n' +
      '  • serviceAccountKey.json in project root'
    );
  }

  _app = initializeApp({ credential, storageBucket });
  return _app;
}

/**
 * Returns the Firebase Admin Storage bucket.
 */
export function getAdminStorageBucket() {
  const app = getAdminApp();
  return getStorage(app).bucket();
}
