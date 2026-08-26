import { redirect } from "next/navigation";
import { PrayerApp } from "@/components/PrayerApp";
import { getSession } from "@/lib/auth";

export default async function OracionPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?from=/oracion");
  }

  return (
    <PrayerApp
      user={{
        id: session.id,
        nombre: session.nombre,
        apellido: session.apellido,
      }}
    />
  );
}
