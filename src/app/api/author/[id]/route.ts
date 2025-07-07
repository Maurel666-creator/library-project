import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkUserRole } from '@/app/middleware';
import { z } from 'zod';


const baseSchema = z.object({
    nom: z.string(),
    prenom: z.string(),
    biography: z.string().optional(),
    nbreBooks: z.number().optional()
})

export async function GET({ params }: { params: { id: string } }) {
    try {
        const authorId = parseInt(params.id);

        if (isNaN(authorId)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        const author = await prisma.author.findUnique({
            where: { id: authorId },
            select: {
                id: true,
                nom: true,
                prenom: true,
                biography: true,
                nbreBooks: true,
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

        if (!author) {
            return NextResponse.json({ error: 'Auteur non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ data: author });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'auteur :', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération de l\'auteur' },
            { status: 500 }
        );
    }
}


export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } } // Destructuration correcte des params
) {
    // 1. Authentification
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // 2. Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        // 3. Validation de l'ID
        const authorId = Number(params.id);
        if (isNaN(authorId)) {
            return NextResponse.json(
                { error: "ID d'auteur invalide" },
                { status: 400 }
            );
        }

        // 4. Validation du body
        const json = await request.json();
        const parseResult = baseSchema.safeParse(json);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Données invalides", issues: parseResult.error.format() },
                { status: 400 }
            );
        }

        // 5. Vérification que l'auteur existe
        const existingAuthor = await prisma.author.findUnique({
            where: { id: authorId }
        });

        if (!existingAuthor) {
            return NextResponse.json(
                { error: "Auteur non trouvé" },
                { status: 404 }
            );
        }

        // 6. Mise à jour de l'auteur
        const updatedAuthor = await prisma.author.update({
            where: { id: authorId },
            data: {
                nom: parseResult.data.nom,
                prenom: parseResult.data.prenom,
                biography: parseResult.data.biography,
                nbreBooks: parseResult.data.nbreBooks
            }
        });

        return NextResponse.json(updatedAuthor, { status: 200 });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'auteur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la mise à jour" },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // 1. Authentification
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // 2. Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const authorId = parseInt(params.id);
        if (isNaN(authorId)) {
            return NextResponse.json(
                { error: "ID de l'auteur invalide" },
                { status: 400 }
            );
        }

        // 3. Vérifier si l'auteur existe
        const existingAuthor = await prisma.author.findUnique({
            where: { id: authorId },
        });

        if (!existingAuthor) {
            return NextResponse.json(
                { error: "Auteur non trouvé" },
                { status: 404 }
            );
        }

        // 4. Suppression de l'auteur
        await prisma.author.delete({
            where: { id: authorId },
        });

        return NextResponse.json(
            { message: "Auteur supprimé avec succès" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erreur lors de la suppression de l'auteur:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression" },
            { status: 500 }
        );
    }
}