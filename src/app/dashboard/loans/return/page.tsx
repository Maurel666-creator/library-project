'use client';

import { useState } from 'react';
import { FiBook, FiCheckCircle, FiCalendar, FiSearch, FiUser, FiClock } from 'react-icons/fi';

interface Emprunt {
  id: string;
  livreTitre: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateEmprunt: string;
  dateRetourPrevue: string;
}

export default function ReturnBookPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Emprunt[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Emprunt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    try {
      const res = await fetch(`/api/loans/search?query=${searchTerm}`, {
        credentials:'include'
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Erreur de recherche:", error);
    }
  };

  const handleReturn = async () => {
    if (!selectedLoan) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/loans/${selectedLoan.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        setSuccessMessage(`Le livre "${selectedLoan.livreTitre}" a été marqué comme rendu avec succès !`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
        <FiCheckCircle className="mr-3 text-green-500" />
        Marquer un livre comme rendu
      </h1>
      <p className="text-gray-600 mb-8">Recherchez un emprunt pour enregistrer son retour</p>

      {!selectedLoan ? (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="relative mb-6">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher par titre, étudiant ou matricule..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-blue-500 focus:ring-1 focus:border-blue-500 border-gray-400 text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {results.map((loan) => (
                <div 
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-start"
                >
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-4">
                    <FiBook size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{loan.livreTitre}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <FiUser className="mr-1.5" />
                      {loan.prenom} {loan.nom} ({loan.matricule})
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <FiCalendar className="mr-1.5" />
                      Retour prévu le {formatDate(loan.dateRetourPrevue)}
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <FiSearch className="mx-auto text-gray-300 mb-3" size={32} />
              <p>Entrez un terme de recherche pour trouver des emprunts actifs</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {successMessage ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
              <FiCheckCircle className="mx-auto mb-2" size={24} />
              <p className="font-medium">{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h2 className="font-medium text-lg text-gray-800 mb-2 flex items-center">
                  <FiBook className="mr-2 text-blue-600" />
                  {selectedLoan.livreTitre}
                </h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center">
                    <FiUser className="mr-2 text-gray-500" />
                    <span className="font-medium">Emprunteur:</span> {selectedLoan.prenom} {selectedLoan.nom} ({selectedLoan.matricule})
                  </p>
                  <p className="flex items-center">
                    <FiCalendar className="mr-2 text-gray-500" />
                    <span className="font-medium">Emprunté le:</span> {formatDate(selectedLoan.dateEmprunt)}
                  </p>
                  <p className="flex items-center">
                    <FiClock className="mr-2 text-gray-500" />
                    <span className="font-medium">Retour prévu:</span> {formatDate(selectedLoan.dateRetourPrevue)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de retour effective
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarques (optionnel)
                  </label>
                  <textarea
                    placeholder="Décrivez l'état du livre..."
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedLoan(null)}
                    className="px-4 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReturn}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-2" />
                        Confirmer le retour
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

