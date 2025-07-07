import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const filieres = await prisma.filiere.findMany({
      select: {
        id: true,
        code: true,
        nom: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(filieres);
  } catch (error) {
    console.error('Erreur lors de la récupération des filières:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}