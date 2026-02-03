"use client";

export default function EventsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Liste des événements</h1>
        <p className="text-gray-600 mt-2">Gérez les événements de la plateforme</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600 text-center">Aucun événement pour le moment.</p>
      </div>
    </div>
  );
}
