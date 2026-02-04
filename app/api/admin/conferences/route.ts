import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { Conference } from "@/src/entities/Conference";
import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/getUserRole";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(userId);
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { eventId, title, description, startDatetime, endDatetime, conferenceCategoryId, isVisible } = await req.json();

    if (!eventId || !title || !description || !startDatetime || !endDatetime || !conferenceCategoryId) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const conferenceRepository = await getRepository(Conference);

    const newConference = conferenceRepository.create({
      eventId: parseInt(eventId),
      title: title.trim(),
      description: description.trim(),
      startDatetime: new Date(startDatetime),
      endDatetime: new Date(endDatetime),
      conferenceCategoryId: parseInt(conferenceCategoryId),
      isVisible: isVisible !== undefined ? isVisible : true,
    });

    const savedConference = await conferenceRepository.save(newConference);

    return NextResponse.json(savedConference, { status: 201 });
  } catch (error) {
    console.error("Erreur création conférence:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(userId);
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id, title, description, startDatetime, endDatetime, conferenceCategoryId, isVisible } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "L'ID est requis" },
        { status: 400 }
      );
    }

    const conferenceRepository = await getRepository(Conference);

    const conference = await conferenceRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!conference) {
      return NextResponse.json(
        { error: "Conférence non trouvée" },
        { status: 404 }
      );
    }

    if (title) conference.title = title.trim();
    if (description) conference.description = description.trim();
    if (startDatetime) conference.startDatetime = new Date(startDatetime);
    if (endDatetime) conference.endDatetime = new Date(endDatetime);
    if (conferenceCategoryId) conference.conferenceCategoryId = parseInt(conferenceCategoryId);
    if (isVisible !== undefined) conference.isVisible = isVisible;

    const updatedConference = await conferenceRepository.save(conference);

    return NextResponse.json(updatedConference, { status: 200 });
  } catch (error) {
    console.error("Erreur modification conférence:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(userId);
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("conferenceId");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID est requis" },
        { status: 400 }
      );
    }

    const conferenceRepository = await getRepository(Conference);

    const conference = await conferenceRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!conference) {
      return NextResponse.json(
        { error: "Conférence non trouvée" },
        { status: 404 }
      );
    }

    await conferenceRepository.remove(conference);

    return NextResponse.json({ message: "Conférence supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur suppression conférence:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
