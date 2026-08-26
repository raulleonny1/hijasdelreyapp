import { redirect } from "next/navigation";
import { ChatApp } from "@/components/ChatApp";
import { getSession } from "@/lib/auth";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?from=/chat");
  }

  return (
    <ChatApp
      user={{
        id: session.id,
        nombre: session.nombre,
        apellido: session.apellido,
        email: session.email,
      }}
    />
  );
}
