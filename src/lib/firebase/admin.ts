import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON no configurado. Descargue la clave de cuenta de servicio en Firebase Console.",
    );
  }

  const serviceAccount = JSON.parse(json);

  adminApp = initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId: serviceAccount.project_id ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
