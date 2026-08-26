import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { translateText } from "@/lib/chat-translate";
import type { ChatLocale } from "@/types/chat";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const text = params.get("text") ?? "";
  const from: ChatLocale = params.get("from") === "en" ? "en" : "es";
  const to: ChatLocale = params.get("to") === "en" ? "en" : "es";

  if (!text.trim()) {
    return NextResponse.json({ translated: "" });
  }

  if (from === to) {
    return NextResponse.json({ translated: text });
  }

  try {
    const translated = await translateText(text, from, to);
    return NextResponse.json({
      translated: translated ?? text,
      fallback: !translated,
    });
  } catch (e) {
    console.error("[chat translate]", e);
    return NextResponse.json({ translated: text, fallback: true });
  }
}
