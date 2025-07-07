'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Emprunt = {
    nom: string;
    prenom: string;
    matricule: string;
    livre: string;
    dateEmprunt: string;
    dateRetour: string;
    statut: 'En cours' | 'Retourné' | 'En retard';
};

export default function EmpruntsPage() {
    const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
    const [filterDate, setFilterDate] = useState('');
    const [filterStudent, setFilterStudent] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const perPage = 10;
    const totalPages = Math.ceil(total / perPage);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({
            page: currentPage.toString(),
            perPage: perPage.toString(),
            statut: filterStatut,
            nom: filterStudent,
            date: filterDate
        });

        fetch(`/api/loans/all?${params}`)
            .then(res => res.json())
            .then(data => {
                setEmprunts(data.data);
                setTotal(data.total);
                setLoading(false);
            })
            .catch(() => {
                setError("Erreur lors du chargement des emprunts");
                setLoading(false);
            });
    }, [currentPage, filterDate, filterStudent, filterStatut]);

    const resetFilters = () => {
        setFilterDate('');
        setFilterStudent('');
        setFilterStatut('');
        setCurrentPage(1);
    };

    const exportCSV = () => {
        // Ajout du BOM (Byte Order Mark) pour les caractères UTF-8
        const BOM = "\uFEFF";

        // Fonction pour échapper les valeurs CSV
        const escapeCSVValue = (value: string) => {
            if (value == null) return '';
            // Convertir en chaîne si ce n'est pas déjà le cas
            const strValue = String(value);
            // Échapper les guillemets et entourer de guillemets si nécessaire
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        };

        // En-têtes du CSV (échappés aussi par sécurité)
        const headers = ['Nom', 'Prénom', 'Matricule', 'Livre', 'Date Emprunt', 'Date Retour', 'Statut']
            .map(escapeCSVValue)
            .join(',');

        // Données du CSV
        const rows = emprunts.map(e => [
            e.nom,
            e.prenom,
            e.matricule,
            e.livre,
            e.dateEmprunt,
            e.dateRetour,
            e.statut
        ].map(escapeCSVValue).join(','));

        // Construction du contenu CSV complet
        const csvContent = BOM + headers + '\n' + rows.join('\n');

        // Création et téléchargement du fichier
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8'
        });
        saveAs(blob, 'emprunts.csv');
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des emprunts', 14, 10);
        autoTable(doc, {
            head: [['Nom', 'Prénom', 'Matricule', 'Livre', 'Date Emprunt', 'Date Retour', 'Statut']],
            body: emprunts.map(e => [e.nom, e.prenom, e.matricule, e.livre, e.dateEmprunt, e.dateRetour, e.statut]),
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 10 }
        });
        doc.save('emprunts.pdf');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto text-gray-800">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Liste des emprunts</h1>

            {/* Filtres */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Nom ou matricule</label>
                    <input
                        type="text"
                        value={filterStudent}
                        onChange={(e) => setFilterStudent(e.target.value)}
                        placeholder="Ex: Zinsou, ETU12345"
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Statut</label>
                    <select
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                        <option value="">Tous</option>
                        <option value="En cours">En cours</option>
                        <option value="Retourné">Retourné</option>
                        <option value="En retard">En retard</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Date d&apos;emprunt</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={resetFilters}
                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Réinitialiser
                    </button>
                </div>
            </div>

            {/* Export */}
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Exporter CSV
                </button>
                <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Exporter PDF
                </button>
            </div>

            {/* Tableau */}
            {loading ? (
                <p className="text-center text-gray-600">Chargement en cours...</p>
            ) : error ? (
                <p className="text-center text-red-600">{error}</p>
            ) : (
                <div className="overflow-x-auto border rounded shadow-sm">
                    <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-100 text-gray-800">
                            <tr className="font-semibold text-base">
                                <th className="border px-4 py-3">Nom</th>
                                <th className="border px-4 py-3">Prénom</th>
                                <th className="border px-4 py-3">Matricule</th>
                                <th className="border px-4 py-3">Livre</th>
                                <th className="border px-4 py-3">Date Emprunt</th>
                                <th className="border px-4 py-3">Date Retour</th>
                                <th className="border px-4 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {emprunts.length > 0 ? (
                                emprunts.map((e, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{e.nom}</td>
                                        <td className="border px-4 py-2">{e.prenom}</td>
                                        <td className="border px-4 py-2">{e.matricule}</td>
                                        <td className="border px-4 py-2">{e.livre}</td>
                                        <td className="border px-4 py-2">{e.dateEmprunt}</td>
                                        <td className="border px-4 py-2">{e.dateRetour}</td>
                                        <td className="border px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-sm font-medium
                                                ${e.statut === 'Retourné' ? 'bg-green-100 text-green-800' :
                                                    e.statut === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {e.statut}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-6 text-gray-500 font-medium">
                                        Aucun emprunt trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded border font-medium transition ${currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
