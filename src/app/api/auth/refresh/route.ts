import { NextResponse } from "next/server";
import { validateRefreshToken, generateAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

/**
 * POST /api/auth/refresh validates the refresh-token cookie.
 * When valid, it creates a new short-lived access token for the same user.
 */
export async function POST() {
    try {
        // Next cookies() reads request cookies in App Router route handlers.
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: "Refresh token is missing" }, { status: 401 });
        }

        // Invalid or expired refresh tokens cannot mint new access tokens.
        const decoded = await validateRefreshToken(refreshToken);

        if (!decoded) {
            return NextResponse.json({ message: "Refresh token is invalid or expired" }, { status: 403 });
        }

        // Preserve the identity fields from the verified refresh token.
        const newPayload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        // Return the new token to the client flow.
        const newAccessToken = await generateAccessToken(newPayload);

        return NextResponse.json({
            accessToken: newAccessToken
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return NextResponse.json({ message: "Error refreshing token", error: message }, { status: 500 });
    }
}
