import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import Stripe from "stripe";
import { Registration } from "@/src/entities/Registration";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

async function getUserIdByEmail(email: string): Promise<number | null> {
  const registrationRepository = await getRepository(Registration);
  const result = await registrationRepository.query(
    'SELECT id FROM "users" WHERE email = $1',
    [email]
  );
  return result.length > 0 ? result[0].id : null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json(
        { error: "sessionId requis" },
        { status: 400 }
      );
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return Response.json(
        { error: "Paiement non confirmé" },
        { status: 400 }
      );
    }

    const eventId = stripeSession.metadata?.eventId;
    const userEmail = session.user.email;

    if (!eventId) {
      return Response.json(
        { error: "Événement non trouvé dans les métadonnées" },
        { status: 400 }
      );
    }

    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      return Response.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const registrationRepository = await getRepository(Registration);

    const existingRegistration = await registrationRepository.findOne({
      where: {
        userId: userId,
        eventId: parseInt(eventId),
      },
    });

    if (existingRegistration) {
      return Response.json({ success: true, alreadyExists: true });
    }

    await registrationRepository.save({
      userId: userId,
      eventId: parseInt(eventId),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur confirmation paiement:", error);
    return Response.json(
      { error: "Erreur lors de la confirmation du paiement" },
      { status: 500 }
    );
  }
}
