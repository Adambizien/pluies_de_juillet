"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Modal from "@/components/Modal";
import Select from "@/components/Select";

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  dateOfBirth?: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  }, []);

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const currentUserId = (session?.user as unknown as Record<string, unknown>)?.id;
        if (selectedUser.id === parseInt(currentUserId as string)) {
          alert("Votre rôle a été modifié. Vous allez être déconnecté.");
          await handleLogout();
        } else {
          await fetchUsers();
          setShowModal(false);
          setSelectedUser(null);
          setSelectedRole("");
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur modification rôle:", error);
      alert("Erreur lors de la modification");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users?userId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const currentUserId = (session?.user as unknown as Record<string, unknown>)?.id;
        if (user.id === parseInt(currentUserId as string)) {
          alert("Votre compte a été supprimé. Vous allez être déconnecté.");
          await handleLogout();
        } else {
          await fetchUsers();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowModal(true);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Liste des utilisateurs</h1>
        <p className="text-gray-600 mt-2">Gérez les utilisateurs de la plateforme</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de naissance
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.firstname && user.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : "Non renseigné"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || "Non renseigné"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("fr-FR")
                    : "Non renseigné"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal(user)}
                    disabled={actionLoading}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal && selectedUser !== null}
        onClose={() => {
          setShowModal(false);
          setSelectedRole("");
        }}
        title="Modifier le rôle"
      >
        {selectedUser && (
          <form onSubmit={handleRoleChange}>
            <p className="text-gray-600 mb-6">
              Utilisateur: <strong>{selectedUser.email}</strong>
            </p>
            
            <Select
              id="role"
              label="Sélectionner le rôle"
              value={selectedRole}
              onChange={setSelectedRole}
              disabled={actionLoading}
              options={[
                { value: "user", label: "Utilisateur" },
                { value: "admin", label: "Administrateur" },
              ]}
            />
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={actionLoading || selectedRole === selectedUser.role}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Modification..." : "Valider"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setSelectedRole("");
                }}
                disabled={actionLoading}
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}