import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Section À propos */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pluies de Juillet</h3>
            <p className="text-sm text-gray-600">
              Plateforme de gestion d&apos;événements et de conférences dédiée à créer des expériences mémorables et enrichissantes.
            </p>
          </div>

          {/* Section Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Événements
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Informations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Conditions d&apos;utilisation</li>
              <li>Politique de confidentialité</li>
              <li>Mentions légales</li>
            </ul>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Email:</span><br />
                contact@pluiesdejuillet.fr
              </li>
              <li className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Tél:</span><br />
                +33 1 23 45 67 89
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Pluies de Juillet. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
