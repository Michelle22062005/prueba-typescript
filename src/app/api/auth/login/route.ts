import { LoginUser } from "@/services/loginUser";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/login validates credentials and starts a session.
 * It returns the access token for the current frontend flow and also stores
 * access/refresh tokens in httpOnly cookies.
 */
export async function POST(req: Request) {
    try {
        // Credentials are sent as JSON from the login form.
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json(
                { message: "Required fields are missing" },
                { status: 400 }
            );
        }

        // The service owns password verification and JWT creation.
        const user = await LoginUser({ email, password });

        // Response body gives the UI enough data to route by role.
        const res = NextResponse.json({
            message: "Login successful",
            user: user.user,
            accessToken: user.accessToken
        });

        // Refresh token lives longer and is only available to the server.
        res.cookies.set("refreshToken", user.refreshToken, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });

        // Access token is also stored as httpOnly for protected page navigation.
        res.cookies.set("accessToken", user.accessToken, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 60,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res;

    } catch (error: unknown) {

        const message = error instanceof Error ? error.message : "Unexpected error";

        return NextResponse.json(
            { message },
            { status: 401 }
        );
    }
}
