import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUserFromHeaders } from "@/lib/getAuthUser";

/**
 * PATCH /api/shipments/[id] updates an existing shipment.
 * Admins can assign drivers, set statuses, and reject shipments; drivers can
 * only advance their own assigned shipments to in-transit or delivered.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth context comes from proxy-injected headers.
        const authUser = getAuthUserFromHeaders(request);

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Route params are promises in this Next.js version.
        const { id: idParam } = await params;
        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Load the existing shipment to validate ownership and existence.
        const existingShipment = await prisma.shipment.findUnique({
            where: { id },
        });

        if (!existingShipment) {
            return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
        }

        // Body fields are optional because different roles update different fields.
        const body = await request.json();
        const { driverId, status, rejectionReason } = body;

        // Admins can assign drivers, update status, or reject with a reason.
        if (authUser.role === "ADMIN") {
            const updatedShipment = await prisma.shipment.update({
                where: { id },
                data: {
                    ...(driverId && { driverId, status: "ASSIGNED" }),
                    ...(status && { status }),
                    ...(rejectionReason && { rejectionReason, status: "REJECTED" }),
                },
                include: {
                    sender: { select: { id: true, name: true, email: true } },
                    driver: { select: { id: true, name: true, email: true } },
                },
            });
            return NextResponse.json(updatedShipment, { status: 200 });
        }

        // Drivers can only update shipments assigned to them.
        if (authUser.role === "DRIVER") {
            if (existingShipment.driverId !== authUser.id) {
                return NextResponse.json(
                    { error: "You do not have permission to update this shipment" },
                    { status: 403 }
                );
            }

            // Driver status changes are limited to the active trip flow.
            const allowedStatuses = ["IN_TRANSIT", "DELIVERED"];
            if (!allowedStatuses.includes(status)) {
                return NextResponse.json(
                    { error: "Status is not allowed" },
                    { status: 400 }
                );
            }

            const updatedShipment = await prisma.shipment.update({
                where: { id },
                data: { status },
                include: {
                    sender: { select: { id: true, name: true, email: true } },
                },
            });
            return NextResponse.json(updatedShipment, { status: 200 });
        }

        return NextResponse.json({ error: "You do not have permission" }, { status: 403 });
    } catch (error) {
        console.error("PATCH Shipment Error:", error);
        return NextResponse.json(
            { error: "Error updating shipment" },
            { status: 500 }
        );
    }
}
