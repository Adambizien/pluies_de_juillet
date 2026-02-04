"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import Select from "@/components/Select";

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

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  isVisible: boolean;
  conferences?: Conference[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [conferenceCategories, setConferenceCategories] = useState<ConferenceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventIds, setExpandedEventIds] = useState<number[]>([]);
  
  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [selectedEventForConference, setSelectedEventForConference] = useState<number | null>(null);
  
  // Form states
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    eventCategoryId: "",
    isVisible: true,
  });
  
  const [conferenceForm, setConferenceForm] = useState({
    title: "",
    description: "",
    startDatetime: "",
    endDatetime: "",
    conferenceCategoryId: "",
    isVisible: true,
  });
  
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, eventCatRes, confCatRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/event-categories"),
        fetch("/api/admin/conference-categories"),
      ]);

      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (eventCatRes.ok) setEventCategories(await eventCatRes.json());
      if (confCatRes.ok) setConferenceCategories(await confCatRes.json());
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEventModal = (event?: Event) => {
    if (event) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        eventCategoryId: event.category.id.toString(),
        isVisible: event.isVisible,
      });
    } else {
      setSelectedEvent(null);
      setEventForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        eventCategoryId: "",
        isVisible: true,
      });
    }
    setError("");
    setShowEventModal(true);
  };

  const openConferenceModal = (eventId: number, conference?: Conference) => {
    setSelectedEventForConference(eventId);
    if (conference) {
      setSelectedConference(conference);
      setConferenceForm({
        title: conference.title,
        description: conference.description,
        startDatetime: conference.startDatetime.slice(0, 16),
        endDatetime: conference.endDatetime.slice(0, 16),
        conferenceCategoryId: conference.category.id.toString(),
        isVisible: conference.isVisible,
      });
    } else {
      setSelectedConference(null);
      setConferenceForm({
        title: "",
        description: "",
        startDatetime: "",
        endDatetime: "",
        conferenceCategoryId: "",
        isVisible: true,
      });
    }
    setError("");
    setShowConferenceModal(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const url = "/api/admin/events";
      const method = selectedEvent ? "PATCH" : "POST";
      const body = selectedEvent
        ? { id: selectedEvent.id, ...eventForm }
        : eventForm;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setShowEventModal(false);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const url = "/api/admin/conferences";
      const method = selectedConference ? "PATCH" : "POST";
      const body = selectedConference
        ? { id: selectedConference.id, ...conferenceForm }
        : { eventId: selectedEventForConference, ...conferenceForm };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setShowConferenceModal(false);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Supprimer cet événement et toutes ses conférences ?")) return;

    try {
      const response = await fetch(`/api/admin/events?eventId=${id}`, {
        method: "DELETE",
      });
      if (response.ok) await fetchData();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleDeleteConference = async (id: number) => {
    if (!confirm("Supprimer cette conférence ?")) return;

    try {
      const response = await fetch(`/api/admin/conferences?conferenceId=${id}`, {
        method: "DELETE",
      });
      if (response.ok) await fetchData();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const toggleExpand = (eventId: number) => {
    setExpandedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Liste des événements</h1>
          <p className="text-gray-600 mt-2">Gérez les événements et leurs conférences</p>
        </div>
        <button
          onClick={() => openEventModal()}
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Créer un événement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucun événement pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de début</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <React.Fragment key={event.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(event.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        {event.conferences && event.conferences.length > 0 && (
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${expandedEventIds.includes(event.id) ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Événement
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {event.title}
                        {event.conferences && event.conferences.length > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({event.conferences.length} conf.)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{event.category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(event.endDate).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${event.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {event.isVisible ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openConferenceModal(event.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          + Conf
                        </button>
                        <button
                          onClick={() => openEventModal(event)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                    {expandedEventIds.includes(event.id) && event.conferences && event.conferences.length > 0 && (
                      event.conferences.map((conf) => (
                        <tr key={`conf-${conf.id}`} className="bg-gray-50">
                          <td className="px-6 py-3 pl-12">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Conférence
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">{conf.title}</td>
                          <td className="px-6 py-3 text-sm text-gray-500">{conf.category.name}</td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {new Date(conf.startDatetime).toLocaleString("fr-FR", { 
                              day: "2-digit", 
                              month: "2-digit", 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {new Date(conf.endDatetime).toLocaleString("fr-FR", { 
                              day: "2-digit", 
                              month: "2-digit", 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${conf.isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {conf.isVisible ? "Oui" : "Non"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium space-x-2">
                            <button
                              onClick={() => openConferenceModal(event.id, conf)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteConference(conf.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Événement */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={selectedEvent ? "Modifier l'événement" : "Créer un événement"}
      >
        <form onSubmit={handleEventSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              rows={3}
              required
            />
          </div>

          <Select
            id="eventCategory"
            label="Catégorie"
            value={eventForm.eventCategoryId}
            onChange={(value) => setEventForm({ ...eventForm, eventCategoryId: value })}
            options={eventCategories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de fin <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="eventVisible"
              checked={eventForm.isVisible}
              onChange={(e) => setEventForm({ ...eventForm, isVisible: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="eventVisible" className="text-sm text-gray-700">Visible publiquement</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? "Traitement..." : selectedEvent ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => setShowEventModal(false)}
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Conférence */}
      <Modal
        isOpen={showConferenceModal}
        onClose={() => setShowConferenceModal(false)}
        title={selectedConference ? "Modifier la conférence" : "Créer une conférence"}
      >
        <form onSubmit={handleConferenceSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={conferenceForm.title}
              onChange={(e) => setConferenceForm({ ...conferenceForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={conferenceForm.description}
              onChange={(e) => setConferenceForm({ ...conferenceForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              rows={3}
              required
            />
          </div>

          <Select
            id="conferenceCategory"
            label="Catégorie"
            value={conferenceForm.conferenceCategoryId}
            onChange={(value) => setConferenceForm({ ...conferenceForm, conferenceCategoryId: value })}
            options={conferenceCategories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Début <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={conferenceForm.startDatetime}
                onChange={(e) => setConferenceForm({ ...conferenceForm, startDatetime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fin <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={conferenceForm.endDatetime}
                onChange={(e) => setConferenceForm({ ...conferenceForm, endDatetime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="confVisible"
              checked={conferenceForm.isVisible}
              onChange={(e) => setConferenceForm({ ...conferenceForm, isVisible: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="confVisible" className="text-sm text-gray-700">Visible publiquement</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? "Traitement..." : selectedConference ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => setShowConferenceModal(false)}
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
