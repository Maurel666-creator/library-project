import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from '@/app/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const { matricule, livre, dateRetourPrevue, remarques } = await request.json();

        // Validation des données
        if (!matricule || !livre || !dateRetourPrevue) {
            return NextResponse.json(
                { error: 'Matricule, livre et date de retour sont requis' },
                { status: 400 }
            );
        }

        // Trouver l'étudiant
        const student = await prisma.student.findUnique({
            where: { matricule },
            include: { user: true }
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Étudiant non trouvé' },
                { status: 404 }
            );
        }

        // Trouver le livre
        const book = await prisma.book.findFirst({
            where: {
                OR: [
                    { title: { contains: livre, mode: 'insensitive' } },
                    { isbn: livre }
                ],
                disponible: true
            }
        });

        if (!book) {
            return NextResponse.json(
                { error: 'Livre non disponible ou introuvable' },
                { status: 404 }
            );
        }

        // Créer l'emprunt
        const loan = await prisma.loan.create({
            data: {
                bookId: book.id,
                studentId: student.id,
                dateBorrowed: new Date(),
                dateDue: new Date(dateRetourPrevue),
                remarks: remarques || null
            },
            include: {
                book: true,
                student: {
                    include: {
                        user: true
                    }
                }
            }
        });

        // Mettre à jour la disponibilité du livre
        await prisma.book.update({
            where: { id: book.id },
            data: { disponible: false }
        });

        return NextResponse.json({
            success: true,
            data: {
                id: loan.id,
                livreTitre: loan.book.title,
                matricule: student.matricule,
                nom: student.user.nom,
                prenom: student.user.prenom,
                dateEmprunt: loan.dateBorrowed.toISOString(),
                dateRetourPrevue: loan.dateDue.toISOString()
            }
        });

    } catch (error) {
        console.error('Erreur création emprunt:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la création de l\'emprunt' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        const loans = await prisma.loan.findMany({
            take: limit,
            orderBy: {
                dateBorrowed: 'desc'
            },
            include: {
                book: true,
                student: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const formattedLoans = loans.map(loan => ({
            id: loan.id,
            livreTitre: loan.book.title,
            matricule: loan.student.matricule,
            nom: loan.student.user.nom,
            prenom: loan.student.user.prenom,
            dateEmprunt: loan.dateBorrowed.toLocaleDateString(),
            dateRetourPrevue: loan.dateDue.toLocaleDateString()
        }));

        return NextResponse.json({
            success: true,
            data: formattedLoans
        });

    } catch (error) {
        console.error('Erreur récupération emprunts:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des emprunts' },
            { status: 500 }
        );
    }
}