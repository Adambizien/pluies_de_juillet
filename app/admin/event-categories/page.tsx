"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Modal from "@/components/Modal";

interface EventCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventCategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/event-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur récupération catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Le nom est requis");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/event-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (response.ok) {
        await fetchCategories();
        setCategoryName("");
        setShowModal(false);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Erreur création catégorie:", err);
      setError("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !categoryName.trim()) {
      setError("Le nom est requis");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/event-categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedCategory.id, name: categoryName }),
      });

      if (response.ok) {
        await fetchCategories();
        setShowModal(false);
        setSelectedCategory(null);
        setCategoryName("");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error("Erreur modification catégorie:", err);
      setError("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (category: EventCategory) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/event-categories?categoryId=${category.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression catégorie:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (category: EventCategory) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setError("");
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories d&apos;événements</h1>
          <p className="text-gray-600 mt-2">Gérez les catégories des événements</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Ajouter une catégorie
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucune catégorie pour le moment</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEditModal(category)}
                      disabled={actionLoading}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
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
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
          setCategoryName("");
          setError("");
        }}
        title={selectedCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
      >
        <form onSubmit={selectedCategory ? handleEdit : handleCreate}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie
            </label>
            <input
              id="name"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={actionLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
              placeholder="Ex: Conférence, Workshop, Séminaire..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Traitement..." : selectedCategory ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedCategory(null);
                setCategoryName("");
                setError("");
              }}
              disabled={actionLoading}
              className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
