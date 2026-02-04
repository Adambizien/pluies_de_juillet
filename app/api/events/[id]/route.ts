import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/src/entities/Event";
import { Conference } from "@/src/entities/Conference";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const eventRepository = await getRepository(Event);
    const event = await eventRepository.findOne({
      where: { id: eventId },
      relations: ["category", "conferences", "conferences.category"],
    });

    if (!event) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    if (event.conferences) {
      event.conferences.sort((a: Conference, b: Conference) =>
        new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime()
      );
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération événement public:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
