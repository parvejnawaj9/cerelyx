"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";
import { firebaseClientConfig, USE_EMULATORS } from "@/lib/env";

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseClientConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to the local Emulator Suite exactly once (HMR-safe).
declare global {
  var __CERELYX_EMULATORS_CONNECTED__: boolean | undefined;
}

if (
  USE_EMULATORS &&
  typeof window !== "undefined" &&
  !globalThis.__CERELYX_EMULATORS_CONNECTED__
) {
  globalThis.__CERELYX_EMULATORS_CONNECTED__ = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  // Against the Auth emulator, skip the real reCAPTCHA for phone sign-in so the
  // OTP flow is testable locally (the emulator returns the code in its console).
  // Double-guarded on NODE_ENV so a misconfigured production build can never
  // disable real app verification.
  if (process.env.NODE_ENV !== "production") {
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

// Firebase Analytics — browser-only, support-guarded, and skipped against the
// emulators or when no measurementId is configured.
if (
  typeof window !== "undefined" &&
  !USE_EMULATORS &&
  firebaseClientConfig.measurementId
) {
  import("firebase/analytics")
    .then(({ isSupported, getAnalytics }) =>
      isSupported().then((ok) => {
        if (ok) getAnalytics(app);
      })
    )
    .catch(() => {});
}

export { app };
