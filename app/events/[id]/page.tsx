import { notFound } from "next/navigation";
import { Event } from "@/src/entities/Event";
import { Registration } from "@/src/entities/Registration";
import { StripeCheckout } from "@/components/StripeCheckout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";

interface EventCategory {
  id: number;
  name: string;
}

interface ConferenceCategory {
  id: number;
  name: string;
}

interface Conference {
  id: number;
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  category: ConferenceCategory;
  isVisible: boolean;
}

interface EventDetail {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  isVisible: boolean;
  price: number;
  conferences?: Conference[];
}

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

async function fetchEvent(id: string): Promise<EventDetail | null> {
  const eventId = parseInt(id);
  if (Number.isNaN(eventId)) return null;

  const eventRepository = await getRepository(Event);
  const event = await eventRepository.findOne({
    where: { id: eventId },
    relations: ["category", "conferences", "conferences.category"],
  });

  if (!event) return null;

  if (event.conferences) {
    event.conferences.sort((a: Conference, b: Conference) =>
      new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime()
    );
  }

  return event as EventDetail;
}

async function checkUserRegistration(eventId: number, userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;
  
  const registrationRepository = await getRepository(Registration);
  const registration = await registrationRepository
    .createQueryBuilder("registration")
    .innerJoin("registration.user", "user")
    .where("user.email = :email", { email: userEmail })
    .andWhere("registration.eventId = :eventId", { eventId })
    .getOne();
  
  return !!registration;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const event = await fetchEvent(resolvedParams.id);
  if (!event) notFound();

  const session = await getServerSession(authOptions);
  const isAlreadyRegistered = await checkUserRegistration(event.id, session?.user?.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                {event.category.name}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                {formatDateTime(event.startDate)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {formatDateTime(event.endDate)}
              </span>
              <span className="ml-auto text-lg font-bold text-gray-900">
                {formatPrice(event.price)} €
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{event.title}</h1>
            <p className="text-gray-700 leading-relaxed" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{event.description}</p>
          </div>

          <StripeCheckout 
            eventId={event.id} 
            eventPrice={event.price} 
            eventTitle={event.title}
            isAlreadyRegistered={isAlreadyRegistered}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900">Conférences</h2>
          {event.conferences && event.conferences.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {event.conferences.map((conf) => (
                <div key={conf.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {conf.category.name}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {formatDateTime(conf.startDatetime)}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      {formatDateTime(conf.endDatetime)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{conf.title}</h3>
                  <p className="mt-1 text-gray-700 leading-relaxed" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{conf.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-gray-500">Aucune conférence annoncée pour cet événement.</p>
          )}
        </div>
      </div>
    </div>
  );
}
