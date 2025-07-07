'use client'

import { useEffect, useState } from "react"

export default function PresencePage() {
    const [matricule, setMatricule] = useState('');
    const [storedMatricule, setStoredMatricule] = useState('');
    const [status, setStatus] = useState('');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('matricule');
        if (saved) {
            setStoredMatricule(saved);
        }
    }, []);

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
            console.error(e)
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        enregistrerPresence(matricule);
        setShowForm(false);
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Validation de présence</h1>
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {storedMatricule && (
                        <div className="space-x-2">
                            <button type="button"
                                onClick={() => {
                                    setMatricule(storedMatricule);
                                    setShowForm(false);
                                    enregistrerPresence(storedMatricule);
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                            > Utiliser <span className="text-green-400 italic">{storedMatricule}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStoredMatricule('')}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Utiliser un autre
                            </button>
                        </div>)}

                    {!storedMatricule && (
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
                                type="submit"
                                className="w-full mt-2 bg-blue-600 text-white py-2 rounded"
                            >
                                Valider
                            </button>
                        </div>
                    )}
                </form>
            )}
            {status && <p className="mt-4 text-center font-medium">{status}</p>}
        </div>

    );
}