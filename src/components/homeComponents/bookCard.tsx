import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Book {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    available: boolean;
    category: string;
    description: string
}

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={book.coverImage}
          alt={`Couverture de ${book.title}`}
          layout="fill"
          objectFit="cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-gray-600 mb-2">{book.author}</p>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            book.available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {book.available ? '📖 Disponible' : '❌ Emprunté'}
          </span>
          
          <Link href={`/books/${book.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir plus
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;