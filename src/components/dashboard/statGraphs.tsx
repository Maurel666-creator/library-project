'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiAlertCircle } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type PresenceData = {
    date: string;
    count: number;
};

export default function LineChart() {
    const [chartData, setChartData] = useState<PresenceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPresenceData = async () => {
            try {
                // Calcul des dates pour les 30 derniers jours
                const endDate = new Date();
                const startDate = subDays(endDate, 30);

                const response = await fetch(`/api/stats?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const data = await response.json();
                setChartData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPresenceData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Présence des étudiants (30 derniers jours)',
                font: {
                    size: 16,
                    weight: '600',
                    family: "'Inter', sans-serif"
                },
                color: '#1f2937',
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#f9fafb',
                bodyColor: '#f9fafb',
                borderColor: '#4f46e5',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (context: import('chart.js').TooltipItem<'bar'>) => `${context.parsed.y} étudiants`,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre d'étudiants",
                    color: '#6b7280',
                    font: {
                        weight: '600'
                    }
                },
                grid: {
                    color: '#e5e7eb',
                    drawBorder: false
                },
                ticks: {
                    color: '#6b7280'
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#6b7280'
                }
            }
        },
        maintainAspectRatio: false
    };

    const data = {
        labels: chartData.map(item => format(new Date(item.date), 'dd MMM', { locale: fr })),
        datasets: [
            {
                label: 'Présences',
                data: chartData.map(item => item.count),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 0,
                borderRadius: 6,
                barThickness: 24,
                hoverBackgroundColor: 'rgba(79, 70, 229, 1)'
            }
        ]
    };

    if (loading) return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4"></div>
                <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FiAlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="h-80">
                <Bar options={options} data={data} />
            </div>
        </div>
    );
}