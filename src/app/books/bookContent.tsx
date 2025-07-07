'use client';

import { useEffect, useState } from "react";
import BookGrid from "@/components/bookComponents/bookGrid";
import BookSearchBar from "@/components/bookComponents/bookSearch";
import BookPagination from "@/components/bookComponents/bookPagination";

type Book = {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    disponible: boolean;
    category: string;
    description: string
};


const BooksContent = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [filtered, setFiltered] = useState<Book[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [disponibleOnly, setdisponibleOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/book')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des livres');
                }
                return response.json();
            })
            .then((data) => {
                setBooks(data);
                setFiltered(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des livres :', error);
                setLoading(false);
            });
    }, []);

    const filterBooks = (query: string, category: string, disponible: boolean) => {
        return books.filter((book) => {
            const matchQuery =
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase());
            const matchCategory = category ? book.category === category : true;
            const matchdisponible = disponible ? book.disponible === true : true;
            return matchQuery && matchCategory && matchdisponible;
        });
    };

    const handleSearch = (query: string) => {
        const results = filterBooks(query, categoryFilter, disponibleOnly);
        setFiltered(results);
        setCurrentPage(1);
    };

    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        const results = filterBooks('', category, disponibleOnly);
        setFiltered(results);
        setCurrentPage(1);
    };

    const handledisponibleChange = (disponible: boolean) => {
        setdisponibleOnly(disponible);
        const results = filterBooks('', categoryFilter, disponible);
        setFiltered(results);
        setCurrentPage(1);
    };


    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-blue-800 mb-6">📚 Tous les livres</h1>
            <BookSearchBar
                onSearch={handleSearch}
                onCategoryChange={handleCategoryChange}
                onAvailableChange={handledisponibleChange}
            />
            {loading ? (
                <p className="text-center text-gray-500 py-20">Chargement des livres...</p>
            ) : (
                <>
                    <BookGrid books={filtered.slice((currentPage - 1) * 8, currentPage * 8)} />
                    {filtered.length > 0 && (
                        <BookPagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filtered.length / 8)}
                            totalItems={filtered.length}
                            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            onNext={() => setCurrentPage((p) => (p < Math.ceil(filtered.length / 8) ? p + 1 : p))}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default BooksContent;