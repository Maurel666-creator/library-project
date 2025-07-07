'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";

export default function Login() {
    const router = useRouter();
    const [email, setemail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!email || !password) {
                throw new Error("Veuillez remplir tous les champs");
            }

            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json(); // Parse toujours le JSON en premier

            if (!res.ok) {
                // Utilise data.error (cohérent avec votre backend)
                throw new Error(data.error || "Erreur lors de la connexion");
            }

            router.push("/dashboard");
        } catch (err: any) {
            // Affiche err.message pour éviter [object Object]
            setError(err.message || "Erreur inconnue");
            setTimeout(() => setError(null), 5000);
            console.error("Erreur de connexion:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-semibold text-center mb-6 text-blue-700">Se connecter</h1>
                {/* Texte sous le titre */}
                <p className="text-center text-gray-600 text-sm italic mb-6">
                    Cette page est réservée à l&apos;administrateur.
                </p>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-5 relative">
                        <label htmlFor="email" className="sr-only">Adresse e-mail</label>
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                            placeholder="Adresse e-mail"
                            required
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <div className="mb-6 relative">
                        <label htmlFor="password" className="sr-only">Mot de passe</label>
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            autoComplete="current-password"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>

                    {error && (
                        <p className="mt-4 text-red-600 text-center text-sm" role="alert">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
