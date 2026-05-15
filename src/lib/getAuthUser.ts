import { NextRequest } from "next/server";

// Role mirrors the application roles stored in the JWT and Prisma schema.
type Role = "ADMIN" | "COMPANY" | "DRIVER" | "CUSTOMER";

// AuthUser is the minimal identity object required by protected API handlers.
interface AuthUser {
    id: number;
    role: Role;
}

/**
 * Reads the authenticated user injected by the proxy.
 * Route handlers call this instead of decoding JWTs again.
 */
export function getAuthUserFromHeaders(request: NextRequest): AuthUser | null {
    const id = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role') as Role | null;

    if (!id || !role) {
        return null;
    }

    // Convert the header id back to a number so Prisma filters can use it directly.
    return { id: Number(id), role: role as Role };
}
