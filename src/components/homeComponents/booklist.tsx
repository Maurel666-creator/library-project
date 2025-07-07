// BookList.tsx
import React from 'react';
import BookCard from './bookCard';

export interface Book {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    available: boolean;
    category: string;
    description: string
}

interface BookListProps {
    books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 justify-center text-center">Nos dernières acquisitions</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BookList;