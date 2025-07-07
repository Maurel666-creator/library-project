import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";

// Schéma Zod pour la validation
const categorySchema = z.object({
    nom: z.string().min(1, "Le nom est requis"),
    description: z.string().min(5, "La description doit contenir au moins 5 caractères").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "La couleur doit être au format hexadécimal").optional().default('#4CAF50')
});

export async function POST(request: NextRequest) {
    // Authentification
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const data = await request.json();

        // Validation
        const validation = categorySchema.safeParse(data);
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Validation échouée',
                    details: validation.error.flatten()
                },
                { status: 400 }
            );
        }

        // Création de la catégorie
        const category = await prisma.category.create({
            data: validation.data
        });

        return NextResponse.json(category, { status: 201 });

    } catch (error) {
        console.error('Erreur lors de la création:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la création' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { nom: 'asc' },
            select: {
                id: true,
                nom: true,
                description: true,
                color: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(categories, { status: 200 });

    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération' },
            { status: 500 }
        );
    }
}