import type { DocumentData } from "firebase-admin/firestore";
import { getAdminBucket, getAdminFirestore } from "@/lib/firebase/admin";
import type {
  ChatLocale,
  ChatMember,
  ChatMessage,
  ChatRoom,
} from "@/types/chat";
import { COMMUNITY_ROOM_ID } from "@/types/chat";

const ROOMS = "chatRooms";
const MESSAGES = "messages";

function displayName(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`.trim();
}

function toRoom(id: string, data: DocumentData): ChatRoom {
  return {
    id,
    type: data.type === "dm" ? "dm" : "community",
    name: String(data.name ?? ""),
    memberIds: Array.isArray(data.memberIds) ? data.memberIds.map(String) : [],
    lastMessageAt: data.lastMessageAt ? String(data.lastMessageAt) : null,
    lastMessagePreview: String(data.lastMessagePreview ?? ""),
    updatedAt: String(data.updatedAt ?? data.lastMessageAt ?? ""),
  };
}

function toMessage(roomId: string, id: string, data: DocumentData): ChatMessage {
  const locale = data.sourceLocale === "en" ? "en" : "es";
  return {
    id,
    roomId,
    senderId: String(data.senderId ?? ""),
    senderName: String(data.senderName ?? ""),
    type: data.type === "audio" ? "audio" : "text",
    text: String(data.text ?? ""),
    sourceLocale: locale,
    audioPath: data.audioPath ? String(data.audioPath) : undefined,
    audioDurationMs:
      typeof data.audioDurationMs === "number" ? data.audioDurationMs : undefined,
    createdAt: String(data.createdAt ?? ""),
  };
}

export function dmRoomId(userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `dm_${a}_${b}`;
}

export async function ensureCommunityRoom(): Promise<ChatRoom> {
  const db = getAdminFirestore();
  const ref = db.collection(ROOMS).doc(COMMUNITY_ROOM_ID);
  const snap = await ref.get();
  if (snap.exists) {
    return toRoom(snap.id, snap.data()!);
  }
  const now = new Date().toISOString();
  const data = {
    type: "community",
    name: "Comunidad",
    memberIds: [] as string[],
    lastMessageAt: null as string | null,
    lastMessagePreview: "",
    updatedAt: now,
    createdAt: now,
  };
  await ref.set(data);
  return toRoom(COMMUNITY_ROOM_ID, data);
}

export async function listRoomsForUser(
  userId: string,
  nameById: Map<string, string>,
): Promise<ChatRoom[]> {
  const db = getAdminFirestore();
  await ensureCommunityRoom();

  const community = await db.collection(ROOMS).doc(COMMUNITY_ROOM_ID).get();
  const rooms: ChatRoom[] = [];

  if (community.exists) {
    const r = toRoom(community.id, community.data()!);
    r.displayName = r.name || "Comunidad";
    rooms.push(r);
  }

  const dmSnap = await db
    .collection(ROOMS)
    .where("memberIds", "array-contains", userId)
    .get();

  for (const doc of dmSnap.docs) {
    const data = doc.data();
    if (data.type !== "dm") continue;
    const r = toRoom(doc.id, data);
    const otherId = r.memberIds.find((id) => id !== userId);
    r.displayName = otherId ? nameById.get(otherId) ?? "Miembro" : "Chat privado";
    rooms.push(r);
  }

  rooms.sort((a, b) => {
    if (a.type === "community" && b.type !== "community") return -1;
    if (b.type === "community" && a.type !== "community") return 1;
    const ta = a.lastMessageAt ?? a.updatedAt ?? "";
    const tb = b.lastMessageAt ?? b.updatedAt ?? "";
    return tb.localeCompare(ta);
  });

  return rooms;
}

export async function getOrCreateDmRoom(
  userId: string,
  otherUserId: string,
  otherName: string,
): Promise<ChatRoom> {
  if (userId === otherUserId) {
    throw new Error("INVALID_DM");
  }
  const db = getAdminFirestore();
  const id = dmRoomId(userId, otherUserId);
  const ref = db.collection(ROOMS).doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    const r = toRoom(snap.id, snap.data()!);
    r.displayName = otherName;
    return r;
  }
  const now = new Date().toISOString();
  const data = {
    type: "dm",
    name: "",
    memberIds: [userId, otherUserId].sort(),
    lastMessageAt: null as string | null,
    lastMessagePreview: "",
    updatedAt: now,
    createdAt: now,
  };
  await ref.set(data);
  const r = toRoom(id, data);
  r.displayName = otherName;
  return r;
}

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
  const db = getAdminFirestore();
  if (roomId === COMMUNITY_ROOM_ID) {
    return ensureCommunityRoom();
  }
  const snap = await db.collection(ROOMS).doc(roomId).get();
  if (!snap.exists) return null;
  return toRoom(snap.id, snap.data()!);
}

export function canAccessRoom(room: ChatRoom, userId: string): boolean {
  if (room.type === "community") return true;
  return room.memberIds.includes(userId);
}

async function signedUrlForPath(path: string): Promise<string | undefined> {
  try {
    const bucket = getAdminBucket();
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });
    return url;
  } catch (e) {
    console.error("[chat] signedUrl", e);
    return undefined;
  }
}

export async function listMessages(
  roomId: string,
  opts?: { after?: string; limit?: number },
): Promise<ChatMessage[]> {
  const db = getAdminFirestore();
  const limit = Math.min(opts?.limit ?? 80, 150);
  let query = db
    .collection(ROOMS)
    .doc(roomId)
    .collection(MESSAGES)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (opts?.after) {
    query = db
      .collection(ROOMS)
      .doc(roomId)
      .collection(MESSAGES)
      .where("createdAt", ">", opts.after)
      .orderBy("createdAt", "asc")
      .limit(limit);
  }

  const snap = await query.get();
  const messages = snap.docs.map((doc) => toMessage(roomId, doc.id, doc.data()));

  if (!opts?.after) {
    messages.reverse();
  }

  await Promise.all(
    messages.map(async (m) => {
      if (m.audioPath) {
        m.audioUrl = await signedUrlForPath(m.audioPath);
      }
    }),
  );

  return messages;
}

async function touchRoom(roomId: string, preview: string, at: string) {
  const db = getAdminFirestore();
  await db.collection(ROOMS).doc(roomId).set(
    {
      lastMessageAt: at,
      lastMessagePreview: preview.slice(0, 120),
      updatedAt: at,
    },
    { merge: true },
  );
}

export async function sendTextMessage(input: {
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  sourceLocale: ChatLocale;
}): Promise<ChatMessage> {
  const text = input.text.trim();
  if (!text || text.length > 4000) {
    throw new Error("BAD_TEXT");
  }
  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const ref = db.collection(ROOMS).doc(input.roomId).collection(MESSAGES).doc();
  const data = {
    senderId: input.senderId,
    senderName: input.senderName,
    type: "text",
    text,
    sourceLocale: input.sourceLocale,
    createdAt: now,
  };
  await ref.set(data);
  await touchRoom(input.roomId, text, now);
  return toMessage(input.roomId, ref.id, data);
}

export async function sendAudioMessage(input: {
  roomId: string;
  senderId: string;
  senderName: string;
  sourceLocale: ChatLocale;
  audioBuffer: Buffer;
  contentType: string;
  durationMs: number;
  ext: string;
}): Promise<ChatMessage> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const ref = db.collection(ROOMS).doc(input.roomId).collection(MESSAGES).doc();
  const path = `chat-audio/${input.roomId}/${ref.id}.${input.ext}`;

  const bucket = getAdminBucket();
  await bucket.file(path).save(input.audioBuffer, {
    contentType: input.contentType,
    metadata: { cacheControl: "private, max-age=3600" },
  });

  const data = {
    senderId: input.senderId,
    senderName: input.senderName,
    type: "audio",
    text: "",
    sourceLocale: input.sourceLocale,
    audioPath: path,
    audioDurationMs: input.durationMs,
    createdAt: now,
  };
  await ref.set(data);
  await touchRoom(input.roomId, "🎤 Audio", now);

  const message = toMessage(input.roomId, ref.id, data);
  message.audioUrl = await signedUrlForPath(path);
  return message;
}

export async function listChatMembers(excludeUserId: string): Promise<ChatMember[]> {
  const db = getAdminFirestore();
  const snap = await db.collection("users").get();
  const members: ChatMember[] = [];
  for (const doc of snap.docs) {
    if (doc.id === excludeUserId) continue;
    const data = doc.data();
    members.push({
      id: doc.id,
      nombre: String(data.nombre ?? ""),
      apellido: String(data.apellido ?? ""),
    });
  }
  members.sort((a, b) =>
    displayName(a.nombre, a.apellido).localeCompare(
      displayName(b.nombre, b.apellido),
      "es",
    ),
  );
  return members;
}

export async function buildNameMap(): Promise<Map<string, string>> {
  const db = getAdminFirestore();
  const snap = await db.collection("users").get();
  const map = new Map<string, string>();
  for (const doc of snap.docs) {
    const data = doc.data();
    map.set(doc.id, displayName(String(data.nombre ?? ""), String(data.apellido ?? "")));
  }
  return map;
}

const READS = "chatReads";

export async function markRoomRead(userId: string, roomId: string, at?: string): Promise<void> {
  const db = getAdminFirestore();
  const when = at ?? new Date().toISOString();
  await db.collection(READS).doc(userId).set(
    {
      rooms: {
        [roomId]: when,
      },
      updatedAt: when,
    },
    { merge: true },
  );
}

async function getReadMap(userId: string): Promise<Record<string, string>> {
  const db = getAdminFirestore();
  const snap = await db.collection(READS).doc(userId).get();
  if (!snap.exists) return {};
  const rooms = snap.data()?.rooms;
  if (!rooms || typeof rooms !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rooms)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/** First visit: baseline so only new messages count as unread. */
async function ensureReadBaseline(
  userId: string,
  rooms: ChatRoom[],
): Promise<Record<string, string>> {
  const existing = await getReadMap(userId);
  const now = new Date().toISOString();
  const updates: Record<string, string> = {};
  let changed = false;

  for (const room of rooms) {
    if (!existing[room.id]) {
      updates[room.id] = room.lastMessageAt ?? now;
      changed = true;
    }
  }

  if (changed) {
    const db = getAdminFirestore();
    await db.collection(READS).doc(userId).set(
      {
        rooms: { ...existing, ...updates },
        updatedAt: now,
      },
      { merge: true },
    );
    return { ...existing, ...updates };
  }
  return existing;
}

async function countUnreadInRoom(
  roomId: string,
  userId: string,
  lastReadAt: string,
  lastMessageAt: string | null,
): Promise<number> {
  if (!lastMessageAt || lastMessageAt <= lastReadAt) return 0;

  const db = getAdminFirestore();
  const snap = await db
    .collection(ROOMS)
    .doc(roomId)
    .collection(MESSAGES)
    .where("createdAt", ">", lastReadAt)
    .orderBy("createdAt", "asc")
    .limit(100)
    .get();

  let n = 0;
  for (const doc of snap.docs) {
    if (String(doc.data().senderId ?? "") !== userId) n += 1;
  }
  return n;
}

export async function getUnreadSummary(userId: string): Promise<{
  total: number;
  byRoom: Record<string, number>;
}> {
  const nameById = await buildNameMap();
  const rooms = await listRoomsForUser(userId, nameById);
  const reads = await ensureReadBaseline(userId, rooms);
  const byRoom: Record<string, number> = {};
  let total = 0;

  await Promise.all(
    rooms.map(async (room) => {
      const lastRead = reads[room.id] ?? "1970-01-01T00:00:00.000Z";
      const count = await countUnreadInRoom(
        room.id,
        userId,
        lastRead,
        room.lastMessageAt,
      );
      if (count > 0) {
        byRoom[room.id] = count;
        total += count;
      }
    }),
  );

  return { total, byRoom };
}
