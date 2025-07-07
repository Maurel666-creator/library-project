import Image from "next/image";
import { Livre } from "./page";
import { FaBook, FaTimes, FaTrash, FaEdit } from "react-icons/fa";


// Sous-composant pour le modal
const LivreModal = ({ livre, onClose, onDelete, onEdit }: {
    livre: Livre | null;
    onClose: () => void;
    onDelete: (id: number) => void;
    onEdit: () => void;
}) => {
    if (!livre) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FaBook className="text-blue-500" />
                            {livre.titre}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 p-1"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            {livre.imageCouverture ? (
                                <Image
                                    src={livre.imageCouverture}
                                    alt={`Couverture de ${livre.titre}`}
                                    className="w-full h-auto rounded-lg shadow-md"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                                    <FaBook className="text-4xl text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                                    <p className="mt-1 text-sm text-gray-900">{livre.isbn}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Date de Publication</h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(livre.datePublication).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Auteur</h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {livre.auteur.prenom} {livre.auteur.nom}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        <span
                                            className="px-2 py-1 rounded-full inline-block"
                                            style={{
                                                backgroundColor: `${livre.categorie.color}20`,
                                                color: livre.categorie.color,
                                                border: `1px solid ${livre.categorie.color}`
                                            }}
                                        >
                                            {livre.categorie.nom}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {livre.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                                        {livre.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => onDelete(livre.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                        >
                            <FaTrash /> Supprimer
                        </button>
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FaEdit /> Modifier
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivreModal;