import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const books = await prisma.book.findMany({
            include: {
                category: true,
                author: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
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
