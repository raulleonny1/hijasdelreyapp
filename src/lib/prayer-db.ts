import type { DocumentData } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { PrayerRequest } from "@/types/prayer";

const COLLECTION = "prayerRequests";
const MAX_TEXT = 2000;

function toPrayer(id: string, data: DocumentData): PrayerRequest {
  return {
    id,
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    text: String(data.text ?? ""),
    shareWithOthers: data.shareWithOthers === true,
    createdAt: String(data.createdAt ?? ""),
  };
}

export async function listSharedPrayerRequests(limit = 80): Promise<PrayerRequest[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where("shareWithOthers", "==", true)
    .limit(Math.min(limit, 100))
    .get();

  const list = snap.docs.map((doc) => toPrayer(doc.id, doc.data()));
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

export async function listMyPrayerRequests(userId: string): Promise<PrayerRequest[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where("authorId", "==", userId)
    .limit(50)
    .get();

  const list = snap.docs.map((doc) => toPrayer(doc.id, doc.data()));
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

export async function createPrayerRequest(input: {
  authorId: string;
  authorName: string;
  text: string;
  shareWithOthers: boolean;
}): Promise<PrayerRequest> {
  const text = input.text.trim();
  if (!text || text.length > MAX_TEXT) {
    throw new Error("BAD_TEXT");
  }
  if (!input.shareWithOthers) {
    throw new Error("CONSENT_REQUIRED");
  }

  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const ref = db.collection(COLLECTION).doc();
  const data = {
    authorId: input.authorId,
    authorName: input.authorName.trim().slice(0, 80),
    text,
    shareWithOthers: true,
    createdAt: now,
  };
  await ref.set(data);
  return toPrayer(ref.id, data);
}

export async function deletePrayerRequest(
  requestId: string,
  userId: string,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("NOT_FOUND");
  if (String(snap.data()?.authorId ?? "") !== userId) {
    throw new Error("FORBIDDEN");
  }
  await ref.delete();
}
