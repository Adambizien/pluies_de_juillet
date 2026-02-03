import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section À propos */}
          <div>
            <h3 className="text-lg font-bold text-indigo-600 mb-4">Pluies de Juillet</h3>
            <p className="text-sm text-gray-600">
              Plateforme de gestion d&apos;événements et de conférences dédiée à créer des expériences mémorables.
            </p>
          </div>

          {/* Section Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> contact@pluiesdejuillet.fr
              </li>
              <li className="text-sm text-gray-600">
                <span className="font-medium">Tél:</span> +33 1 23 45 67 89
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Pluies de Juillet. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
