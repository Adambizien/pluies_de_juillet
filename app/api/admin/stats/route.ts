import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { User } from "@/src/entities/User";
import { Registration } from "@/src/entities/Registration";
import { Event } from "@/src/entities/Event";
import { Conference } from "@/src/entities/Conference";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const userRepository = await getRepository(User);
    const registrationRepository = await getRepository(Registration);
    const eventRepository = await getRepository(Event);
    const conferenceRepository = await getRepository(Conference);

    const [usersCount, registrationsCount, eventsCount, conferencesCount] = await Promise.all([
      userRepository.count(),
      registrationRepository.count(),
      eventRepository.count(),
      conferenceRepository.count(),
    ]);

    return Response.json({
      usersCount,
      registrationsCount,
      eventsCount,
      conferencesCount,
    });
  } catch (error) {
    console.error("Erreur récupération statistiques:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
