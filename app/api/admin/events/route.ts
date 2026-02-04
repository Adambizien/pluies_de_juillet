import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { Event } from "@/src/entities/Event";
import { Conference } from "@/src/entities/Conference";
import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const eventRepository = await getRepository(Event);
    const events = await eventRepository.find({
      relations: ["category", "conferences", "conferences.category"],
      order: { startDate: "DESC" },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération événements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { title, description, startDate, endDate, eventCategoryId, isVisible, price } = await req.json();

    if (!title || !description || !startDate || !endDate || !eventCategoryId || price === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const eventRepository = await getRepository(Event);

    const newEvent = eventRepository.create({
      title: title.trim(),
      description: description.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eventCategoryId: parseInt(eventCategoryId),
      isVisible: isVisible !== undefined ? isVisible : true,
      price: parseInt(price),
    });

    const savedEvent = await eventRepository.save(newEvent);

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error("Erreur création événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id, title, description, startDate, endDate, eventCategoryId, isVisible, price } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "L'ID est requis" },
        { status: 400 }
      );
    }

    const eventRepository = await getRepository(Event);

    const event = await eventRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (eventCategoryId) event.eventCategoryId = parseInt(eventCategoryId);
    if (isVisible !== undefined) event.isVisible = isVisible;
    if (price !== undefined) event.price = parseInt(price);

    const updatedEvent = await eventRepository.save(event);

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Erreur modification événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("eventId");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID est requis" },
        { status: 400 }
      );
    }

    const eventRepository = await getRepository(Event);
    const conferenceRepository = await getRepository(Conference);

    const event = await eventRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    await conferenceRepository.delete({ eventId: parseInt(id) });

    await eventRepository.remove(event);

    return NextResponse.json({ message: "Événement supprimé" }, { status: 200 });
  } catch (error) {
    console.error("Erreur suppression événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
