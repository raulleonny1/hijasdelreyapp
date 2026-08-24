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

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const db = getAdminFirestore();
  const doc = await db.collection(USERS).doc(id).get();
  if (!doc.exists) return undefined;
  return toUser(doc.id, doc.data()!);
}

export async function updateUser(
  id: string,
  input: {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    email: string;
    pin?: string;
  }
): Promise<UserRecord> {
  const db = getAdminFirestore();
  const existing = await getUserById(id);
  if (!existing) throw new Error("NOT_FOUND");

  const email = input.email.trim().toLowerCase();
  const other = await findUserByEmail(email);
  if (other && other.id !== id) throw new Error("EMAIL_EXISTS");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fechaNacimiento)) {
    throw new Error("BAD_BIRTHDATE");
  }

  let pinHash = existing.pinHash;
  if (input.pin && input.pin.length > 0) {
    if (!/^\d{4}$/.test(input.pin)) throw new Error("BAD_PIN");
    const taken = await findUserByPin(input.pin);
    if (taken && taken.id !== id) throw new Error("PIN_EXISTS");
    pinHash = await bcrypt.hash(input.pin, 10);
  }

  const updated: UserRecord = {
    ...existing,
    nombre: input.nombre.trim(),
    apellido: input.apellido.trim(),
    fechaNacimiento: input.fechaNacimiento,
    email,
    pinHash,
  };

  await db.collection(USERS).doc(id).set(
    {
      nombre: updated.nombre,
      apellido: updated.apellido,
      fechaNacimiento: updated.fechaNacimiento,
      email: updated.email,
      pinHash: updated.pinHash,
      createdAt: updated.createdAt,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return updated;
}

export async function deleteUserAndData(id: string): Promise<void> {
  const db = getAdminFirestore();
  const userRef = db.collection(USERS).doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error("NOT_FOUND");

  const batchSize = 400;

  // Borrar respuestas
  const answersSnap = await db.collection("answers").where("userId", "==", id).get();
  let batch = db.batch();
  let n = 0;
  for (const doc of answersSnap.docs) {
    batch.delete(doc.ref);
    n += 1;
    if (n >= batchSize) {
      await batch.commit();
      batch = db.batch();
      n = 0;
    }
  }

  // Borrar eventos de login
  const loginsSnap = await db.collection("login_events").where("userId", "==", id).get();
  for (const doc of loginsSnap.docs) {
    batch.delete(doc.ref);
    n += 1;
    if (n >= batchSize) {
      await batch.commit();
      batch = db.batch();
      n = 0;
    }
  }

  batch.delete(userRef);
  await batch.commit();
}
