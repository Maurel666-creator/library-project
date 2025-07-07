import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function saveImage(file: File, folder: string): Promise<string> {
    if (!file || !file.name) {
        throw new Error('Fichier invalide');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${safeFileName}`;

    const relativePath = path.join('public', folder);
    const fullPath = path.join(process.cwd(), relativePath);
    const fullFilePath = path.join(fullPath, fileName);

    // ✅ Crée le dossier s'il n'existe pas
    if (!fs.existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true }); // crée tous les dossiers manquants
    }

    await writeFile(fullFilePath, buffer);

    // Retourne le chemin public accessible via /uploads/filename
    return `/${folder}/${fileName}`;
}
