import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }

  //retouver le manager associé
  const manager = await prisma.manager.findUnique({
    where: { userId: user.id },
    select: {
      password: true, // Assurez-vous que le mot de passe est sélectionné
    }
  })

  if (!manager) {
    return NextResponse.json({ error: 'Utilisateur non autorisé' }, { status: 403 });
  }

  const passwordMatch = await bcrypt.compare(password, manager?.password);

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  // Mise à jour de lastConnected ET génération du token
  const [token, updatedUser] = await Promise.all([
    generateToken({ userId: user.id, role: user.role }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastConnected: new Date() } // Met à jour avec la date/heure actuelle
    })
  ]);

  const actualUser = {
    userId: updatedUser.id, // Utilisez le user mis à jour
    email: updatedUser.email,
    role: updatedUser.role,
  }

  const response = NextResponse.json({
    message: 'Connexion réussie',
    token,
    actualUser
  }, { status: 200 });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    domain: process.env.COOKIE_DOMAIN || undefined // a ajouter dans le .env
  });

  return response;
}