import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { Registration } from "@/src/entities/Registration";
import { User } from "@/src/entities/User";

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
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRepository = await getRepository(User);
    const user = await userRepository.findOne({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const registrationRepository = await getRepository(Registration);
    const registrations = await registrationRepository.find({
      where: { userId: user.id },
      relations: [
        "event",
        "event.conferences",
        "event.conferences.category"
      ],
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Erreur récupération inscriptions:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
