import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from '@/app/middleware';

export async function GET(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        // Validation des dates
        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Les paramètres start et end sont requis' },
                { status: 400 }
            );
        }

        // Requête pour compter les présences par jour
        const presenceData = await prisma.presence.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Formatage des données pour le frontend
        const formattedData = presenceData.map(item => ({
            date: item.date.toISOString(),
            count: item._count.id
        }));

        // Remplir les jours manquants avec count = 0
        const completeData = [];
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existingData = formattedData.find(d => d.date.split('T')[0] === dateStr);

            completeData.push({
                date: currentDate.toISOString(),
                count: existingData?.count || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return NextResponse.json(completeData);
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des statistiques' },
            { status: 500 }
        );
    }
}