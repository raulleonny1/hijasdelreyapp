import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };
export const db = getFirestore(app);
