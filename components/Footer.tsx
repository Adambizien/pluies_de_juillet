import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Section À propos */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Pluies de Juillet</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Plateforme de gestion d&apos;événements et de conférences dédiée à créer des expériences mémorables et enrichissantes.
            </p>
          </div>

          {/* Section Navigation */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Événements
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Informations */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/conditions" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium text-gray-900">Email:</span><br />
                <a href="mailto:contact@pluiesdejuillet.fr" className="hover:text-indigo-600 transition-colors">
                  contact@pluiesdejuillet.fr
                </a>
              </li>
              <li className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium text-gray-900">Tél:</span><br />
                <a href="tel:+33123456789" className="hover:text-indigo-600 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} Pluies de Juillet. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
