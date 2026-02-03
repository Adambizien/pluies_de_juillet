"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface UserInfo {
  firstname: string;
  lastname: string | null;
  phone: string | null;
  dateOfBirth: string | null;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserInfo();
    }
  }, [status]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user/info");
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("Erreur récupération infos:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-indigo-600">Pluies de Juillet</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {status === "authenticated" ? (
                <>
                  <div className="text-sm hidden md:block">
                    <p className="text-gray-700">
                      Bienvenue, <span className="font-semibold">
                        {userInfo ? `${userInfo.firstname} ${userInfo.lastname || ""}`.trim() : session?.user?.email}
                      </span>
                    </p>
                    <p className="text-xs text-green-600 font-medium">✓ Connecté</p>
                  </div>
                  
                  {/* Menu Burger */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    {menuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">
                              {userInfo ? `${userInfo.firstname} ${userInfo.lastname || ""}`.trim() : "Chargement..."}
                            </p>
                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/profile"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Mon profil
                            </Link>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                signOut({ redirect: false });
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Se déconnecter
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Non connecté
                  </p>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      </main>
    </div>
  );
}
