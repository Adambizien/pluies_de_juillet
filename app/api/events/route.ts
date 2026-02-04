import { Event } from "@/src/entities/Event";
import { NextResponse } from "next/server";
import { MoreThan } from "typeorm";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function GET() {
  try {
    const eventRepository = await getRepository(Event);
    const now = new Date();
    const events = await eventRepository.find({
      where: { 
        isVisible: true,
        endDate: MoreThan(now)
      },
      relations: ["category", "conferences", "conferences.category"],
      order: { startDate: "DESC" },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération événements publics:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
