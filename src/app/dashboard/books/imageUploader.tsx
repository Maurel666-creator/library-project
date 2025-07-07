import Image from "next/image";
import { FaImage } from "react-icons/fa";

// Sous-composant pour l'upload d'image
const ImageUploader = ({ preview, onDrop, onFileInput }: {
    preview: string | null;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('coverInput')?.click()}
        className="border-2 border-dashed border-gray-400 p-4 rounded text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
        {preview ? (
            <div className="relative">
                <Image
                    src={preview}
                    alt="Prévisualisation"
                    className="w-100 h-54 object-cover mx-auto rounded"
                    loading="lazy"
                    width={100}
                    height={54}
                />
                <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <FaImage className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-48">
                <FaImage className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">Cliquez ou glissez une image de couverture ici</p>
                <p className="text-xs text-gray-400 mt-1">Formats supportés: JPG, PNG</p>
            </div>
        )}
        <input
            type="file"
            accept="image/jpeg,image/png"
            id="coverInput"
            className="hidden"
            onChange={onFileInput}
        />
    </div>
);

export default ImageUploader;