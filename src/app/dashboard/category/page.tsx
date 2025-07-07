'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
    FaEdit,
    FaTrash,
    FaSave,
    FaTimes,
    FaPlus,
    FaPalette,
    FaList,
    FaTag
} from 'react-icons/fa';

type Category = {
    id: number;
    nom: string;
    description: string;
    color: string;
};

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Category, 'id'>>({
        nom: '',
        description: '',
        color: '#4F46E5',
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/category', {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Erreur de chargement');
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({ nom: '', description: '', color: '#4F46E5' });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingId ? `/api/category/${editingId}` : '/api/category';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const updatedCategory = await res.json();

            // Mise à jour optimiste avec vérification des clés
            setCategories(prev => {
                if (editingId) {
                    return prev.map(cat =>
                        cat.id === editingId
                            ? { ...cat, ...updatedCategory }
                            : cat
                    );
                } else {
                    return [...prev, updatedCategory];
                }
            });

            resetForm();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category: Category) => {
        setForm({
            nom: category.nom,
            description: category.description,
            color: category.color,
        });
        setEditingId(category.id);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            const res = await fetch(`/api/category/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Échec de la suppression');
            setCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Échec de la suppression');
        }
    };

    if (loading) return (
        <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-blue-300 italic">Chargement des catégories...</p>
        </div>
    );

    if (error) return (
        <div className='flex justify-center text-center'>
            <div className="p-6 text-red-600 bg-red-50 rounded-xl">
                <p>Erreur : {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                >
                    Réessayer
                </button>
            </div>
        </div>

    );

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulaire de création/édition */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                    {editingId ? (
                        <>
                            <FaEdit className="text-blue-500" />
                            Modifier une catégorie
                        </>
                    ) : (
                        <>
                            <FaPlus className="text-green-500" />
                            Ajouter une catégorie
                        </>
                    )}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaTag /> Nom de la catégorie
                        </label>
                        <input
                            type="text"
                            name="nom"
                            placeholder="Ex: Romans, Science-fiction..."
                            value={form.nom}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaEdit size={14} /> Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Description de la catégorie (optionnel)..."
                            value={form.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:border-blue-500 focus:outline-blue-400 placeholder:text-gray-300 text-gray-600"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaPalette /> Couleur
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                className="w-10 h-10 border rounded cursor-pointer"
                            />
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {form.color}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-2 flex-wrap">
                            {['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => setForm(prev => ({ ...prev, color }))}
                                    aria-label={`Choisir la couleur ${color}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
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
                                onClick={resetForm}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
                            >
                                <FaTimes /> Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste des catégories */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <FaList className="text-blue-500" />
                    Catégories ({categories.length})
                </h2>

                {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Aucune catégorie enregistrée</p>
                        <p className="text-sm mt-1">Commencez par ajouter une catégorie</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {categories.map(cat => (
                            <div
                                key={`category-${cat.id}`}
                                className="p-4 bg-white rounded-xl shadow-md border-l-4 hover:shadow-lg transition-shadow"
                                style={{ borderColor: cat.color }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-500 italic">
                                            <span
                                                className="w-3 h-3 rounded-full inline-block"
                                                style={{ backgroundColor: cat.color }}
                                            ></span>
                                            {cat.nom}
                                        </h3>
                                        {cat.description && (
                                            <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                            aria-label="Modifier"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            aria-label="Supprimer"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;