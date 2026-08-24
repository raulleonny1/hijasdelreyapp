import { getAdminFirestore } from "@/lib/firebase/admin";

const LOGIN_EVENTS = "login_events";

export type LoginEvent = {
  id: string;
  userId: string;
  nombre: string;
  apellido: string;
  email: string;
  at: string;
  day: string; // YYYY-MM-DD (UTC)
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function logLoginEvent(user: {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}): Promise<void> {
  const db = getAdminFirestore();
  const at = new Date().toISOString();
  await db.collection(LOGIN_EVENTS).add({
    userId: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    at,
    day: dayKey(at),
  });
}

export async function listLoginEvents(daysBack = 30): Promise<LoginEvent[]> {
  const db = getAdminFirestore();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - daysBack);
  const sinceIso = since.toISOString();

  // Sin índice compuesto: leemos y filtramos en memoria (volumen moderado).
  const snap = await db.collection(LOGIN_EVENTS).limit(5000).get();

  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userId: String(d.userId ?? ""),
        nombre: String(d.nombre ?? ""),
        apellido: String(d.apellido ?? ""),
        email: String(d.email ?? ""),
        at: String(d.at ?? ""),
        day: String(d.day ?? dayKey(String(d.at ?? ""))),
      };
    })
    .filter((e) => e.at >= sinceIso)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export type DayLoginStat = {
  day: string;
  count: number;
  uniqueUsers: number;
};

export function aggregateLoginsByDay(events: LoginEvent[]): DayLoginStat[] {
  const map = new Map<string, { count: number; users: Set<string> }>();
  for (const e of events) {
    const cur = map.get(e.day) ?? { count: 0, users: new Set<string>() };
    cur.count += 1;
    if (e.userId) cur.users.add(e.userId);
    map.set(e.day, cur);
  }
  return [...map.entries()]
    .map(([day, v]) => ({
      day,
      count: v.count,
      uniqueUsers: v.users.size,
    }))
    .sort((a, b) => b.day.localeCompare(a.day));
}
