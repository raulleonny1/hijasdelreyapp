import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function parseServiceAccountJson(raw: string): ServiceAccount {
  const trimmed = raw.trim();
  const json =
    trimmed.startsWith("{") ? trimmed : Buffer.from(trimmed, "base64").toString("utf-8");
  const sa = JSON.parse(json) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (!sa.client_email || !sa.private_key) {
    throw new Error("JSON de cuenta de servicio incompleto (client_email o private_key).");
  }
  return {
    projectId: sa.project_id ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    clientEmail: sa.client_email,
    privateKey: sa.private_key.replace(/\\n/g, "\n"),
  };
}

function loadServiceAccount(): ServiceAccount {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "hijasdelreyapp-d99b1";

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonEnv) {
    return parseServiceAccountJson(jsonEnv);
  }

  const base64Env = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (base64Env) {
    return parseServiceAccountJson(base64Env);
  }

  throw new Error(
    "Firebase Admin no configurado. En Vercel o .env.local agregue FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, o FIREBASE_SERVICE_ACCOUNT_JSON. Vea CONFIGURAR-FIREBASE.md",
  );
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const serviceAccount = loadServiceAccount();
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });

  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
