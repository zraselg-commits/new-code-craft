const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const authDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  (projectId ? `${projectId}.firebaseapp.com` : "");

export const firebaseEnabled = !!(apiKey && projectId && appId);

export async function signInWithGoogle(): Promise<string> {
  if (!firebaseEnabled) throw new Error("Firebase is not configured");

  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");

  const firebaseConfig = { apiKey, authDomain, projectId, appId };

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
