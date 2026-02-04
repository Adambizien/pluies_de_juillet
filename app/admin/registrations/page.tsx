"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Modal from "@/components/Modal";
import Select from "@/components/Select";

interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  userInfo?: {
    firstname: string;
    lastname?: string | null;
  };
}

interface Event {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  price: number;
}

interface Registration {
  id: number;
  user: User;
  event: Event;
  createdAt: string;
}

export default function RegistrationsPage() {
  const { status } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form, setForm] = useState({
    userId: "",
    eventId: "",
  });

  const handleDeleteRegistration = async (registrationId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette inscription ?")) {
      return;
    }

    setDeleteLoading(registrationId);
    try {
      const response = await fetch(`/api/admin/registrations?registrationId=${registrationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRegistrations();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la suppression de l'inscription");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    fetchRegistrations();
    fetchUsers();
    fetchEvents();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/registrations");
      if (!response.ok) throw new Error("Erreur lors du chargement des inscriptions");
      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des événements:", err);
    }
  };

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.eventId) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(form.userId),
          eventId: parseInt(form.eventId),
        }),
      });

      if (response.ok) {
        await fetchRegistrations();
        setShowModal(false);
        setForm({ userId: "", eventId: "" });
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'ajout de l'inscription");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inscriptions</h1>
          <p className="text-gray-600 mt-2">
            Gestion des inscriptions aux événements
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Ajouter une inscription
        </button>
      </div>

          {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-indigo-600 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d&apos;inscription               
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Aucune inscription
                      </td>
                    </tr>
                  ) : (
                    registrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.user.userInfo?.firstname && registration.user.userInfo?.lastname
                            ? `${registration.user.userInfo.firstname} ${registration.user.userInfo.lastname}`
                            : "Non renseigné"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.event?.title || "Non renseigné"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.event.startDate).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.event.endDate).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(registration.event.price / 100).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.createdAt).toLocaleDateString("fr-FR")}                   
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteRegistration(registration.id)}
                            disabled={deleteLoading === registration.id}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            {deleteLoading === registration.id ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              "Supprimer"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter une inscription">
        <form onSubmit={handleAddRegistration} className="space-y-4">
          <Select
            id="user"
            label="Utilisateur"
            value={form.userId}
            onChange={(value) => setForm({ ...form, userId: value })}
            required
            options={users.map((user) => ({
              value: user.id.toString(),
              label: user.firstname && user.lastname
                ? `${user.firstname} ${user.lastname} (${user.email})`
                : user.email,
            }))}
            placeholder="Selectionner un utilisateur"
          />

          <Select
            id="event"
            label="Evenement"
            value={form.eventId}
            onChange={(value) => setForm({ ...form, eventId: value })}
            required
            options={events.map((event) => ({
              value: event.id.toString(),
              label: event.title,
            }))}
            placeholder="Selectionner un evenement"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
