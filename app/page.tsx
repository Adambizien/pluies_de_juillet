"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  category: {
    name: string;
  };
  conferences?: Array<{ id: number; isVisible: boolean }>;
}

export default function Home() {
  useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        const upcomingEvents = data
          .sort((a: Event, b: Event) => {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          })
          .slice(0, 3);
        setEvents(upcomingEvents);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Présentation du site */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Pluies de Juillet
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-4 text-center max-w-3xl mx-auto">
            Bienvenue sur la plateforme de gestion d&apos;événements culturels et de conférences.
            Découvrez nos événements à venir, inscrivez-vous et participez à des conférences enrichissantes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="text-center p-4 sm:p-6 bg-indigo-50 rounded-lg">
              <div className="flex justify-center mb-2 sm:mb-3">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2">Événements variés</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Découvrez une sélection d&apos;événements culturels et professionnels
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-lg">
              <div className="flex justify-center mb-2 sm:mb-3">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2">Conférences</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Participez à des conférences animées par des experts
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-pink-50 rounded-lg">
              <div className="flex justify-center mb-2 sm:mb-3">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2">Inscription facile</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Créez votre compte et inscrivez-vous en quelques clics
              </p>
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Événements à venir
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Chargement des événements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">
                Aucun événement disponible pour le moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium rounded-full w-fit">
                        {event.category.name}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-indigo-600">
                        {event.price === 0 ? "Gratuit" : `${(event.price / 100).toFixed(2)} €`}
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, wordBreak: 'break-word'}}>
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-4" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'}}>
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {formatDate(event.startDate)}
                          {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>
                          {event.conferences?.filter(c => c.isVisible).length || 0} conférence{(event.conferences?.filter(c => c.isVisible).length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                      <span>Voir les détails</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
