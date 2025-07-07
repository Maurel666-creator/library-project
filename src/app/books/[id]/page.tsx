import BookDetailContent from "./bookDetailsContent";

export const metadata = {
    title: "Détails du livre - Bibliothèque Universitaire",
    description: "Parcourez tous les livres disponibles à la bibliothèque."
};

export default function BookDetailsPage(
    { params }: { params: { id: string } }
) {
    return <BookDetailContent id={params.id} />;
}
