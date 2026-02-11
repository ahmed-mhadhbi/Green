const admin = require("firebase-admin");

function buildCredentialFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  return null;
}

function initFirebase() {
  if (admin.apps.length) return admin.app();

  const serviceAccount = buildCredentialFromEnv();
  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
    });
  }

  // Fallback to Application Default Credentials if available
  // (for example via GOOGLE_APPLICATION_CREDENTIALS).
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
    });
  } catch (_error) {
    throw new Error(
      [
        "Missing Firebase Admin credentials.",
        "Set ONE of the following:",
        "1) FIREBASE_SERVICE_ACCOUNT_KEY (full JSON string)",
        "2) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY",
        "3) GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON file)"
      ].join(" ")
    );
  }
}

function db() {
  return admin.firestore();
}

module.exports = {
  admin,
  initFirebase,
  db
};
