import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret'; // À remplacer par une vraie clé secrète en production

interface TokenPayload {
  userId: number;
  role?: string;
}

/**
 * Génère un JWT pour un utilisateur donné
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

/**
 * Vérifie un JWT et retourne le payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
}

/**
 * Récupère le token depuis l’en-tête Authorization ou les cookies
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Supprime "Bearer "
  }

  const token = req.cookies.get('token')?.value;
  return token || null;
}

/**
 * Middleware pour protéger les routes API
 */
export function requireAuth(req: NextRequest): TokenPayload | NextResponse {
  const token = getTokenFromRequest(req);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  return payload;
}
