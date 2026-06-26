import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { USE_EMULATORS, firebaseClientConfig } from "@/lib/env";

/**
 * Firebase Admin SDK (server-only). The Admin SDK bypasses security rules, so
 * it is used for trusted server operations: session cookies, subdomain
 * reservation, and serving private-site content after a server-side check.
 *
 * Local dev: the Admin SDK auto-connects to the emulators when the
 * *_EMULATOR_HOST env vars are present. We set sensible defaults here so it
 * works even if they were omitted from .env.local.
 */

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  firebaseClientConfig.projectId;

const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  firebaseClientConfig.storageBucket;

if (USE_EMULATORS) {
  process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
}

function createApp(): App {
  if (USE_EMULATORS) {
    // No real credentials needed against the emulators.
    return initializeApp({ projectId, storageBucket });
  }

  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    const parsed = JSON.parse(rawKey) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return initializeApp({
      credential: cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        // Support escaped newlines when the key is provided as a single line.
        privateKey: parsed.private_key.replace(/\\n/g, "\n"),
      }),
      projectId: parsed.project_id,
      storageBucket,
    });
  }

  // Application Default Credentials — used on Firebase App Hosting / Cloud Run.
  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket,
  });
}

const adminApp: App = getApps().length ? getApps()[0]! : createApp();

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export const adminStorage: Storage = getStorage(adminApp);
export { adminApp };
