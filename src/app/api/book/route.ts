import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";
import { saveImage } from "@/lib/saveImage";
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    // 1. Récupération des données FormData
    const formData = await request.formData();

    // 2. Extraction des champs
    const title = formData.get('title') as string;
    const authorIdRaw = formData.get('authorId') as string;
    const categoryIdRaw = formData.get('categoryId') as string;
    const genre = formData.get('genre') as string | null;
    const datePubRaw = formData.get('datePublication') as string;
    const langue = formData.get('langue') as string | null;
    const nbPagesRaw = formData.get('nbPages') as string | null;
    const isbn = formData.get('isbn') as string | null;
    const resume = formData.get('resume') as string | null;
    const imageFile = formData.get('imageCover') as File | null;
    const edition = formData.get('edition') as string | null;
    const disponibleRaw = formData.get('disponible') as string | null;

    // 3. Conversions & Nettoyage
    const authorId = parseInt(authorIdRaw);
    const categoryId = parseInt(categoryIdRaw);
    const datePublication = new Date(datePubRaw);
    const nbPages = nbPagesRaw ? parseInt(nbPagesRaw) : null;
    const disponible = disponibleRaw === 'true';

    if (isNaN(authorId) || isNaN(categoryId)) {
        return NextResponse.json({ error: 'L\'id de l\'auteur et de la catégorie sont requis et doivent être valides.' }, { status: 400 });
    }

    // 4. Vérification existence auteur/catégorie
    const [author, category] = await Promise.all([
        prisma.author.findUnique({ where: { id: authorId } }),
        prisma.category.findUnique({ where: { id: categoryId } })
    ]);

    if (!author || !category) {
        return NextResponse.json({ error: 'Auteur ou catégorie introuvable.' }, { status: 404 });
    }

    // 5. Sauvegarde de l'image si présente
    let imageCover: string | null = null;
    if (imageFile) {
        try {
            imageCover = await saveImage(imageFile, '/images/uploads/books');
        } catch (error) {
            console.error(error)
            return NextResponse.json({ error: 'Erreur lors de l\'enregistrement de l\'image.' }, { status: 500 });
        }
    }

    // 6. Préparation des données à insérer
    const data = {
        title,
        authorId,
        categoryId,
        datePublication,
        langue: langue || undefined,
        resume: resume || undefined,
        genre: genre || undefined,
        nbPages: nbPages || undefined,
        edition: edition || undefined,
        imageCover,
        isbn: isbn || undefined,
        disponible,
    };

    // 7. Insertion dans la base
    try {
        const book = await prisma.book.create({ data });
        return NextResponse.json({ success: true, data: book }, { status: 201 });
    } catch (error) {
        console.error('Erreur création livre:', error);
        return NextResponse.json({ error: 'Erreur serveur lors de la création du livre.' }, { status: 500 });
    }
}


export async function GET() {
    try {
        const books = await prisma.book.findMany({
            include: {
                category: true,
                author: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(books)
    } catch (error) {
        console.error('Erreur récupération livres:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des livres.' },
            { status: 500 }
        );
    }
}
