import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';

        if (query.length < 2) {
            return NextResponse.json([]);
        }

        const students = await prisma.student.findMany({
            where: {
                OR: [
                    { matricule: { contains: query, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { nom: { contains: query, mode: 'insensitive' } },
                                { prenom: { contains: query, mode: 'insensitive' } }
                            ]
                        }
                    }
                ]
            },
            take: 10,
            include: {
                user: {
                    select: {
                        nom: true,
                        prenom: true
                    }
                }
            }
        });

        const formattedStudents = students.map(s => ({
            matricule: s.matricule,
            nom: s.user.nom,
            prenom: s.user.prenom
        }));

        return NextResponse.json(formattedStudents);

    } catch (error) {
        console.error('Erreur recherche étudiants:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la recherche' },
            { status: 500 }
        );
    }
}