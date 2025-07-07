'use client';

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import {
    FaBook, FaEdit, FaTrash, FaPlus, FaSave, FaTimes,
    FaSearch, FaCalendarAlt, FaSpinner,
    FaSort, FaSortUp, FaSortDown
} from 'react-icons/fa';
import { HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi';
import LivreModal from './bookModal';
import ImageUploader from './imageUploader';
import Image from 'next/image';

type Auteur = {
    id: number;
    nom: string;
    prenom: string;
};

type Categorie = {
    id: number;
    nom: string;
    color: string;
};

export type Livre = {
    id: number;
    title: string;
    isbn: string;
    imageCouverture: string;
    datePublication: string;
    auteur: Auteur;
    categorie: Categorie;
    resume?: string;
    categoryId: number;
    authorId: number;
    langue?: string;
    nbPages?: number;
    edition?: string;
    genre?: string;
    disponible: boolean;
};

type SortConfig = {
    key: keyof Livre;
    direction: 'asc' | 'desc';
};

const ITEMS_PER_PAGE = 8;

const LivresPage = () => {
    // États
    const [livres, setLivres] = useState<Livre[]>([]);
    const [auteurs, setAuteurs] = useState<Auteur[]>([]);
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLivre, setSelectedLivre] = useState<Livre | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    // Formulaire
    const [form, setForm] = useState({
        title: '',
        isbn: '',
        datePublication: '',
        resume: '',
        auteurId: '',
        categorieId: '',
        langue: '',
        genre: '',
        nbPages: '',
        edition: '',
        disponible: false
    });

    // Gestion du drag & drop
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Chargement initial des données
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [livresRes, auteursRes, categoriesRes] = await Promise.all([
                    fetch('/api/book', { credentials: 'include' }),
                    fetch('/api/author', { credentials: 'include' }),
                    fetch('/api/category', { credentials: 'include' })
                ]);

                if (!livresRes.ok || !auteursRes.ok || !categoriesRes.ok) {
                    throw new Error('Erreur lors du chargement des données');
                }

                setLivres(await livresRes.json());
                setAuteurs(await auteursRes.json());
                setCategories(await categoriesRes.json());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Mémoïsation des données filtrées et triées
    const filteredLivres = useMemo(() => {
        const result = livres.filter(livre =>
            livre.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            livre.isbn.includes(searchTerm) ||
            `${livre.auteur.prenom} ${livre.auteur.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                return 0;
            });
        }

        return result;
    }, [livres, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredLivres.length / ITEMS_PER_PAGE);
    const paginatedLivres = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLivres.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLivres, currentPage]);

    // Gestion du tri
    const requestSort = useCallback((key: keyof Livre) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    }, [sortConfig]);

    // Gestion du modal
    const openLivreDetails = useCallback(async (livreId: number) => {
        try {
            setModalLoading(true);
            setIsModalOpen(true);

            const res = await fetch(`/api/book/${livreId}`);
            if (!res.ok) throw new Error('Erreur lors du chargement du livre');

            const livreData = await res.json();
            setSelectedLivre(livreData.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    }, []);

    // Gestion du formulaire
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleBooleanChange = useCallback((name: string, value: boolean) => {
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setForm({
            title: '',
            isbn: '',
            datePublication: '',
            resume: '',
            auteurId: '',
            categorieId: '',
            langue: '',
            genre: '',
            nbPages: '',
            edition: '',
            disponible: false
        });
        setCoverFile(null);
        setPreview(null);
        setSelectedLivre(null);
    }, []);

    const handleImageChange = useCallback((file: File) => {
        if (!file.type.match('image.*')) {
            setError('Seules les images sont acceptées');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('L\'image ne doit pas dépasser 2MB');
            return;
        }

        setCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageChange(file);
    }, [handleImageChange]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageChange(file);
    }, [handleImageChange]);

    // CRUD Operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('isbn', form.isbn);
            formData.append('datePublication', form.datePublication);
            formData.append('resume', form.resume || '');
            formData.append('authorId', form.auteurId);
            formData.append('categoryId', form.categorieId);
            formData.append('langue', form.langue || '');
            formData.append('genre', form.genre || '');
            formData.append('nbPages', form.nbPages || '');
            formData.append('edition', form.edition || '');
            formData.append('disponible', form.disponible ? '1' : '0');
            if (coverFile) formData.append('imageCover', coverFile);

            const res = await fetch('/api/book', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Échec de la création');
            }

            const newBookCreated = await res.json();
            const newBook = newBookCreated.data
            setLivres(prev => [...prev, newBook]);
            resetForm();
            setCurrentPage(1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, coverFile, resetForm]);

    const handleUpdate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLivre) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('isbn', form.isbn);
            formData.append('datePublication', form.datePublication);
            formData.append('resume', form.resume || '');
            formData.append('authorId', form.auteurId);
            formData.append('categoryId', form.categorieId);
            formData.append('langue', form.langue || '');
            formData.append('genre', form.genre || '');
            formData.append('nbPages', form.nbPages || '');
            formData.append('edition', form.edition || '');
            formData.append('disponible', form.disponible ? '1' : '0');
            if (coverFile) formData.append('imageCover', coverFile);

            const res = await fetch(`/api/book/${selectedLivre.id}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Échec de la mise à jour');
            }

            const updatedBookData = await res.json();
            const updatedBook = updatedBookData.data;
            setLivres(prev => prev.map(l => l.id === updatedBook.id ? updatedBook : l));
            setSelectedLivre(updatedBook);
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, coverFile, selectedLivre, resetForm]);

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;

        try {
            const res = await fetch(`/api/book/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Échec de la suppression');
            }

            setLivres(prev => prev.filter(l => l.id !== id));
            if (selectedLivre?.id === id) {
                setIsModalOpen(false);
                setSelectedLivre(null);
            }
            if (paginatedLivres.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    }, [selectedLivre, currentPage, paginatedLivres.length]);

    // Gestion des erreurs
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <p className="text-lg text-blue-500 italic">Chargement des données...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                        <div className="mt-4">
                            <button
                                onClick={clearError}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 text-gray-600">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <FaBook className="text-blue-500" /> Gestion des Livres
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulaire */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {selectedLivre ? <FaEdit className='text-blue-500' /> : <FaPlus className='text-blue-500' />}
                        {selectedLivre ? 'Modifier un Livre' : 'Ajouter un Livre'}
                    </h2>

                    <form onSubmit={selectedLivre ? handleUpdate : handleSubmit} className="space-y-4">
                        <ImageUploader
                            preview={preview || selectedLivre?.imageCouverture || null}
                            onDrop={handleDrop}
                            onFileInput={handleFileInput}
                        />

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre<span className='text-red-600'>*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    required
                                    minLength={3}
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN<span className='text-red-600'>*</span></label>
                                <input
                                    type="text"
                                    name="isbn"
                                    value={form.isbn}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    required
                                    pattern="\d{10,13}"
                                    title="ISBN doit contenir 10 à 13 chiffres"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                                <input
                                    type="text"
                                    name="langue"
                                    value={form.langue}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                                <input
                                    type="text"
                                    name="genre"
                                    value={form.genre}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pages</label>
                                <input
                                    type="number"
                                    name="nbPages"
                                    value={form.nbPages}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Disponible</label>
                                <select
                                    name="disponible"
                                    value={form.disponible ? '1' : '0'}
                                    onChange={(e) => handleBooleanChange('disponible', e.target.value === '1')}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                >
                                    <option value="0">Non disponible</option>
                                    <option value="1" selected>Disponible</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de Publication<span className='text-red-600'>*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="datePublication"
                                        value={form.datePublication}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500 pl-10"
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
                                <textarea
                                    name="resume"
                                    value={form.resume}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Auteur<span className='text-red-600'>*</span></label>
                                <select
                                    name="auteurId"
                                    value={form.auteurId}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Sélectionnez un auteur</option>
                                    {auteurs.map(auteur => (
                                        <option key={auteur.id} value={auteur.id}>
                                            {auteur.prenom} {auteur.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie<span className='text-red-600'>*</span></label>
                                <select
                                    name="categorieId"
                                    value={form.categorieId}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Sélectionnez une catégorie</option>
                                    {categories.map(categorie => (
                                        <option key={categorie.id} value={categorie.id}>
                                            {categorie.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaSave />
                                    )}
                                    {selectedLivre ? 'Mettre à jour' : 'Enregistrer'}
                                </button>

                                {selectedLivre && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Liste des livres */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FaBook className='text-green-400' /> Liste des Livres ({livres.length})
                        </h2>

                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 sm:w-64">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {filteredLivres.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucun livre trouvé</p>
                            <p className="text-sm mt-1">{searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter un livre'}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('title')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Title
                                                {sortConfig?.key === 'title' ? (
                                                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : <FaSort />}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('isbn')}
                                        >
                                            <div className="flex items-center gap-1">
                                                ISBN
                                                {sortConfig?.key === 'isbn' ? (
                                                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : <FaSort />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Auteur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Catégorie
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedLivres.map((livre) => (
                                        <tr
                                            key={livre.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => openLivreDetails(livre.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {livre.imageCouverture ? (
                                                        <Image
                                                            src={livre.imageCouverture}
                                                            alt={`Couverture de ${livre.title}`}
                                                            className="h-10 w-8 object-cover rounded mr-3"
                                                            loading="lazy"
                                                            width={32}
                                                            height={40}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-8 bg-gray-200 flex items-center justify-center rounded mr-3">
                                                            <FaBook className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{livre.title}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(livre.datePublication).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {livre.isbn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{livre.auteur.prenom} {livre.auteur.nom}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 text-xs rounded-full"
                                                    style={{
                                                        backgroundColor: `${livre.categorie.color}20`,
                                                        color: livre.categorie.color,
                                                        border: `1px solid ${livre.categorie.color}`
                                                    }}
                                                >
                                                    {livre.categorie.nom}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedLivre(livre);
                                                            setForm({
                                                                title: livre.title,
                                                                isbn: livre.isbn,
                                                                datePublication: livre.datePublication,
                                                                resume: livre.resume || '',
                                                                auteurId: String(livre.auteur.id),
                                                                categorieId: String(livre.categorie.id),
                                                                langue: livre.langue || '',
                                                                genre: livre.genre || '',
                                                                nbPages: livre.nbPages?.toString() || '',
                                                                edition: livre.edition || '',
                                                                disponible: livre.disponible
                                                            });
                                                            setPreview(livre.imageCouverture || null);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        title="Modifier"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(livre.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-700">
                                Page {currentPage} sur {totalPages} • {filteredLivres.length} livres
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiArrowCircleLeft />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 border rounded ${currentPage === pageNum ? 'bg-blue-100 border-blue-300' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                     <HiArrowCircleRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de détails */}
            {isModalOpen && (
                <LivreModal
                    livre={selectedLivre}
                    onClose={() => setIsModalOpen(false)}
                    onDelete={handleDelete}
                    onEdit={() => {
                        if (selectedLivre) {
                            setForm({
                                title: selectedLivre.title,
                                isbn: selectedLivre.isbn,
                                datePublication: selectedLivre.datePublication,
                                resume: selectedLivre.resume || '',
                                auteurId: String(selectedLivre.auteur.id),
                                categorieId: String(selectedLivre.categorie.id),
                                langue: selectedLivre.langue || '',
                                genre: selectedLivre.genre || '',
                                nbPages: selectedLivre.nbPages?.toString() || '',
                                edition: selectedLivre.edition || '',
                                disponible: selectedLivre.disponible
                            });
                            setPreview(selectedLivre.imageCouverture || null);
                            setIsModalOpen(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default LivresPage;