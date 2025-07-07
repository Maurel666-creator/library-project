'use client';

import { useEffect, useState } from 'react';
import { FiAlertCircle, FiClock, FiCheckCircle, FiBook, FiUser, FiCalendar, FiEdit2, FiSearch, FiRefreshCw } from 'react-icons/fi';

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

interface Etudiant {
    matricule: string;
    nom: string;
    prenom: string;
}

interface Livre {
    id: string;
    titre: string;
    auteur: string;
}

export default function AddLoansPage() {
    const [matricule, setMatricule] = useState('');
    const [livre, setLivre] = useState('');
    const [dateRetour, setDateRetour] = useState('');
    const [remarques, setRemarques] = useState('');
    const [etudiantSuggestions, setEtudiantSuggestions] = useState<Etudiant[]>([]);
    const [livreSuggestions, setLivreSuggestions] = useState<Livre[]>([]);
    const [loadingEmprunts, setLoadingEmprunts] = useState(true);
    const [errorEmprunts, setErrorEmprunts] = useState<string | null>(null);
    const [empruntsRecents, setEmpruntsRecents] = useState<Emprunt[]>([]);

    useEffect(() => {
        const fetchEmpruntsRecents = async () => {
            try {
                setLoadingEmprunts(true);
                setErrorEmprunts(null);

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
                setErrorEmprunts("Impossible de charger les emprunts récents. Veuillez réessayer.");
            } finally {
                setLoadingEmprunts(false);
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

    const handleMatriculeChange = async (val: string) => {
        setMatricule(val);
        if (val.length >= 2) {
            const res = await fetch(`/api/search/students?query=${val}`);
            const data = await res.json();
            setEtudiantSuggestions(data);
        } else {
            setEtudiantSuggestions([]);
        }
    };

    const handleLivreChange = async (val: string) => {
        setLivre(val);
        if (val.length >= 2) {
            const res = await fetch(`/api/search/livres?query=${val}`);
            const data = await res.json();
            setLivreSuggestions(data);
        } else {
            setLivreSuggestions([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/loans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matricule,
                livre,
                dateRetourPrevue: dateRetour,
                remarques
            }),
            credentials: 'include'
        });
        if (res.ok) {
            alert('Emprunt enregistré avec succès !');
            setMatricule('');
            setLivre('');
            setDateRetour('');
            setRemarques('');
        }
    };

    if (loadingEmprunts) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-lg">Chargement des emprunts...</p>
            </div>
        );
    }

    if (errorEmprunts) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border border-red-200 max-w-2xl mx-auto mt-8">
                <div className="flex items-center text-red-600 text-lg">
                    <FiAlertCircle className="mr-3" size={24} />
                    <span>{errorEmprunts}</span>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                    <FiRefreshCw className="mr-2" />
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FiEdit2 className="mr-3 text-blue-600" />
                    Ajouter un nouvel emprunt
                </h1>
                <p className="text-gray-600 mt-2">Gestion des prêts de livres</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="lg:w-2/3 w-full space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="space-y-1">
                        <label className="flex gap-2 text-sm font-medium text-gray-700 items-center">
                            <FiUser className="mr-2 text-gray-500" />
                            <span>Matricule<span className="text-red-500 ml-1 mb-2">*</span></span>
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={matricule}
                                onChange={(e) => handleMatriculeChange(e.target.value)}
                                className="border w-full pl-10 pr-3 py-2.5 p-2 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                                placeholder="Rechercher un étudiant..."
                            />
                        </div>
                        {etudiantSuggestions.length > 0 && (
                            <ul className="border rounded-lg bg-white shadow-lg mt-1 max-h-60 overflow-auto z-10">
                                {etudiantSuggestions.map(e => (
                                    <li
                                        key={e.matricule}
                                        onClick={() => {
                                            setMatricule(e.matricule);
                                            setEtudiantSuggestions([]);
                                        }}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">{e.prenom} {e.nom}</div>
                                        <div className="text-sm text-gray-500">{e.matricule}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="flex text-sm font-medium text-gray-700 items-center">
                            <FiBook className="mr-2 text-gray-500" />
                            <span>Livre<span className="text-red-500 ml-1">*</span></span> 
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={livre}
                                onChange={(e) => handleLivreChange(e.target.value)}
                                className="w-full p-2 pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                                placeholder="Rechercher un livre..."
                            />
                        </div>
                        {livreSuggestions.length > 0 && (
                            <ul className="border rounded-lg bg-white shadow-lg mt-1 max-h-60 overflow-auto z-10">
                                {livreSuggestions.map(l => (
                                    <li
                                        key={l.id}
                                        onClick={() => {
                                            setLivre(l.titre);
                                            setLivreSuggestions([]);
                                        }}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">{l.titre}</div>
                                        <div className="text-sm text-gray-500">{l.auteur}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="flex text-sm font-medium text-gray-700 items-center">
                            <FiCalendar className="mr-2 text-gray-500" />
                            <span>Date de retour prévue <span className="text-red-500 ml-1">*</span></span>
                        </label>
                        <input
                            type="date"
                            value={dateRetour}
                            onChange={(e) => setDateRetour(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Remarques (optionnel)</label>
                        <textarea
                            value={remarques}
                            onChange={(e) => setRemarques(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                            rows={3}
                            placeholder="Ajoutez des notes supplémentaires..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                        <FiCheckCircle className="mr-2" />
                        Enregistrer l&apos;emprunt
                    </button>
                </form>

                {/* Liste des emprunts récents */}
                <div className="lg:w-1/3 w-full">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <FiClock className="mr-3 text-blue-600" />
                            Emprunts récents
                        </h2>

                        {empruntsRecents.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                <FiBook className="mx-auto text-gray-300 mb-3" size={32} />
                                Aucun emprunt récent trouvé
                            </div>
                        ) : (
                            <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {empruntsRecents.map((e) => (
                                    <li
                                        key={e.id}
                                        className={`p-4 rounded-lg border transition-all ${e.status === 'en_retard'
                                                ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                                : e.status === 'retourne'
                                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`p-2.5 rounded-full ${e.status === 'en_retard'
                                                    ? 'bg-red-100 text-red-600'
                                                    : e.status === 'retourne'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-blue-100 text-blue-600'
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
                                                        <span className="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-medium">
                                                            En retard
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                    <FiBook className="inline mr-2 text-gray-400" />
                                                    {e.livreTitre}
                                                </p>
                                                <div className="mt-3 text-sm text-gray-600 space-y-2">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-2 text-gray-400" />
                                                        <span className="font-medium mr-1">Emprunté le:</span>
                                                        {formatDate(e.dateEmprunt)}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-2 text-gray-400" />
                                                        <span className="font-medium mr-1">Retour prévu:</span>
                                                        {formatDate(e.dateRetourPrevue)}
                                                    </div>
                                                    {e.dateRetourEffective && (
                                                        <div className="flex items-center text-green-600">
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
            </div>
        </div>
    );
}

