import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { Registration } from "@/src/entities/Registration";
import { User } from "@/src/entities/User";
import { UserProgram } from "@/src/entities/UserProgram";
import { Conference } from "@/src/entities/Conference";
import { In } from "typeorm";

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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return NextResponse.json({ error: "registrationId manquant" }, { status: 400 });
    }

    const userRepository = await getRepository(User);
    const user = await userRepository.findOne({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const registrationRepository = await getRepository(Registration);
    const registration = await registrationRepository.findOne({
      where: { id: parseInt(registrationId, 10), userId: user.id },
    });

    if (!registration) {
      return NextResponse.json({ error: "Inscription non trouvée" }, { status: 404 });
    }

    const conferenceRepository = await getRepository(Conference);
    const conferences = await conferenceRepository.find({
      where: { eventId: registration.eventId },
      select: { id: true },
    });

    if (conferences.length > 0) {
      const conferenceIds = conferences.map((c) => c.id);
      const userProgramRepository = await getRepository(UserProgram);
      await userProgramRepository.delete({
        userId: user.id,
        conferenceId: In(conferenceIds),
      });
    }

    await registrationRepository.remove(registration);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur désinscription:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
