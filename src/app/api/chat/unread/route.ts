import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUnreadSummary } from "@/lib/chat-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const summary = await getUnreadSummary(session.id);
    return NextResponse.json(summary);
  } catch (e) {
    console.error("[chat unread]", e);
    return NextResponse.json({ total: 0, byRoom: {} });
  }
}
