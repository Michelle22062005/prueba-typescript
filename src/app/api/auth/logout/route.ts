import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout clears both auth cookies.
 * The frontend also clears localStorage, but expiring cookies is the server-side
 * part that actually ends cookie-based navigation.
 */
export async function POST() {
    const res = NextResponse.json({ message: "Session closed" });

    // Expire the refresh token immediately.
    res.cookies.set("refreshToken", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0)
    });

    // Expire the access token immediately.
    res.cookies.set("accessToken", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0)
    });

    return res;
}
