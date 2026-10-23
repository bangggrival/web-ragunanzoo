import { NextRequest, NextResponse } from 'next/server';

// Paths that are always accessible even during maintenance mode
const MAINTENANCE_BYPASS_PATHS = [
  '/maintenance',
  '/manager',
  '/api/',
  '/auth',
  '/uploads/',
  '/_next/',
  '/favicon',
  '/robots.txt',
  '/sw.js',
  '/manifest',
  '/images/',
  '/placeholder.svg',
];

function isMaintenanceBypassPath(pathname: string): boolean {
  return MAINTENANCE_BYPASS_PATHS.some((p) => pathname.startsWith(p));
}

import crypto from 'crypto';

// Cryptographic JWT HS256 verification using Node.js crypto module with timingSafeEqual
function verifyJwtToken(token: string, secretStr: string): { valid: boolean; role?: string } {
  try {
    const rawToken = token.startsWith('%') ? decodeURIComponent(token) : token;
    const parts = rawToken.split('.');
    if (parts.length !== 3) return { valid: false };
    const [headerB64, payloadB64, sigB64] = parts;

    // Calculate expected HMAC SHA-256 signature
    const expectedSig = crypto
      .createHmac('sha256', secretStr)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(sigB64);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { valid: false };
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return { valid: false };
    }

    return { valid: true, role: payload.role };
  } catch {
    return { valid: false };
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ROUTE GUARDING: Cryptographically verify JWT and roles for /manager routes
  if (pathname.startsWith('/manager')) {
    const isProd = process.env.NODE_ENV === 'production';
    const defaultSecret = 'ragunan_super_secret_production_key_2026_xYz987!@#';
    const jwtSecret = process.env.JWT_SECRET || (isProd ? '' : defaultSecret);

    if (isProd && (!jwtSecret || jwtSecret === defaultSecret)) {
      console.error('🚨 [SECURITY ALERT] Insecure or missing JWT_SECRET detected in production environment! Access to /manager blocked.');
      const authUrl = new URL('/auth?error=security_misconfiguration', request.url);
      return NextResponse.redirect(authUrl);
    }

    const token = request.cookies.get('sb-token')?.value;
    if (!token) {
      // Immediate server-side redirect to /auth without flashing the manager UI shell
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(authUrl);
    }

    const { valid, role } = await verifyJwtToken(token, jwtSecret);
    const isStaffOrAdmin = role && ['admin', 'staff', 'manager', 'superadmin'].includes(role);

    if (!valid || !isStaffOrAdmin) {
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(authUrl);
      res.cookies.delete('sb-token');
      return res;
    }

    // Authenticated session and verified staff/admin role - allow request to proceed
    return NextResponse.next();
  }

  // 2. MAINTENANCE MODE: Skip check for static/system bypass paths
  if (isMaintenanceBypassPath(pathname)) {
    return NextResponse.next();
  }

  // 3. MAINTENANCE MODE: Check status from backend API
  try {
    const backendUrl =
      process.env.INTERNAL_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://127.0.0.1:5005';

    const res = await fetch(`${backendUrl}/api/maintenance-status`, {
      // Fast timeout so edge proxy never slows down normal visitor requests
      signal: AbortSignal.timeout(1500),
      cache: 'no-store',
    });

    if (res.ok) {
      const { enabled } = await res.json();
      if (enabled) {
        if (pathname === '/') {
          // Rewrite root URL to /maintenance so URL stays clean
          const maintenanceUrl = new URL('/maintenance', request.url);
          return NextResponse.rewrite(maintenanceUrl);
        } else {
          // Redirect subpages to root (which rewrites to maintenance)
          const rootUrl = new URL('/', request.url);
          return NextResponse.redirect(rootUrl);
        }
      }
    }
  } catch {
    // Fail-open strategy: if backend is temporarily unreachable, allow users to continue
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and Next.js internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|placeholder.svg|sw.js|robots.txt|manifest.webmanifest).*)',
  ],
};
