import BookCard from "./bookCard";

interface Book {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    disponible: boolean;
    category: string;
    description: string
}

interface BookListProps {
    books: Book[];
}


const BookGrid: React.FC<BookListProps> = ({ books }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.length > 0 ? (
                books.map((book, index) => <BookCard key={index} book={book} />)
            ) : (
                <p className="col-span-full text-center text-gray-500">Aucun livre trouvé.</p>
            )}
        </div>
    );
}

export default BookGrid;