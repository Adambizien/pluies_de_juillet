import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import Stripe from "stripe";
import { Event } from "@/src/entities/Event";
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Vous devez être connecté pour accéder au paiement" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return Response.json(
        { error: "eventId est requis" },
        { status: 400 }
      );
    }

    const eventRepository = await getRepository(Event);
    const event = await eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      return Response.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (event.price === 0) {
      const registrationRepository = await getRepository(Registration);
      const user = await registrationRepository.query(
        'SELECT id FROM "users" WHERE email = $1',
        [session.user.email]
      );

      if (user.length > 0) {
        await registrationRepository.save({
          userId: user[0].id,
          eventId: eventId,
        });
      }

      return Response.json({ success: true, free: true });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: event.title,
              description: event.description?.substring(0, 100),
            },
            unit_amount: event.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/events/${eventId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${eventId}?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        eventId: eventId.toString(),
        userEmail: session.user.email,
      },
    });

    return Response.json({ checkoutUrl: stripeSession.url });
  } catch (error) {
    console.error("Erreur Stripe:", error);
    return Response.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
