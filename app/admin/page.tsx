"use client";

import { useEffect, useState } from "react";

interface Stats {
  usersCount: number;
  registrationsCount: number;
  eventsCount: number;
  conferencesCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur récupération statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Utilisateurs</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats?.usersCount ?? 0}
              </p>
            </div>
            <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Événements</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats?.eventsCount ?? 0}
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Conférences</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats?.conferencesCount ?? 0}
              </p>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Inscriptions</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats?.registrationsCount ?? 0}
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Bienvenue dans l&apos;administration</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Utilisez le menu de gauche pour naviguer entre les différentes sections de l&apos;administration.
        </p>
      </div>
    </div>
  );
}
