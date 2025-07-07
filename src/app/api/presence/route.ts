import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";

export async function GET(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date'); // Format YYYY-MM-DD
        const heure = searchParams.get('heure'); 

        const whereClause: any = {};

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            whereClause.date = {
                gte: startDate,
                lt: endDate
            };

            if (heure) {
                const hour = parseInt(heure);
                whereClause.date.gte.setHours(hour, 0, 0, 0);
                whereClause.date.lt.setHours(hour + 1, 0, 0, 0);
            }
        }

        const presences = await prisma.presence.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        user: { 
                            select: {
                                nom: true,
                                prenom: true,
                                telephone: true
                            }
                        },
                        filiere: {
                            select: {
                                nom: true,
                                code: true
                            }
                        },
                        niveau: { 
                            select: {
                                nom: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Formatage des données
        const formattedPresences = presences.map(p => ({
            id: p.id,
            date: p.date.toLocaleDateString(),
            heure: p.date.toLocaleTimeString(),
            student: p.student ? {
                matricule: p.student.matricule,
                nom: p.student.user.nom,
                prenom: p.student.user.prenom,
                telephone: p.student.user.telephone,
                filiere: p.student.filiere?.nom,
                niveau: p.student.niveau?.nom
            } : null
        }));

        return NextResponse.json({
            success: true,
            data: formattedPresences,
            count: presences.length
        });

    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur serveur lors de la récupération des présences' },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;
    try {
        const { matricule } = await request.json();

        if (!matricule) {
            return NextResponse.json({ error: 'Matricule requis' }, { status: 400 });
        }

        const student = await prisma.student.findUnique({
            where: { matricule }
        });

        if (!student) {
            return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
        }

        // Enregistrement avec la date et l'heure actuelles
        const presence = await prisma.presence.create({
            data: {
                studentId: student.id
            },
            include: {
                student: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...presence,
                heure: presence.date.toLocaleTimeString() // Formatage de l'heure
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

