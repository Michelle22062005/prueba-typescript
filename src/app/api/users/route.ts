import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { getAuthUserFromHeaders } from "@/lib/getAuthUser";
import bcrypt from "bcryptjs";

/**
 * GET /api/users lists the user directory for admins.
 * The proxy injects the authenticated user headers used for authorization.
 */
export async function GET(request: NextRequest) {
    try {
        // Only requests that passed through the proxy include auth user headers.
        const authUser = getAuthUserFromHeaders(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });

        }
        if (authUser.role !== 'ADMIN') {
            return NextResponse.json({ error: "You do not have permission" }, { status: 403 });
        }

        // Select avoids returning password hashes to the admin UI.
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                nit: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.log("GET Users Error:", error);
        return NextResponse.json({ error: "Error getting users" }, { status: 500 });
    }
}

/**
 * POST /api/users lets admins create users from the dashboard.
 * It validates required fields, checks duplicate email, hashes the password,
 * and returns the new user without sensitive credentials.
 */
export async function POST(request: NextRequest) {
    try {
        // Admin-only guard for user creation.
        const authUser = getAuthUserFromHeaders(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "You do not have permission" }, { status: 403 });
        }

        // The modal sends the user fields as JSON.
        const body = await request.json();
        const { name, email, password, role, phone, address, nit } = body;
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Prevent duplicate accounts by email.
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email is already registered" },
                { status: 409 }
            );
        }

        // Hash before create so the database never stores raw passwords.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Select only display fields for the response.
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role ?? "CUSTOMER",
                phone: phone || null,
                address: address || null,
                nit: nit || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                nit: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.log("POST Users Error:", error);
        return NextResponse.json({ error: "Error creating user" }, { status: 500 })
    }
}
