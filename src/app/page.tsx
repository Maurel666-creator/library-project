'use client';

import React, { useEffect, useState } from "react";
import HeroSection from "@/components/homeComponents/heroSection";
import BookList from "@/components/homeComponents/booklist";
import Testimonial from "@/components/homeComponents/testimonial";


interface Book {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    available: boolean;
    category: string;
    description: string;
}

export default function Home() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/home');
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des livres');
                }

                const data = await response.json();
                
                // Formatage des données
                const formattedBooks = data.map((book: any) => ({
                    id: book.id,
                    title: book.title,
                    author: `${book.author?.prenom || ''} ${book.author?.nom || 'Auteur inconnu'}`.trim(),
                    coverImage: book.imageCover || '/images/default-book.jpg',
                    available: book.disponible,
                    category: book.category?.nom || 'Non catégorisé',
                    description: book.description || 'Aucune description available'
                }));

                setBooks(formattedBooks);
                setError(null);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            
            <section className="py-12 container mx-auto px-4">                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 bg-red-50 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : books.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">Aucun livre disponible pour le moment</p>
                ) : (
                    <BookList books={books} />
                )}
            </section>

            <Testimonial />
        </div>
    );
}