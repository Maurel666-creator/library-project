import { requireAuth } from "@/lib/auth";
import { checkUserRole } from '@/app/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Vérification de l'authentification
        const authResponse = requireAuth(request);
        if (authResponse instanceof NextResponse) return authResponse;

        const roleCheck = checkUserRole(authResponse);
        if (roleCheck) return roleCheck;
        // Récupération des données
        const [totalLivres, empruntsEnCours, empruntsEnRetard] = await Promise.all([
            prisma.book.count(),
            prisma.loan.count({
                where: {
                    dateReturned: null,
                    dateDue: { gte: new Date() }
                }
            }),
            prisma.loan.count({
                where: {
                    dateReturned: null,
                    dateDue: { lt: new Date() }
                }
            })
        ]);

        const result = { totalLivres, empruntsEnCours, empruntsEnRetard };


        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('[STATS_ERROR]', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des statistiques' },
            { status: 500 }
        );
    }
}