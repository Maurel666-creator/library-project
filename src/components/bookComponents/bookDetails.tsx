import Image from 'next/image';

export interface Book {
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

export default function BookDetail({ book }: { book: Book }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
      {/* Couverture */}
      <div className="flex-shrink-0 w-full md:w-[300px]">
        <Image
          src={book.coverImage}
          alt={book.title}
          width={300}
          height={400}
          className="rounded-md object-cover w-full h-auto shadow"
        />
      </div>

      {/* Infos */}
      <div className="flex flex-col justify-between flex-1 space-y-4">
        {/* Titre et auteur */}
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">{book.title}</h1>
          <p className="text-gray-700 mt-1">de <strong>{book.author}</strong></p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Catégorie: {book.category}</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Genre: {book.genre}</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Langue: {book.langue}</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              book.available
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {book.available ? 'Disponible' : 'Indisponible'}
          </span>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
          <div><strong>Édition :</strong> {book.edition}</div>
          <div><strong>ISBN :</strong> {book.isbn}</div>
          <div><strong>Date de publication :</strong> {book.datePublication}</div>
          <div><strong>Nombre de pages :</strong> {book.nbPages}</div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Description</h2>
          <p className="text-gray-700 leading-relaxed text-sm">{book.description}</p>
        </div>
      </div>
    </div>
  );
}
