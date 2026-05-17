import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken } from './lib/jwt';

// Public pages are accessible without a session but redirect away when logged in.
const PUBLIC_PAGE = ['/login', '/register'];

// Protected pages require a valid access token cookie.
const PROTECTED_PAGE = [
    '/masterAdmin',
    '/company',
    '/customer',
    '/driver',
    '/shipments'
]

/**
 * proxy protects selected pages and API routes before they reach handlers.
 * It validates the access token, redirects page requests when needed,
 * and injects trusted user headers for API handlers.
 */
export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // Page protection runs before API logic because pages redirect instead of returning JSON.
    const isProtectedPage = PROTECTED_PAGE.some(p => pathname.startsWith(p));
    const isPublicPage = PUBLIC_PAGE.some(p => pathname.startsWith(p));

    if (isProtectedPage || isPublicPage) {
        // Pages rely on the httpOnly accessToken cookie instead of an Authorization header.
        const token = req.cookies.get('accessToken')?.value;
        const user = token ? await validateAccessToken(token) : null;

        if (isProtectedPage && !user) {
            // Anonymous users are sent back to the login page.
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (isPublicPage && user) {
            // Logged-in users should land in the main admin dashboard by default.
            return NextResponse.redirect(new URL('/masterAdmin', req.url));
        }
        return NextResponse.next();
    }

    // API protection accepts either a Bearer token or the accessToken cookie.
    const authHeader = req.headers.get('authorization');
    let token = authHeader?.split(' ')[1];

    if (!token) {
        token = req.cookies.get('accessToken')?.value;
    }

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateAccessToken(token);
    if (!user) {
        return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    // The agents API only allows admin write operations.
    const isWriteAction = ['POST', 'PUT', 'DELETE'].includes(method);

    if (pathname.startsWith('/api/agents')) {
        if (isWriteAction && user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Access restricted to administrators' }, { status: 403 });
        }
    }

    // Downstream API handlers trust these headers because the proxy sets them.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id.toString());
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: [
        '/masterAdmin/:path*', // Protects masterAdmin and nested routes.
        '/masterAdmin',        // Protects the base masterAdmin route.
        '/company/:path*',     // Protects company dashboard routes.
        '/customer/:path*',
        '/driver/:path*',
        '/login',
        '/register',
        '/api/agents/:path*',
        '/api/agents',         // Protects the base agents route.
        '/api/admin/:path*',
        '/api/users/:path*',
        '/api/users',
        '/api/shipments/:path*',
        '/api/shipments',
    ],
};
