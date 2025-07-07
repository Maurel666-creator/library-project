'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Presence = {
    matricule: string;
    nom: string;
    prenom: string;
    telephone: string;
    date: string;
    heure: string;
};

export default function PresencesPage() {
    const [presences, setPresences] = useState<Presence[]>([]);
    const [filterDate, setFilterDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortField, setSortField] = useState<'nom' | 'heure' | ''>('');
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetch('/api/presence', {
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                setPresences(data.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Erreur lors du chargement des présences");
                setLoading(false);
            });
    }, []);

    const filteredPresences = filterDate ? presences.filter((p) => p.date === filterDate) : presences;

    const sortedPresences = [...filteredPresences].sort((a, b) => {
        if (!sortField) return 0;
        const valA = a[sortField].toLowerCase();
        const valB = b[sortField].toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const paginatedPresences = sortedPresences.slice(
        (currentPage - 1) * perPage, currentPage * perPage
    );

    const totalPages = Math.ceil(sortedPresences.length / perPage);

    const exportCSV = () => {
        // Entête UTF-8 (BOM) pour les caractères spéciaux
        const BOM = "\uFEFF";

        // Fonction pour échapper les valeurs CSV
        const escapeCSV = (value: string) => {
            if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const headers = ['Nom', 'Prénom', 'Téléphone', 'Matricule', 'Date', 'Heure']
            .map(escapeCSV)
            .join(',');

        const rows = filteredPresences.map((p) => [
            p.nom,
            p.prenom,
            p.telephone,
            p.matricule,
            p.date,
            p.heure
        ].map(field => escapeCSV(String(field))).join(','));

        const csvContent = BOM + headers + '\n' + rows.join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8'
        });

        saveAs(blob, 'presences.csv');
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des présences', 14, 10);
        autoTable(doc, {
            head: [
                ['Nom', 'Prénom', 'Téléphone', 'Matricule', 'Date', 'Heure']
            ],
            body: filteredPresences.map((p) => [
                p.nom,
                p.prenom,
                p.telephone,
                p.matricule,
                p.date,
                p.heure]),
            startY: 20,
            theme: 'striped',
            styles: {
                fontSize: 10
            }
        });
        doc.save('presences.pdf');
    };

    function toggleSort(field: 'nom' | 'heure') {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto text-gray-800">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Liste des présences</h1>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <label className="block mb-2 text-base font-semibold text-gray-800">
                        Filtrer par date
                    </label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs text-gray-900"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportCSV}
                        className="bg-green-600 text-white px-5 py-2.5 rounded hover:bg-green-700 transition"
                    >
                        Exporter CSV
                    </button>
                    <button
                        onClick={exportPDF}
                        className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 transition"
                    >
                        Exporter PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-600 text-center">Chargement en cours...</p>
            ) : error ? (
                <p className="text-red-600 text-center">{error}</p>
            ) : (
                <div className="overflow-x-auto border rounded shadow-sm">
                    <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr className="font-semibold text-base">
                                <th className="border px-4 py-3 cursor-pointer" onClick={() => toggleSort('nom')}>Nom</th>
                                <th className="border px-4 py-3">Prénom</th>
                                <th className="border px-4 py-3">Téléphone</th>
                                <th className="border px-4 py-3">Matricule</th>
                                <th className="border px-4 py-3 cursor-pointer" onClick={() => toggleSort('heure')}>Heure</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {paginatedPresences.length > 0 ? (
                                paginatedPresences.map((p, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{p.nom}</td>
                                        <td className="border px-4 py-2">{p.prenom}</td>
                                        <td className="border px-4 py-2">{p.telephone}</td>
                                        <td className="border px-4 py-2">{p.matricule}</td>
                                        <td className="border px-4 py-2">{p.heure}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500 font-medium">
                                        Aucune présence trouvée pour cette date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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