"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { status } = useSession();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex-1 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Pluies de Juillet
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Plateforme de gestion d'événements et de conférences
          </p>

          {status === "unauthenticated" && (
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
