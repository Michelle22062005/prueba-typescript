import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/register creates a public account.
 * Admin registration is protected with ADMIN_SECRET_CODE, while all roles
 * still pass through duplicate email checks and password hashing.
 */
export async function POST(req: Request) {
    try {
        // Read the expected registration fields from the JSON request body.
        const body = await req.json();
        const { name, email, password, role, phone, address, nit, adminCode } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "All required fields must be completed" },
                { status: 400 }
            );
        }

        // ADMIN accounts require a shared secret so they cannot self-register freely.
        if (role === "ADMIN") {
            if (!adminCode) {
                return NextResponse.json(
                    { message: "Admin code is required" },
                    { status: 400 }
                );
            }
            if (adminCode !== process.env.ADMIN_SECRET_CODE) {
                return NextResponse.json(
                    { message: "Admin code is incorrect" },
                    { status: 400 }
                );
            }
        }

        // Reject duplicate emails before attempting the create operation.
        const existngUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existngUser) {
            return NextResponse.json(
                { message: "Email is already registered" },
                { status: 409 }
            );
        }

        // Keep role input constrained to the values supported by the app.
        if (!["ADMIN", "DRIVER", "CUSTOMER", "COMPANY"].includes(role)) {
            return NextResponse.json(
                { message: "Invalid role" },
                { status: 400 }
            );
        }

        // Hash the password before persisting the user record.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Return only safe account fields, never the password hash.
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone: phone || null,
                address: address || null,
                nit: nit || null,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                nit: true,
                role: true,
                createdAt: true,
            },
        })
        return NextResponse.json(
            { message: "User registered successfully", user: newUser },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error("Register Error:", error);
        const message = error instanceof Error ? error.message : "Unexpected error";
        return NextResponse.json(
            { message, error: "Error registering user" },
            { status: 500 }
        );
    }
}
