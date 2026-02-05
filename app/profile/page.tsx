"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  firstname: string;
  lastname: string | null;
  phone: string | null;
  dateOfBirth: string | null;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    dateOfBirth: "",
  });
  const [saving, setSaving] = useState(false);

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
        setEditForm({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "",
        });
      }
    } catch (error) {
      console.error("Erreur récupération infos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const result = await response.json();
        setUserInfo(result.data);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstname: userInfo?.firstname || "",
      lastname: userInfo?.lastname || "",
      phone: userInfo?.phone || "",
      dateOfBirth: userInfo?.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0] : "",
    });
    setIsEditing(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-full flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="animate-spin h-10 sm:h-12 w-10 sm:w-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-8 py-8 sm:py-12 text-center">
            <div className="w-20 sm:w-24 h-20 sm:h-24 bg-white rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <svg className="w-10 sm:w-12 h-10 sm:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {userInfo ? `${userInfo.firstname} ${userInfo.lastname || ""}`.trim() : "Chargement..."}
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 mt-2 truncate px-2">{session?.user?.email}</p>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Informations personnelles</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors flex items-center gap-2 w-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm sm:text-base font-medium rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
                <div className="flex items-center mb-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Prénom</p>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.firstname}
                    onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Prénom"
                    required
                  />
                ) : (
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{userInfo?.firstname || "Non renseigné"}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
                <div className="flex items-center mb-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Nom</p>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.lastname}
                    onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Nom"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{userInfo?.lastname || "Non renseigné"}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                <div className="flex items-center mb-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Téléphone</p>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+\s()-]/g, '');
                      setEditForm({ ...editForm, phone: value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Téléphone"
                    pattern="[0-9+\s()-]*"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{userInfo?.phone || "Non renseigné"}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                <div className="flex items-center mb-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Date de naissance</p>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {userInfo?.dateOfBirth
                      ? new Date(userInfo.dateOfBirth).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-100 sm:col-span-2">
                <div className="flex items-center mb-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Email</p>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}