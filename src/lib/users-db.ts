import bcrypt from "bcryptjs";
import type { DocumentData } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type UserRecord = {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  pinHash: string;
  createdAt: string;
};

const USERS = "users";

function toUser(id: string, data: DocumentData): UserRecord {
  return {
    id,
    nombre: data.nombre,
    apellido: data.apellido,
    fechaNacimiento: data.fechaNacimiento,
    email: data.email,
    pinHash: data.pinHash,
    createdAt: data.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const db = getAdminFirestore();
  const normalized = email.trim().toLowerCase();
  const snap = await db.collection(USERS).where("email", "==", normalized).limit(1).get();
  if (snap.empty) return undefined;
  const doc = snap.docs[0];
  return toUser(doc.id, doc.data());
}

export async function findUserByPin(pin: string): Promise<UserRecord | undefined> {
  const db = getAdminFirestore();
  const snap = await db.collection(USERS).get();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.pinHash && (await bcrypt.compare(pin, data.pinHash))) {
      return toUser(doc.id, data);
    }
  }
  return undefined;
}

export async function isPinTaken(pin: string): Promise<boolean> {
  return !!(await findUserByPin(pin));
}

export async function createUser(input: {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  pin: string;
}): Promise<UserRecord> {
  const db = getAdminFirestore();
  const email = input.email.trim().toLowerCase();

  if (await findUserByEmail(email)) {
    throw new Error("EMAIL_EXISTS");
  }
  if (await isPinTaken(input.pin)) {
    throw new Error("PIN_EXISTS");
  }

  const pinHash = await bcrypt.hash(input.pin, 10);
  const ref = db.collection(USERS).doc();
  const user: UserRecord = {
    id: ref.id,
    nombre: input.nombre.trim(),
    apellido: input.apellido.trim(),
    fechaNacimiento: input.fechaNacimiento,
    email,
    pinHash,
    createdAt: new Date().toISOString(),
  };

  await ref.set({
    nombre: user.nombre,
    apellido: user.apellido,
    fechaNacimiento: user.fechaNacimiento,
    email: user.email,
    pinHash: user.pinHash,
    createdAt: user.createdAt,
  });

  return user;
}
