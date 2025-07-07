'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Image from 'next/image';

export default function QRGenerator() {
    const [qrData, setQrData] = useState<{ image: string; url: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Récupération initiale du QR code
    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await fetch('/api/generate-qr', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setQrData(data);
            } catch (error) {
                console.error('Erreur:', error);
            }
        };
        fetchQrCode();
    }, []);

    const handleGenerateOrUpdate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-qr', {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setQrData(data.qrImage);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        if (!qrData) return;

        const pdf = new jsPDF();
        pdf.addImage(qrData.image, 'PNG', 60, 20, 90, 90);
        pdf.setFontSize(14);
        pdf.text("Scanner ce code pour marquer votre présence", 105, 120, {
            align: 'center'
        });
        pdf.save('presence-qr-code.pdf');
    };

    return (
        <div className="bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-900">Gestion de QR Code</h1>

                {/* Affichage du QR Code ou message */}
                <div className="mb-8 min-h-48 flex items-center justify-center border-4 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {qrData?.image ? (
                        <Image src={qrData.image} alt="QR Code" className="w-full max-w-xs rounded-lg shadow-md transition-transform transform hover:scale-105" width={200} height={100} />
                    ) : (
                        <p className="text-gray-600 text-center">Aucun QR code généré. Cliquez sur le bouton pour en générer un.</p>
                    )}
                </div>

                {/* Boutons de gestion du QR Code */}
                <div className="flex gap-4">
                    <button
                        onClick={handleGenerateOrUpdate}
                        disabled={isLoading}
                        aria-label={qrData ? 'Mettre à jour le QR code' : 'Générer un QR code'}
                        className={`flex-1 py-3 px-6 ${qrData ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} transition-colors`}
                    >
                        {isLoading ? 'Traitement en cours...' : qrData ? 'Mettre à jour' : 'Générer le code'}
                    </button>

                    <button
                        onClick={handlePrint}
                        disabled={!qrData}
                        aria-label="Imprimer le QR code"
                        className={`flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${!qrData ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                    >
                        Imprimer le code
                    </button>
                </div>
            </div>
        </div>

    );
}

