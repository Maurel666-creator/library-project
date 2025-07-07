import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from '@/app/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const { searchParams } = new URL(request.url);

        // Paramètres de pagination et filtres
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '10');
        const statut = searchParams.get('statut') || '';
        const nom = searchParams.get('nom') || '';
        const date = searchParams.get('date') || '';

        // Calcul du skip pour la pagination
        const skip = (page - 1) * perPage;

        // Construction des conditions WHERE
        const where: any = {};

        if (statut) {
            if (statut === 'En retard') {
                where.dateReturned = null;
                where.dateDue = { lt: new Date() };
            } else if (statut === 'Retourné') {
                where.dateReturned = { not: null };
            } else if (statut === 'En cours') {
                where.dateReturned = null;
                where.dateDue = { gte: new Date() };
            }
        }

        if (nom) {
            where.student = {
                OR: [
                    { matricule: { contains: nom, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { nom: { contains: nom, mode: 'insensitive' } },
                                { prenom: { contains: nom, mode: 'insensitive' } }
                            ]
                        }
                    }
                ]
            };
        }

        if (date) {
            where.dateBorrowed = {
                gte: new Date(date),
                lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            };
        }

        // Requête pour les emprunts avec pagination et filtres
        const [loans, total] = await Promise.all([
            prisma.loan.findMany({
                skip,
                take: perPage,
                where,
                orderBy: { dateBorrowed: 'desc' },
                include: {
                    book: true,
                    student: {
                        include: {
                            user: true
                        }
                    }
                }
            }),
            prisma.loan.count({ where })
        ]);

        // Formatage des données
        const formattedLoans = loans.map(loan => ({
            nom: loan.student.user.nom,
            prenom: loan.student.user.prenom,
            matricule: loan.student.matricule,
            livre: loan.book.title,
            dateEmprunt: loan.dateBorrowed.toISOString().split('T')[0],
            dateRetour: loan.dateReturned ? loan.dateReturned.toISOString().split('T')[0] : '',
            statut: loan.dateReturned
                ? 'Retourné'
                : new Date() > loan.dateDue
                    ? 'En retard'
                    : 'En cours'
        }));

        return NextResponse.json({
            success: true,
            data: formattedLoans,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        });

    } catch (error) {
        console.error('Erreur récupération emprunts:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des emprunts' },
            { status: 500 }
        );
    }
}