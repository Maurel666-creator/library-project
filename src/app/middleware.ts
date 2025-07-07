import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/login',
    '/register'
  ];

  // 1. Gestion des requêtes OPTIONS (pré-vol CORS)
  if (request.method === 'OPTIONS') {
    const response = NextResponse.next();
    setCorsHeaders(response, origin);
    return response;
  }

  // 2. Autoriser les requêtes depuis votre frontend
  requestHeaders.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || origin);
  requestHeaders.set('Access-Control-Allow-Credentials', 'true');

  // 3. Routes publiques
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Récupération du token
  const token = request.cookies.get('token')?.value;

  // 5. Gestion différente API vs pages
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Vérification du token
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new Error('Invalid token');
    }

    // 6. Injection des headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('userId', decoded.userId.toString());

    if (decoded.role) {
      requestHeaders.set('userRole', decoded.role);
    }
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    setCorsHeaders(response, origin);
    return response;

  } catch (error) {
    console.error('Authentication error:', error);

    // 7. Nettoyage + réponse adaptée
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('token');
    return response;
  }
}

function setCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
    '/api/author/:path*',
    '/dashboard/:path*',
    '/profile'
  ],
};

export const checkUserRole = (payload: any): NextResponse | null => {
  const allowedRoles = ['MANAGER', 'ADMIN', 'LIBRARIAN'];
  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.json(
      { error: 'Accès non autorisé' },
      { status: 403 }
    );
  }
  return null;
}