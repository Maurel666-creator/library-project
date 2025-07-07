'use client';

import { useEffect, useState } from 'react';
import { FiClock, FiCheckCircle, FiBook, FiCalendar, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface Emprunt {
    id: string;
    livreTitre: string;
    matricule: string;
    nom: string;
    prenom: string;
    dateEmprunt: string;
    dateRetourPrevue: string;
    dateRetourEffective?: string;
    status: 'en_cours' | 'retourne' | 'en_retard';
}

export default function RecentLoansTable() {
    const [empruntsRecents, setEmpruntsRecents] = useState<Emprunt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmpruntsRecents = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/loans?limit=5');

                if (!res.ok) {
                    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();

                const empruntsAvecStatus = data.data.map((e: any) => {
                    const now = new Date();
                    const dateRetour = new Date(e.dateRetourPrevue);
                    const isRetourne = !!e.dateRetourEffective;
                    const isEnRetard = !isRetourne && dateRetour < now;

                    return {
                        ...e,
                        status: isRetourne ? 'retourne' : isEnRetard ? 'en_retard' : 'en_cours'
                    };
                });

                setEmpruntsRecents(empruntsAvecStatus);
            } catch (err) {
                console.error("Erreur lors du chargement des emprunts:", err);
                setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
            } finally {
                setLoading(false);
            }
        };

        fetchEmpruntsRecents();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <FiClock className="mr-2 text-indigo-500" />
                    Emprunts récents
                </h3>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-600">Chargement en cours...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <FiAlertCircle className="text-red-600" size={24} />
                            </div>
                            <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
                            <p className="text-gray-600 text-sm max-w-xs">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                ) : empruntsRecents.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <FiBook className="text-indigo-500" size={24} />
                        </div>
                        <h3 className="text-gray-700 font-medium">Aucun emprunt récent</h3>
                        <p className="text-gray-500 text-sm mt-1">Les nouveaux emprunts apparaîtront ici</p>
                    </div>
                ) : (
                    <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {empruntsRecents.map((e) => (
                            <li
                                key={e.id}
                                className={`p-4 rounded-xl border transition-all ${e.status === 'en_retard'
                                    ? 'bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-red-100 hover:shadow-sm'
                                    : e.status === 'retourne'
                                        ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:shadow-emerald-100 hover:shadow-sm'
                                        : 'bg-white border-gray-200 hover:shadow-gray-100 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg ${e.status === 'en_retard'
                                        ? 'bg-red-100 text-red-600'
                                        : e.status === 'retourne'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        {e.status === 'retourne' ? (
                                            <FiCheckCircle size={20} />
                                        ) : (
                                            <FiBook size={20} />
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-900">
                                                {e.prenom} {e.nom}
                                            </h3>
                                            {e.status === 'en_retard' && (
                                                <span className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-full font-medium">
                                                    En retard
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                                            <FiBook className="inline mr-2 text-gray-400" />
                                            <span className="truncate max-w-[180px]">{e.livreTitre}</span>
                                        </p>
                                        <div className="mt-3 text-sm space-y-2">
                                            <div className="flex items-center text-gray-600">
                                                <FiCalendar className="mr-2 text-gray-400" />
                                                <span className="font-medium mr-1">Emprunté le:</span>
                                                {formatDate(e.dateEmprunt)}
                                            </div>
                                            <div className={`flex items-center ${e.status === 'en_retard' ? 'text-red-600' : 'text-gray-600'}`}>
                                                <FiCalendar className="mr-2" />
                                                <span className="font-medium mr-1">Retour prévu:</span>
                                                {formatDate(e.dateRetourPrevue)}
                                            </div>
                                            {e.dateRetourEffective && (
                                                <div className="flex items-center text-emerald-600">
                                                    <FiCheckCircle className="mr-2" />
                                                    <span className="font-medium mr-1">Retour effectif:</span>
                                                    {formatDate(e.dateRetourEffective)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}