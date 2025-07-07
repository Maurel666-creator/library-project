import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";
import { saveImage } from "@/lib/saveImage";
import { NextRequest, NextResponse } from 'next/server';
import deleteImage from '@/lib/deleteImage';


export async function PUT(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        // 1. Récupération de l'ID et des données
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID du livre invalide' }, { status: 400 });
        }

        // 2. Récupération des données FormData
        const formData = await request.formData();

        // 3. Extraction des champs
        const title = formData.get('title') as string | null;
        const authorIdRaw = formData.get('authorId') as string | null;
        const categoryIdRaw = formData.get('categoryId') as string | null;
        const genre = formData.get('genre') as string | null;
        const datePubRaw = formData.get('datePublication') as string | null;
        const langue = formData.get('langue') as string | null;
        const nbPagesRaw = formData.get('nbPages') as string | null;
        const isbn = formData.get('isbn') as string | null;
        const resume = formData.get('resume') as string | null;
        const imageFile = formData.get('imageCover') as File | null;
        const edition = formData.get('edition') as string | null;
        const disponibleRaw = formData.get('disponible') as string | null;

        // 4. Vérification que le livre existe
        const existingBook = await prisma.book.findUnique({ where: { id } });
        if (!existingBook) {
            return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
        }

        // 5. Préparation des données de mise à jour
        const updateData: Prisma.BookUpdateInput = {
            title: title ?? undefined,
            genre: genre ?? undefined,
            langue: langue ?? undefined,
            resume: resume ?? undefined,
            edition: edition ?? undefined,
            isbn: isbn ?? undefined,
            disponible: disponibleRaw ? disponibleRaw === 'true' : undefined,
            datePublication: datePubRaw ? new Date(datePubRaw) : undefined,
            nbPages: nbPagesRaw ? parseInt(nbPagesRaw) : undefined,
        };

        // 6. Gestion des relations si fournies
        if (authorIdRaw) {
            const authorId = parseInt(authorIdRaw);
            if (!isNaN(authorId)) {
                const author = await prisma.author.findUnique({ where: { id: authorId } });
                if (!author) {
                    return NextResponse.json({ error: 'Auteur non trouvé' }, { status: 404 });
                }
                updateData.author = { connect: { id: authorId } };
            }
        }

        if (categoryIdRaw) {
            const categoryId = parseInt(categoryIdRaw);
            if (!isNaN(categoryId)) {
                const category = await prisma.category.findUnique({ where: { id: categoryId } });
                if (!category) {
                    return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
                }
                updateData.category = { connect: { id: categoryId } };
            }
        }

        // 7. Gestion de l'image si fournie
        if (imageFile) {
            try {
                // Supprimer l'ancienne image si elle existe
                if (existingBook.imageCover) {
                    await deleteImage(existingBook.imageCover); // À implémenter selon votre système de stockage
                }
                // Sauvegarder la nouvelle image
                updateData.imageCover = await saveImage(imageFile, '/images/uploads/books');
            } catch (error) {
                console.error('Erreur gestion image:', error);
                return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'image' }, { status: 500 });
            }
        }

        // 8. Mise à jour dans la base
        const updatedBook = await prisma.book.update({
            where: { id },
            data: updateData,
            include: {
                author: true,
                category: true
            }
        });

        return NextResponse.json({ success: true, data: updatedBook });

    } catch (error) {
        console.error('Erreur mise à jour livre:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la mise à jour du livre' },
            { status: 500 }
        );
    }
}

export async function GET({ params }: { params: { id: string } }) {
    try {
        const bookId = parseInt(params.id);

        if (isNaN(bookId)) {
            return NextResponse.json({ error: 'ID du livre invalide' }, { status: 400 });
        }

        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: {
                author: true,
                category: true
            }
        });

        if (!book) {
            return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: book });
    } catch (error) {
        console.error('Erreur récupération livre(s):', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des livres' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle (seuls les admins peuvent supprimer)
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');

        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID du livre invalide' }, { status: 400 });
        }

        // Vérifier que le livre existe
        const existingBook = await prisma.book.findUnique({ where: { id } });
        if (!existingBook) {
            return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
        }

        // Supprimer l'image associée si elle existe
        if (existingBook.imageCover) {
            await deleteImage(existingBook.imageCover);
        }

        // Supprimer le livre
        await prisma.book.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Livre supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression livre:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la suppression du livre' },
            { status: 500 }
        );
    }
}