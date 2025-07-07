import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    // Authentification
    const authResponse = requireAuth(req);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        // Utilisation directe de NEXT_PUBLIC_QR_BASE_URL sans section
        const fullUrl = process.env.NEXT_PUBLIC_QR_BASE_URL;

        if (!fullUrl) {
            throw new Error('NEXT_PUBLIC_QR_BASE_URL non configuré');
        }

        // Génération du QR code
        const qrImage = await QRCode.toDataURL(fullUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Création ou mise à jour du code
        const qrCode = await prisma.qRCode.upsert({
            where: { id: 1 },
            update: {
                image: qrImage,
                code: fullUrl
            },
            create: {
                image: qrImage,
                code: fullUrl
            }
        });

        if (!qrCode) {
            return NextResponse.json(
                { error: 'Une erreur est survenue' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { 'qrImage': qrImage },
            { status: 201 }
        );
    } catch (error) {
        console.error('Erreur de génération du QR:', error);
        return NextResponse.json(
            { error: 'Échec de la génération du QR code' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    // Authentification
    const authResponse = requireAuth(req);
    if (authResponse instanceof NextResponse) return authResponse;

    // Vérification du rôle
    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;

    try {
        const qrCode = await prisma.qRCode.findFirst();
        if (!qrCode) {
            return NextResponse.json(
                { error: 'Aucun QR code trouvé' },
                { status: 401 }
            );
        }

        return NextResponse.json(qrCode);
    } catch (error) {
        console.error('Une erreur est survenue', error);
        return NextResponse.json(
            { error: 'Échec de la récupération' },
            { status: 500 }
        );
    }
}
