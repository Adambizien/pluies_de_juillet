import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { UserProgram } from "@/src/entities/UserProgram";
import { User } from "@/src/entities/User";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}


export async function GET(request: NextRequest) {
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

    const userProgramRepository = await getRepository(UserProgram);
    const programs = await userProgramRepository.find({
      where: { userId: user.id },
      relations: ["conference", "conference.category"],
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Erreur récupération planning:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { conferenceIds } = body;

    if (!Array.isArray(conferenceIds)) {
      return NextResponse.json(
        { error: "conferenceIds doit être un tableau" },
        { status: 400 }
      );
    }

    const userProgramRepository = await getRepository(UserProgram);

    await userProgramRepository.delete({ userId: user.id });

    const programs = conferenceIds.map((conferenceId) => {
      const program = new UserProgram();
      program.userId = user.id;
      program.conferenceId = conferenceId;
      return program;
    });

    if (programs.length > 0) {
      await userProgramRepository.save(programs);
    }

    return NextResponse.json({ success: true, count: programs.length });
  } catch (error) {
    console.error("Erreur sauvegarde planning:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
