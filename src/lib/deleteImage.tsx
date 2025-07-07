import path from 'path';
import fs from 'fs';


async function deleteImage(imagePath: string)  {

    try {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            console.log('path/file.txt was deleted');
        });
    } catch (error) {
        console.error('Erreur suppression fichier:', error);
        throw error;
    }
}

export default deleteImage