'use client';

import { useEffect, useState } from 'react';
import BookDetail from '@/components/bookComponents/bookDetails';
import { useRouter } from 'next/navigation';


interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    available: boolean;
    description: string;
    coverImage: string;
    genre: string;
    edition: string;
    isbn: string;
    datePublication: string;
    nbPages: number;
    langue: string;
}

export default function BookDetailContent({ id }: { id: string }) {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/book?id=${id}`);

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération du livre');
                }

                const data = await response.json();
                if (!data.success || !data.data) {
                    throw new Error('Livre non trouvé');
                }

                // Transformation des données de l'API pour correspondre au type Book
                const bookData = data.data;
                setBook({
                    id: bookData.id,
                    title: bookData.title,
                    author: bookData.author?.name || 'Auteur inconnu',
                    category: bookData.category?.name || 'Non catégorisé',
                    available: bookData.disponible,
                    description: bookData.resume || 'Aucune description disponible',
                    coverImage: bookData.imageCover || '/images/default-book.jpg',
                    genre: bookData.genre,
                    edition: bookData.edition,
                    isbn: bookData.isbn,
                    datePublication: bookData.datePublication,
                    nbPages: bookData.nbPages,
                    langue: bookData.langue
                });
            } catch (err) {
                console.error('Erreur:', err);
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                router.push('/books'); // Redirection vers la liste des livres en cas d'erreur
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, router]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <button
                    onClick={() => router.push('/books')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Retour à la liste des livres
                </button>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-600 mb-4">Livre non trouvé</p>
                <button
                    onClick={() => router.push('/books')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Retour à la liste des livres
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <BookDetail book={book} />
        </div>
    );
}