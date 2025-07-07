'use client';

import StatCard from '@/components/dashboard/statCard';
import LineChart from '@/components/dashboard/statGraphs';
import RecentLoansTable from '@/components/dashboard/statRecentsLoans';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [allBooks, setAllBooks] = useState(0);
    const [currentLoans, setCurrentLoans] = useState(0);
    const [overdueLoans, setOverdueLoans] = useState(0);
    useEffect(() => {
        fetch('/api/usersStats', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.error('Erreur lors de la récupération des statistiques:', data.error);
                } else {
                    setAllBooks(data.data.totalLivres);
                    setCurrentLoans(data.data.empruntsEnCours);
                    setOverdueLoans(data.data.empruntsEnRetard);
                }
            })
            .catch(error => {
                console.error('Erreur de réseau lors de la récupération des statistiques:', error);
            });
    }, []);
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Livres" value={allBooks} icon="📚" variant='success' />
                <StatCard title="Emprunts en cours" value={currentLoans} icon="📖" variant='warning' />
                <StatCard title="Retards" value={overdueLoans} icon="⏳" variant='danger' />
            </div>

            {/* Courbe + Tableau */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique */}
                <div className="bg-white rounded shadow p-4">
                    <h2 className="text-lg font-semibold mb-4 text-blue-600">Évolution de le présence (30 derniers jours)</h2>
                    <LineChart />
                </div>

                {/* Derniers emprunts */}
                <div className="bg-white rounded shadow p-4">
                    <h2 className="text-lg font-semibold mb-4 text-red-500 italic">Derniers emprunts</h2>
                    <RecentLoansTable />
                </div>
            </div>
        </div>
    );
}
