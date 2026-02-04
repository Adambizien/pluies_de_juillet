"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventCategory {
  id: number;
  name: string;
}

interface ConferenceCategory {
  id: number;
  name: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  isVisible: boolean;
  category: EventCategory;
  conferences?: Array<{
    id: number;
    title: string;
    category: ConferenceCategory;
  }>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [conferenceCategories, setConferenceCategories] = useState<ConferenceCategory[]>([]);
  
  const [selectedEventCategory, setSelectedEventCategory] = useState<string>("");
  const [selectedConferenceCategory, setSelectedConferenceCategory] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/events").then((res) => res.json()),
      fetch("/api/admin/event-categories").then((res) => res.json()),
      fetch("/api/admin/conference-categories").then((res) => res.json()),
    ])
      .then(([eventsData, eventCategoriesData, conferenceCategoriesData]) => {
        const now = new Date();
        const upcomingEvents = eventsData.filter((event: Event) => {
          const eventEndDate = new Date(event.endDate);
          return event.isVisible && eventEndDate >= now;
        });
        
        setEvents(upcomingEvents);
        setEventCategories(eventCategoriesData);
        setConferenceCategories(conferenceCategoriesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculer les événements filtrés directement
  const filteredEvents = (() => {
    let filtered = [...events];

    if (selectedEventCategory) {
      filtered = filtered.filter(
        (event) => event.category.id === parseInt(selectedEventCategory)
      );
    }

    if (selectedConferenceCategory) {
      filtered = filtered.filter((event) =>
        event.conferences?.some(
          (conf) => conf.category.id === parseInt(selectedConferenceCategory)
        )
      );
    }

    if (startDateFilter) {
      filtered = filtered.filter(
        (event) => new Date(event.startDate) >= new Date(startDateFilter)
      );
    }

    if (endDateFilter) {
      filtered = filtered.filter(
        (event) => new Date(event.endDate) <= new Date(endDateFilter)
      );
    }

    filtered.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return filtered;
  })();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilters = () => {
    setSelectedEventCategory("");
    setSelectedConferenceCategory("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tous les événements
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez tous nos événements à venir
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Filtres</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre catégorie d'événement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie d&apos;événement
              </label>
              <select
                value={selectedEventCategory}
                onChange={(e) => setSelectedEventCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Toutes les catégories</option>
                {eventCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre catégorie de conférence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie de conférence
              </label>
              <select
                value={selectedConferenceCategory}
                onChange={(e) => setSelectedConferenceCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Toutes les catégories</option>
                {conferenceCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début minimum
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filtre date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin maximum
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredEvents.length} événement{filteredEvents.length !== 1 ? "s" : ""} trouvé{filteredEvents.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Chargement des événements...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">
              Aucun événement ne correspond à vos critères
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                      {event.category.name}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {event.price === 0 ? "Gratuit" : `${(event.price / 100).toFixed(2)} €`}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, wordBreak: 'break-word'}}>
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'}}>
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {formatDate(event.startDate)}
                        {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>
                        {event.conferences?.length || 0} conférence{(event.conferences?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Affichage des conférences */}
                  {event.conferences && event.conferences.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Conférences</p>
                      <div className="space-y-2">
                        {event.conferences.slice(0, 2).map((conf) => (
                          <div
                            key={conf.id}
                            className="p-2 bg-purple-50 border border-purple-200 rounded"
                          >
                            <p className="text-sm font-medium text-gray-900" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{conf.title}</p>
                            <p className="text-xs text-purple-700 mt-1">{conf.category.name}</p>
                          </div>
                        ))}
                      </div>
                      {event.conferences.length > 2 && (
                        <p className="text-xs text-gray-500 italic mt-2">
                          et bien plus encore...
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-auto flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
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
  );
}
