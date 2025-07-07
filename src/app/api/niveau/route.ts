import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const niveaux = await prisma.niveau.findMany({
      select: {
        id: true,
        nom: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(niveaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}