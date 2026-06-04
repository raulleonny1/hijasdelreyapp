import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase no está configurado. Revise las variables de entorno.");
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getClientFirestore() {
  return getFirestore(getFirebaseApp());
}
