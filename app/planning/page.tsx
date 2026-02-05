"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface Event {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  conferences: Conference[];
}

interface Registration {
  id: number;
  eventId: number;
  event: Event;
}

export default function PlanningPage() {
  const { status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEventId, setSavingEventId] = useState<number | null>(null);
  const [savedEventId, setSavedEventId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/registrations");
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);

        const programResponse = await fetch("/api/user/program");
        if (programResponse.ok) {
          const programData = await programResponse.json();
          setSelectedConferences(programData.map((p: { conferenceId: number }) => p.conferenceId));
        }
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConference = (conferenceId: number, isEventPast: boolean, eventId: number) => {
    if (isEventPast) return;
    setSelectedConferences((prev) => {
      const newSelection = prev.includes(conferenceId)
        ? prev.filter((id) => id !== conferenceId)
        : [...prev, conferenceId];
      
      autoSave(newSelection, eventId);
      return newSelection;
    });
  };

  const isEventPast = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const autoSave = async (conferenceIds: number[], eventId: number) => {
    setSavingEventId(eventId);
    setSavedEventId(null);
    
    if ((window as Window & { saveTimeout?: NodeJS.Timeout }).saveTimeout) {
      clearTimeout((window as Window & { saveTimeout?: NodeJS.Timeout }).saveTimeout);
    }

    (window as Window & { saveTimeout?: NodeJS.Timeout }).saveTimeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/user/program", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conferenceIds }),
        });

        if (response.ok) {
          setSavingEventId(null);
          setSavedEventId(eventId);
          setTimeout(() => setSavedEventId(null), 2000);
        } else {
          setSavingEventId(null);
        }
      } catch (error) {
        console.error("Erreur sauvegarde:", error);
        setSavingEventId(null);
      }
    }, 500);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Ma planification
          </h1>
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <svg className="w-16 sm:w-20 h-16 sm:h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Aucune inscription trouvée
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Vous devez vous inscrire à un événement avant de pouvoir planifier vos conférences.
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Ma planification
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sélectionnez les conférences auxquelles vous souhaitez assister
          </p>
        </div>

        <div className="space-y-8">
          {registrations
            .sort((a, b) => {
              const aEventPast = isEventPast(a.event.endDate);
              const bEventPast = isEventPast(b.event.endDate);
              
             
              if (aEventPast && !bEventPast) return 1;
              if (!aEventPast && bEventPast) return -1;
              
              if (!aEventPast && !bEventPast) {
                return new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime();
              }
              
              return new Date(b.event.endDate).getTime() - new Date(a.event.endDate).getTime();
            })
            .map((registration) => {
            const event = registration.event;
            const eventPast = isEventPast(event.endDate);
            const visibleConferences = event.conferences?.filter(
              (conf) => conf.isVisible
            ) || [];

            return (
              <div key={registration.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${eventPast ? 'opacity-60' : ''}`}>
                <div className={`${eventPast ? 'bg-gray-500' : 'bg-indigo-600'} text-white px-4 sm:px-6 py-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {event.title}
                        {eventPast && <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-normal">(Événement terminé)</span>}
                      </h2>
                      <p className={`${eventPast ? 'text-gray-200' : 'text-indigo-100'} text-xs sm:text-sm mt-1`}>
                        Du {formatDateTime(event.startDate)} au {formatDateTime(event.endDate)}
                      </p>
                    </div>
                    {!eventPast && (savingEventId === event.id || savedEventId === event.id) && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm w-fit">
                        {savingEventId === event.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-indigo-100">Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white font-medium">Sauvegardé</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {visibleConferences.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                      Aucune conférence disponible pour cet événement
                    </p>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {visibleConferences.map((conference) => (
                        <div
                          key={conference.id}
                          className={`border rounded-lg p-3 sm:p-4 transition-all ${
                            eventPast 
                              ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                              : selectedConferences.includes(conference.id)
                                ? "border-indigo-500 bg-indigo-50 cursor-pointer"
                                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 cursor-pointer"
                          }`}
                          onClick={() => handleToggleConference(conference.id, eventPast, event.id)}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  eventPast
                                    ? 'border-gray-400 bg-gray-300'
                                    : selectedConferences.includes(conference.id)
                                      ? "border-indigo-600 bg-indigo-600"
                                      : "border-gray-300"
                                }`}
                              >
                                {selectedConferences.includes(conference.id) && !eventPast && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                <span className={`px-2 py-1 w-fit ${eventPast ? 'bg-gray-200 text-gray-600' : 'bg-purple-100 text-purple-700'} text-xs font-semibold rounded-full`}>
                                  {conference.category.name}
                                </span>
                                <span className={`text-xs sm:text-sm ${eventPast ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDateTime(conference.startDatetime)} - {formatDateTime(conference.endDatetime)}
                                </span>
                              </div>
                              <h3 className={`text-base sm:text-lg font-semibold ${eventPast ? 'text-gray-500' : 'text-gray-900'} mb-1`}>
                                {conference.title}
                              </h3>
                              <p className={`${eventPast ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>
                                {conference.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
