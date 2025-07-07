import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// --- SCHEMA ZOD ---
const baseSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(), // Mot de passe optionnel
    nom: z.string(),
    prenom: z.string(),
    telephone: z.string().min(8),
    role: z.enum(['STUDENT', 'MANAGER']),
    matricule: z.string().optional(),
    filiereId: z.number().optional(),
    niveauId: z.number().optional()
}).superRefine((data, ctx) => {
    // Validation pour les étudiants
    if (data.role === 'STUDENT') {
        if (!data.matricule || !data.filiereId || !data.niveauId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Champs étudiant requis : matricule, filiereId, niveauId',
            });
        }
    }
    // Validation pour les managers
    if (data.role === 'MANAGER' && !data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Mot de passe requis pour les managers',
        });
    }
});

export async function POST(req: NextRequest) {
    const json = await req.json();
    const parseResult = baseSchema.safeParse(json);

    if (!parseResult.success) {
        return NextResponse.json({
            error: 'Données invalides',
            issues: parseResult.error.format(),
        }, { status: 400 });
    }

    const {
        email,
        password,
        nom,
        prenom,
        telephone,
        role,
        matricule,
        filiereId,
        niveauId
    } = parseResult.data;

    try {
        // Vérifications d'unicité
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
        }

        const existingPhone = await prisma.user.findUnique({ where: { telephone } });
        if (existingPhone) {
            return NextResponse.json({ error: 'Téléphone déjà utilisé' }, { status: 409 });
        }

        if (role === 'STUDENT') {
            const existingMatricule = await prisma.student.findUnique({ where: { matricule } });
            if (existingMatricule) {
                return NextResponse.json({ error: 'Matricule déjà utilisé' }, { status: 409 });
            }
        }

        // Hashage du mot de passe seulement pour les managers
        const hashedPassword = role === 'MANAGER' 
            ? await bcrypt.hash(password!, 10) 
            : undefined;

        // Création de l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                nom,
                prenom,
                telephone,
                role,
                ...(role === 'MANAGER' && {
                    manager: {
                        create: {
                            password: hashedPassword
                        }
                    }
                }),
                ...(role === 'STUDENT' && {
                    student: {
                        create: {
                            matricule: matricule!,
                            filiere: { connect: { id: filiereId } },
                            niveau: { connect: { id: niveauId } }
                        }
                    }
                })
            },
            include: {
                student: {
                    include: {
                        filiere: true,
                        niveau: true
                    }
                },
                manager: true
            }
        });

        // Réponse
        return NextResponse.json({
            message: 'Inscription réussie',
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                telephone: user.telephone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erreur lors de la création:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}