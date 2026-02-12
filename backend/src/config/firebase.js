const admin = require("firebase-admin");
require("dotenv").config();

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function buildCredentialFromEnv() {
  const rawServiceAccount = env("FIREBASE_SERVICE_ACCOUNT_KEY", "SERVICE_ACCOUNT_KEY");
  if (rawServiceAccount) {
    const parsed = JSON.parse(rawServiceAccount);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  const projectId = env("FIREBASE_PROJECT_ID", "PROJECT_ID");
  const clientEmail = env("FIREBASE_CLIENT_EMAIL", "CLIENT_EMAIL");
  const privateKey = env("FIREBASE_PRIVATE_KEY", "PRIVATE_KEY");

  if (projectId && clientEmail && privateKey) {
    return {
      type: env("FIREBASE_TYPE", "TYPE") || "service_account",
      project_id: projectId,
      private_key_id: env("FIREBASE_PRIVATE_KEY_ID", "PRIVATE_KEY_ID"),
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: clientEmail,
      client_id: env("FIREBASE_CLIENT_ID", "CLIENT_ID"),
      auth_uri: env("FIREBASE_AUTH_URI", "AUTH_URI"),
      token_uri: env("FIREBASE_TOKEN_URI", "TOKEN_URI"),
      auth_provider_x509_cert_url: env("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", "AUTH_PROVIDER_X509_CERT_URL"),
      client_x509_cert_url: env("FIREBASE_CLIENT_X509_CERT_URL", "CLIENT_X509_CERT_URL"),
      universe_domain: env("FIREBASE_UNIVERSE_DOMAIN", "UNIVERSE_DOMAIN")
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
      storageBucket: env("FIREBASE_STORAGE_BUCKET", "STORAGE_BUCKET") || undefined
    });
  }

  // Fallback to Application Default Credentials if available
  // (for example via GOOGLE_APPLICATION_CREDENTIALS).
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: env("FIREBASE_STORAGE_BUCKET", "STORAGE_BUCKET") || undefined
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
