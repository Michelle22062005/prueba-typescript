import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUserFromHeaders } from "@/lib/getAuthUser";

/**
 * PATCH /api/users/[id] updates user profile fields or active status.
 * Only admins can update users, and responses intentionally omit passwords.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authorization context comes from the proxy-injected headers.
        const authUser = await getAuthUserFromHeaders(request);
        if (!authUser)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (authUser.role !== "ADMIN") {
            return NextResponse.json({ error: "You do not have permission" }, { status: 403 });
        }

        // Dynamic route params are promises in this Next.js version.
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Only provided fields are applied to the user record.
        const body = await request.json();
        const { name, email, role, isActive, phone, address, nit } = body;

        // Ensure the user exists before checking conflicts or updating.
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // If the email changes, enforce uniqueness before update.
        if (email && email !== existingUser.email) {
            const emailInUse = await prisma.user.findUnique({ where: { email } });
            if (emailInUse) {
                return NextResponse.json(
                    { error: "Email is already registered" },
                    { status: 409 }
                );
            }
        }

        // Conditional spreads keep omitted fields unchanged.
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(address !== undefined && { address: address || null }),
                ...(nit !== undefined && { nit: nit || null }),
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
        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
