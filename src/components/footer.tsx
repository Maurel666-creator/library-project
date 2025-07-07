import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-8 mt-10 border-t">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Bloc 1 - Logo / nom */}
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">📚 Bibliothèque de l&apos;ENEAM </h2>
          <p className="text-sm">
            Votre bibliothèque universitaire accessible 24h/24.
          </p>
        </div>

        {/* Bloc 2 - Navigation */}
        <div>
          <h3 className="font-semibold mb-2">Navigation</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:text-blue-600">Accueil</Link></li>
            <li><Link href="/books" className="hover:text-blue-600">Livres</Link></li>
            <li><Link href="/scan" className="hover:text-blue-600">Marquer ma présence</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>

        {/* Bloc 3 - Infos pratiques */}
        <div>
          <h3 className="font-semibold mb-2">Infos pratiques</h3>
          <ul className="text-sm space-y-1">
            <li>📍 03BP 1079 - Gbégamey Cotonou Bénin</li>
            <li>📧 eneam.uac@eneam.uac.bj</li>
            <li>📞 +229 21-30-41-68</li>
            <li>🌐 <a href="http://www.eneam.uac.bj" target='_blank"'>www.eneam.uac.bj</a></li>
          </ul>
        </div>

        {/* Bloc 4 - Réseaux sociaux */}
        <div>
          <h3 className="font-semibold mb-2">Suivez-nous</h3>
          <div className="flex space-x-4 text-blue-700 text-xl">
            <a href="https://m.facebook.com/profile.php?id=132606750098832" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div className="text-center text-sm text-gray-500 mt-6">
        © {new Date().getFullYear()} Eneam - Tous droits réservés.
      </div>
    </footer>
  );
}
