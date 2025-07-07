import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';

        if (query.length < 2) {
            return NextResponse.json([]);
        }

        const books = await prisma.book.findMany({
            where: {
                AND: [
                    { disponible: true },
                    {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { isbn: { contains: query, mode: 'insensitive' } },
                            {
                                author: {
                                    OR: [
                                        { nom: { contains: query, mode: 'insensitive' } },
                                        { prenom: { contains: query, mode: 'insensitive' } }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            take: 10,
            include: {
                author: true
            }
        });

        const formattedBooks = books.map(b => ({
            id: b.id.toString(),
            titre: b.title,
            auteur: `${b.author.prenom} ${b.author.nom}`
        }));

        return NextResponse.json(formattedBooks);

    } catch (error) {
        console.error('Erreur recherche livres:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la recherche' },
            { status: 500 }
        );
    }
}