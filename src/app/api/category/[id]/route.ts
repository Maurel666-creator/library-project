import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkUserRole } from '@/app/middleware';
import { z } from 'zod';

// Schéma de validation amélioré
const categorySchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    description: z.string().min(5, "La description doit contenir au moins 5 caractères").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur hexadécimale invalide").default('#4F46E5')
});

export async function GET({ params }: { params: { id: string } }) {
    try {
        // Validation de l'ID
        const categoryId = parseInt(params.id);
        if (isNaN(categoryId)) {
            return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 });
        }

        // Récupération de la catégorie avec ses livres
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: {
                id: true,
                nom: true,
                description: true,
                color: true,
                createdAt: true,
                updatedAt: true,
                books: {
                    select: {
                        id: true,
                        title: true,
                        datePublication: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
        }

        return NextResponse.json(category);

    } catch (error) {
        console.error('Erreur GET', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authentification (ajoutez await si nécessaire)
        const authResponse = requireAuth(request);
        if (authResponse instanceof NextResponse) return authResponse;

        // Vérification du rôle
        const roleCheck = checkUserRole(authResponse);
        if (roleCheck) return roleCheck;

        // Validation de l'ID
        const categoryId = Number(params.id);
        if (isNaN(categoryId)) {
            return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 });
        }

        // Traitement des données
        const rawData = await request.json();
        const validation = categorySchema.safeParse(rawData);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        // Mise à jour complète
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: validation.data,
            include: {
                books: {
                    select: {
                        id: true,
                        title: true,
                        datePublication: true
                    }
                }
            }
        });

        return NextResponse.json(updatedCategory);

    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json(
            { error: 'Server error during update' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Authentification
        const authResponse = await requireAuth(request);
        if (authResponse instanceof NextResponse) return authResponse;

        // Vérification du rôle
        const roleCheck = await checkUserRole(authResponse);
        if (roleCheck) return roleCheck;

        // Validation de l'ID
        const categoryId = Number(params.id);
        if (isNaN(categoryId)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        // Vérification de l'existence
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId }
        });
        if (!existingCategory) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
        }

        // Suppression
        await prisma.category.delete({
            where: { id: categoryId }
        });

        return NextResponse.json(
            { message: 'Catégorie supprimée avec succès' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Erreur DELETE:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la suppression' },
            { status: 500 }
        );
    }
}

