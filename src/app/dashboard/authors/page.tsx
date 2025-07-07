'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaList } from 'react-icons/fa';

type Author = {
    id: number;
    prenom: string;
    nom: string;
    nbreBooks: number;
    biography: string;
};

const AuthorManager: React.FC = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        prenom: '',
        nom: '',
        nbreBooks: 0,
        biography: '',
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const res = await fetch('/api/author', {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Erreur lors du chargement des auteurs');
                const data = await res.json();
                setAuthors(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    const resetForm = () => {
        setForm({ prenom: '', nom: '', nbreBooks: 0, biography: '' });
        setEditingId(null);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'nbreBooks' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingId !== null) {
                // Modifier un auteur
                const res = await fetch(`/api/author/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Échec de la mise à jour');
                const updatedAuthor = await res.json();
                setAuthors(prev => prev.map(author => (author.id === editingId ? updatedAuthor : author)));
            } else {
                // Créer un nouvel auteur
                const res = await fetch('/api/author', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Échec de la création');
                const newAuthor = await res.json();
                setAuthors(prev => [...prev, newAuthor]);
            }
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false)
        }
    };

    const handleEdit = (author: Author) => {
        setForm({
            prenom: author.prenom,
            nom: author.nom,
            nbreBooks: author.nbreBooks,
            biography: author.biography,
        });
        setEditingId(author.id);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet auteur ?')) return;

        try {
            const res = await fetch(`/api/author/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Échec de la suppression');
            setAuthors(prev => prev.filter(author => author.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Échec de la suppression');
        }
    };

    if (loading) return <div className="p-6 text-center">Chargement en cours...</div>;
    if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Formulaire de création / édition */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-500">
                    {editingId ? (
                        <>
                            <FaEdit /> Modifier un auteur
                        </>
                    ) : (
                        <>
                            <FaPlus /> Ajouter un auteur
                        </>
                    )}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="prenom"
                                placeholder="Prénom"
                                value={form.prenom}
                                onChange={handleChange}
                                className="w-full p-2 rounded border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                name="nom"
                                placeholder="Nom"
                                value={form.nom}
                                onChange={handleChange}
                                className="w-full p-2 border rounded border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de livres</label>
                        <input
                            type="number"
                            name="nbreBooks"
                            placeholder="Nombre de livres"
                            value={form.nbreBooks}
                            onChange={handleChange}
                            className="w-full p-2 border rounded border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                        <textarea
                            name="biography"
                            placeholder="Décrivez l'auteur"
                            value={form.biography}
                            onChange={handleChange}
                            className="w-full p-2 border rounded border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    {editingId ? 'Mettre à jour...' : 'Enregistrer...'}
                                </>
                            ) : (
                                <>
                                    <FaSave /> {editingId ? 'Mettre à jour' : 'Enregistrer'}
                                </>
                            )}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
                                onClick={resetForm}
                            >
                                <FaTimes /> Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste des auteurs */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-blue-400 flex gap-2"> <FaList /> Liste des auteurs</h2>
                {authors.length === 0 ? (
                    <p className="text-gray-500">Aucun auteur enregistré</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-blue-500">Prénom</th>
                                    <th className="py-3 px-4 text-left text-blue-500">Nom</th>
                                    <th className="py-3 px-4 text-left text-blue-500">Livres</th>
                                    <th className="py-3 px-4 text-left text-blue-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {authors.map(author => (
                                    <tr key={author.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-600">{author.prenom}</td>
                                        <td className="py-3 px-4 text-gray-600">{author.nom}</td>
                                        <td className="py-3 px-4 text-red-400">{author.nbreBooks || 0}</td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(author)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <FaEdit size={14} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(author.id)}
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <FaTrash size={14} /> Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorManager;