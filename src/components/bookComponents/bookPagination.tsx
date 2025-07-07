import Image from "next/image";

interface BookPaginationProps {
    onNext: () => void;
    onPrev: () => void;
    currentPage: number;
    totalPages: number; // Nouvelle prop
    totalItems: number; // Nouvelle prop
}

export default function BookPagination({
    onNext,
    onPrev,
    currentPage,
    totalPages,
    totalItems
}: BookPaginationProps) {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        onPrev();
        scrollToTop();
    };

    const handleNext = () => {
        onNext();
        scrollToTop();
    };

    // Ne pas afficher si moins d'une page
    if (totalPages <= 1 || totalItems <= 8) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
                <Image src="/previous-arrow.svg" width={34} height={24} alt="Previous" />
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} sur {totalPages}</span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
                <Image src="/next-arrow.svg" width={34} height={24} alt="Next" />
            </button>
        </div>
    );
}