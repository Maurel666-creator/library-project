"use client";

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
    const [matricule, setMatricule] = useState('');
    const [storedMatricule, setStoredMatricule] = useState('');
    const [status, setStatus] = useState('');
    const [isScanning, setIsScanning] = useState(true); // Scan activé par défaut
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('matricule');
        if (saved) {
            setStoredMatricule(saved);
            setMatricule(saved);
        }

        // Démarrer le scan automatiquement
        startScanning();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, []);

    const handleScan = (decodedText: string) => {
        setMatricule(decodedText);
        enregistrerPresence(decodedText);
        stopScanning();
    };

    const handleError = (error: string) => {
        console.error(error);
        setStatus("Erreur de scan: " + error);
    };

    const enregistrerPresence = async (mat: string) => {
        try {
            const res = await fetch('/api/presence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matricule: mat }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(`✅ Présence enregistrée à ${data.date} ${data.heure}`);
                localStorage.setItem('matricule', mat);
            } else {
                setStatus(`❌ ${data.message}`);
            }
        } catch (e) {
            setStatus('Erreur réseau');
            console.error(e);
        }
    };

    const startScanning = () => {
        if (!isScanning) {
            setIsScanning(true);
            setStatus('');

            const scanner = new Html5QrcodeScanner(
                'qr-scanner',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [],
                    rememberLastUsedCamera: true
                },
                false
            );

            scanner.render(
                (decodedText) => handleScan(decodedText),
                (errorMessage) => handleError(errorMessage)
            );

            scannerRef.current = scanner;
        }
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Failed to stop scanner", error);
            });
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Marquer votre présence</h1>

            {isScanning ? (
                <div className="mt-4 space-y-4">
                    <div id="qr-scanner" className="border-2 border-gray-300 rounded-lg"></div>
                    <button
                        onClick={() => {
                            stopScanning();
                            setIsScanning(false);
                        }}
                        className="w-full bg-red-500 text-white py-2 rounded"
                    >
                        Entrer le matricule manuellement
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {storedMatricule ? (
                        <div className="space-x-2">
                            <button
                                onClick={() => {
                                    setMatricule(storedMatricule);
                                    enregistrerPresence(storedMatricule);
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Utiliser {storedMatricule}
                            </button>
                            <button
                                onClick={() => setStoredMatricule('')}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Utiliser un autre
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="text"
                                value={matricule}
                                onChange={(e) => setMatricule(e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Votre matricule"
                                required
                            />
                            <button
                                onClick={() => matricule && enregistrerPresence(matricule)}
                                className="w-full mt-2 bg-blue-600 text-white py-2 rounded"
                            >
                                Valider
                            </button>
                        </div>
                    )}
                </div>
            )}

            {status && <p className="mt-4 text-center font-medium">{status}</p>}
        </div>
    );
}