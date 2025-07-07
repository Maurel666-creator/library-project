import Image from 'next/image';

interface Book {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    disponible: boolean;
    category: string;
    description: string
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <div 
      className="bg-white rounded-xl shadow hover:shadow-md transition p-4"
      onClick={() => window.location.href = `/books/${book.id}`}>
      <Image
        src={book.coverImage}
        alt={book.title}
        width={300}
        height={400}
        className="rounded mb-3 w-full object-cover h-48"
      />
      <h3 className="font-semibold text-lg text-blue-700 truncate">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <p className='text-sm text-gray-600 truncate'>{book.description}</p>
      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${book.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {book.disponible ? 'Disponible' : 'Indisponible'}
      </span>
    </div>
  );
}