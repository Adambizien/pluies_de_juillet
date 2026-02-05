"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface UserInfo {
  firstname: string;
  lastname: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  role: string | null;
}

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const pathname = usePathname();

  useEffect(() => {
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

    if (status === "authenticated") {
      fetchUserInfo();
    }
  }, [status]);

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex-shrink-0">
            <Link href="/" className="text-base sm:text-lg md:text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Pluies de Juillet
            </Link>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Link
              href="/events"
              className={`px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                pathname === "/events"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Événements
            </Link>
            {status === "authenticated" ? (
              <>
                <div className="text-xs sm:text-sm hidden md:block max-w-xs">
                  <p className="text-gray-700 truncate">
                    Bienvenue, <span className="font-semibold">
                      {userInfo ? `${userInfo.firstname} ${userInfo.lastname || ""}`.trim() : session?.user?.email}
                      {userInfo?.role === 'admin' ? ` (${userInfo.role})` : ""}
                    </span>
                  </p>
                </div>
                
                {/* Menu Burger */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Menu"
                  >
                    <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  {menuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl z-20 border border-gray-200 max-h-[80vh] overflow-y-auto">
                        <div className="p-3 sm:p-4 border-b border-gray-200">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {userInfo ? `${userInfo.firstname} ${userInfo.lastname || ""}`.trim() : "Chargement..."}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/"
                            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors gap-2 ${
                              pathname === "/"
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Accueil
                          </Link>
                          <Link
                            href="/planning"
                            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors gap-2 ${
                              pathname === "/planning"
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Planification
                          </Link>
                          <Link
                            href="/historique"
                            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors gap-2 ${
                              pathname === "/historique"
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Historique
                          </Link>
                          <Link
                            href="/profile"
                            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors gap-2 ${
                              pathname === "/profile"
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Mon profil
                          </Link>
                          {userInfo?.role === "admin" && (
                            <Link
                              href="/admin"
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors gap-2 ${
                                pathname?.startsWith("/admin")
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-gray-700 hover:bg-indigo-50"
                              }`}
                              onClick={() => setMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Administration
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              signOut({ redirect: false });
                            }}
                            className="w-full flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors gap-2"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {pathname !== "/login" && (
                  <Link
                    href="/login"
                    className="px-2 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                  >
                    Se connecter
                  </Link>
                )}
                {pathname !== "/register" && (
                  <Link
                    href="/register"
                    className="px-2 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}