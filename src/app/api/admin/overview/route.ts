import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStudyOverviewByUser, listAllUsers } from "@/lib/admin-db";
import { aggregateLoginsByDay, listLoginEvents } from "@/lib/login-log-db";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [users, events] = await Promise.all([listAllUsers(), listLoginEvents(90)]);
    const overview = await getStudyOverviewByUser(users.map((u) => u.id));
    const byDay = aggregateLoginsByDay(events);

    const today = new Date().toISOString().slice(0, 10);
    const todayStat = byDay.find((d) => d.day === today);

    const members = users.map((u) => ({
      ...u,
      progress: overview[u.id] ?? {
        userId: u.id,
        overallPercent: 0,
        courses: [],
        startedCourses: [],
        lastActivityAt: null,
      },
    }));

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        loginsToday: todayStat?.count ?? 0,
        uniqueLoginsToday: todayStat?.uniqueUsers ?? 0,
        loginsLast30Days: events.length,
        avgProgress:
          members.length === 0
            ? 0
            : Math.round(
                members.reduce((s, m) => s + m.progress.overallPercent, 0) / members.length
              ),
      },
      members,
      loginsByDay: byDay.slice(0, 60),
      recentLogins: events.slice(0, 40),
      allLogins: events,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Firebase Admin no configurado") || msg.includes("FIREBASE")) {
      return NextResponse.json(
        { error: "Firebase no está configurado en el servidor." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Error al cargar el panel de administración." }, { status: 500 });
  }
}
