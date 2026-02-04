import { AppDataSource } from "@/src/data-source";
import { Registration } from "@/src/entities/Registration";
import { User } from "@/src/entities/User";
import { Event } from "@/src/entities/Event";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const registrationRepository = AppDataSource.getRepository(Registration);

    const registrations = await registrationRepository.find({
      relations: ["user", "user.userInfo", "event"],
      order: {
        createdAt: "DESC",
      },
    });

    return Response.json(registrations);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des inscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { userId, eventId } = await req.json();

    if (!userId || !eventId) {
      return Response.json(
        { error: "userId et eventId sont requis" },
        { status: 400 }
      );
    }

    const registrationRepository = AppDataSource.getRepository(Registration);
    const userRepository = AppDataSource.getRepository(User);
    const eventRepository = AppDataSource.getRepository(Event);


    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return Response.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const event = await eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      return Response.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    const existingRegistration = await registrationRepository.findOne({
      where: { userId, eventId },
    });
    if (existingRegistration) {
      return Response.json(
        { error: "Cet utilisateur est déjà inscrit à cet événement" },
        { status: 409 }
      );
    }


    const registration = new Registration();
    registration.userId = userId;
    registration.eventId = eventId;

    await registrationRepository.save(registration);

    const newRegistration = await registrationRepository.findOne({
      where: { id: registration.id },
      relations: ["user", "event"],
    });

    return Response.json(newRegistration, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'inscription:", error);
    return Response.json(
      { error: "Erreur lors de l'ajout de l'inscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return Response.json(
        { error: "L'ID de l'inscription est requis" },
        { status: 400 }
      );
    }

    const registrationRepository = AppDataSource.getRepository(Registration);

    const registration = await registrationRepository.findOne({
      where: { id: parseInt(registrationId) },
    });

    if (!registration) {
      return Response.json(
        { error: "Inscription non trouvée" },
        { status: 404 }
      );
    }

    await registrationRepository.remove(registration);

    return Response.json({ message: "Inscription supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription:", error);
    return Response.json(
      { error: "Erreur lors de la suppression de l'inscription" },
      { status: 500 }
    );
  }
}
