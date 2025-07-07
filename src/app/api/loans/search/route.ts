import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";

export async function GET(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    try {
        const loans = await prisma.loan.findMany({
            where: {
                AND: [
                    { dateReturned: null }, // Seulement les emprunts non rendus
                    {
                        OR: [
                            { book: { title: { contains: query, mode: 'insensitive' } } },
                            { student: { user: { nom: { contains: query, mode: 'insensitive' } } } },
                            { student: { user: { prenom: { contains: query, mode: 'insensitive' } } } },
                            { student: { matricule: { contains: query, mode: 'insensitive' } } },
                        ],
                    },
                ],
            },
            include: {
                book: { select: { title: true, id: true } },
                student: {
                    include: {
                        user: { select: { nom: true, prenom: true } },
                    },
                },
            },
            take: 10,
            orderBy: { dateDue: 'asc' }, // Tri par date de retour prévue
        });

        const formattedLoans = loans.map(loan => ({
            id: loan.id,
            livreTitre: loan.book.title,
            livreId: loan.book.id,
            matricule: loan.student.matricule,
            nom: loan.student.user.nom,
            prenom: loan.student.user.prenom,
            dateEmprunt: loan.dateBorrowed.toISOString(),
            dateRetourPrevue: loan.dateDue.toISOString(),
        }));

        return NextResponse.json(formattedLoans);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la recherche' },
            { status: 500 }
        );
    }
}