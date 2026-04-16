import admin from "firebase-admin";
import * as jose from "jose";

let adminInitialized = false;

function getAdminCreds() {
  return {
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "")
      .replace(/[^\x20-\x7E\n]/g, "")  // Strip non-printable / zero-width chars
      .replace(/\\n/g, "\n")            // Convert literal \n to real newlines
      .trim(),
  };
}

function hasAdminCreds(): boolean {
  const { projectId, clientEmail, privateKey } = getAdminCreds();
  return !!(projectId && clientEmail && privateKey);
}

function hasProjectId(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID
  );
}

export function isFirebaseConfigured(): boolean {
  return hasAdminCreds() || hasProjectId();
}

export interface DecodedFirebaseToken {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  signInProvider: string;
}

function getAdminApp(): admin.app.App {
  if (!adminInitialized) {
    if (!admin.apps.length) {
      const { projectId, clientEmail, privateKey } = getAdminCreds();
      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
      } else if (projectId) {
        // Fallback: Application Default Credentials (works in GCP-hosted environments)
        admin.initializeApp({ projectId });
      } else {
        throw new Error("Firebase is not configured: FIREBASE_PROJECT_ID is required.");
      }
    }
    adminInitialized = true;
  }
  return admin.app();
}

async function verifyWithAdminSdk(idToken: string): Promise<DecodedFirebaseToken> {
  const app = getAdminApp();
  const decoded = await app.auth().verifyIdToken(idToken);
  const signInProvider = (decoded.firebase?.sign_in_provider as string) ?? "";
  return {
    uid: decoded.uid,
    email: decoded.email ?? "",
    name: (decoded.name as string) ?? decoded.email ?? "",
    emailVerified: decoded.email_verified ?? false,
    signInProvider,
  };
}

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

async function verifyWithJwks(idToken: string): Promise<DecodedFirebaseToken> {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "";

  const certMapRes = await fetch(FIREBASE_CERTS_URL);
  if (!certMapRes.ok) throw new Error("Failed to fetch Firebase public keys");
  const certMap: Record<string, string> = await certMapRes.json();

  const header = jose.decodeProtectedHeader(idToken);
  const kid = header.kid;
  if (!kid || !certMap[kid]) throw new Error("Firebase token: unknown key ID");

  const publicKey = await jose.importX509(certMap[kid], "RS256");
  const { payload } = await jose.jwtVerify(idToken, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });

  const firebase = (payload as Record<string, unknown>).firebase as
    | Record<string, unknown>
    | undefined;
  const signInProvider = (firebase?.sign_in_provider as string) ?? "";

  return {
    uid: payload.sub ?? "",
    email: (payload.email as string) ?? "",
    name: (payload.name as string) ?? (payload.email as string) ?? "",
    emailVerified: (payload.email_verified as boolean) ?? false,
    signInProvider,
  };
}

export async function verifyFirebaseToken(
  idToken: string
): Promise<DecodedFirebaseToken> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured: missing project ID");
  }
  if (hasAdminCreds()) {
    return verifyWithAdminSdk(idToken);
  }
  return verifyWithJwks(idToken);
}

export function getFirestoreDb(): admin.firestore.Firestore {
  const app = getAdminApp();
  return app.firestore();
}
