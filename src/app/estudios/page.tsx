import { EstudiosPageClient } from "@/components/EstudiosPageClient";
import { getSession } from "@/lib/auth";
import { getCourseCatalog } from "@/lib/courses";
import { getRequestLocale } from "@/lib/locale-server";

type Props = {
  searchParams?: Promise<{ registrado?: string }>;
};

export default async function EstudiosPage({ searchParams }: Props) {
  const locale = await getRequestLocale();
  const courses = getCourseCatalog(locale);
  const session = await getSession();
  const params = searchParams ? await searchParams : {};
  const justRegistered = params.registrado === "1";

  return (
    <EstudiosPageClient
      courses={courses}
      sessionNombre={session?.nombre ?? null}
      justRegistered={justRegistered}
    />
  );
}
