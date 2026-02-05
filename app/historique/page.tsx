"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  price: number;
}

interface RegistrationItem {
  id: number;
  createdAt: string;
  event: EventItem;
}

export default function HistoriquePage() {
  const { status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRegistrations();
    }
  }, [status, router]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/user/registrations");
      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }
      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (registrationId: number) => {
    const confirmed = window.confirm("Voulez-vous vraiment vous désinscrire de cet événement ?");
    if (!confirmed) return;

    setRemovingId(registrationId);
    setError(null);

    try {
      const response = await fetch(`/api/user/registrations?registrationId=${registrationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la désinscription");
      }

      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la désinscription");
    } finally {
      setRemovingId(null);
    }
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (price: number) =>
    price === 0
      ? "Gratuit"
      : `${(price / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;

  const isPast = (endDate: string) => new Date(endDate) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Historique</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune inscription</h2>
            <p className="text-gray-600 mb-6">Vous n&apos;avez encore aucune inscription enregistrée.</p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Voir les événements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique</h1>
          <p className="text-gray-600">Retrouvez vos inscriptions passées et en cours</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {registrations
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((registration) => {
              const event = registration.event;
              const past = isPast(event.endDate);

              return (
                <div key={registration.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className={`${past ? "bg-gray-600" : "bg-indigo-600"} text-white px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {event.title}
                          {past && <span className="ml-3 text-sm font-normal">(Événement terminé)</span>}
                        </h2>
                        <p className={`${past ? "text-gray-200" : "text-indigo-100"} text-sm mt-1`}>
                          Du {formatDateTime(event.startDate)} au {formatDateTime(event.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">Prix</p>
                        <p className="text-lg font-semibold">{formatPrice(event.price)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Inscription le</p>
                      <p className="text-gray-900 font-medium">{formatDateTime(registration.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Voir l&apos;événement
                      </Link>
                      <button
                        onClick={() => handleUnregister(registration.id)}
                        disabled={removingId === registration.id}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 transition-colors"
                      >
                        {removingId === registration.id ? "Désinscription..." : "Se désinscrire"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
