import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";

// --- SCHEMA ZOD ---
const baseSchema = z.object({
    nom: z.string(),
    prenom: z.string(),
    biography: z.string().optional(),
    nbreBooks: z.number().optional()
})

export async function POST(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    const json = await request.json();
    const parseResult = baseSchema.safeParse(json);

    if (!parseResult.success) {
        return NextResponse.json({
            error: 'Données invalides',
            issues: parseResult.error.format(),
        }, { status: 400 });
    }

    const { nom, prenom, biography, nbreBooks } = parseResult.data;

    const author = await prisma.author.create({
        data: {
            nom,
            prenom,
            biography,
            nbreBooks
        },
    });

    return NextResponse.json(author, { status: 201 });
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const searchTerm = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'nom';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        const where = searchTerm
            ? {
                OR: [
                    { nom: { contains: searchTerm, mode: 'insensitive' } },
                    { prenom: { contains: searchTerm, mode: 'insensitive' } },
                    { biography: { contains: searchTerm, mode: 'insensitive' } },
                ],
            }
            : {};

        const authors = await prisma.author.findMany({
            where,
            orderBy: {
                [sortBy]: sortOrder,
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                nbreBooks: true,
                biography: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(authors);
    } catch (error) {
        console.error('Erreur lors de la récupération des auteurs:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des auteurs' },
            { status: 500 }
        );
    }
}