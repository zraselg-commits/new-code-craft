import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const isConfigured =
  !!FIREBASE_PROJECT_ID && !!FIREBASE_CLIENT_EMAIL && !!FIREBASE_PRIVATE_KEY;

if (isConfigured) {
  try {
    adminApp = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  } catch (e) {
    console.error("Firebase Admin init failed:", e);
  }
}

export const firebaseConfigured = isConfigured && adminApp !== null;

export async function verifyFirebaseToken(idToken: string) {
  if (!firebaseConfigured) throw new Error("Firebase not configured");
  const decoded = await getAuth(adminApp!).verifyIdToken(idToken);
  const signInProvider = (decoded.firebase as { sign_in_provider?: string })?.sign_in_provider ?? "";
  return {
    uid: decoded.uid,
    email: decoded.email ?? "",
    emailVerified: decoded.email_verified ?? false,
    name: decoded.name ?? decoded.email ?? "User",
    picture: decoded.picture,
    signInProvider,
  };
}
