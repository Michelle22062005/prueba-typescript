import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUserFromHeaders } from "@/lib/getAuthUser";

/**
 * GET /api/shipments returns shipments scoped by the authenticated role.
 * Admins see everything, drivers see assigned work, and customers/companies
 * see only shipments where they are the sender.
 */
export async function GET(request: NextRequest) {
    try {

        // Auth identity is injected by the proxy after token verification.
        const authUser = getAuthUserFromHeaders(request);

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let shipments;

        if (authUser.role === "ADMIN") {
            // Admins can review and manage every shipment in the system.
            shipments = await prisma.shipment.findMany({
                include: {
                    sender: {
                        select: { id: true, name: true, email: true },
                    },
                    driver: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        } else if (authUser.role === "DRIVER") {
            // Drivers only receive shipments assigned to their user id.
            shipments = await prisma.shipment.findMany({
                where: { driverId: authUser.id },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        } else {
            // Customers and companies only see shipments they created as senders.
            shipments = await prisma.shipment.findMany({
                where: { senderId: authUser.id },
                include: {
                    driver: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }


        return NextResponse.json(shipments, { status: 200 });
    } catch (error) {
        console.error("GET Shipments Error:", error);
        return NextResponse.json(
            { error: "Error getting shipments" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/shipments creates a shipment request.
 * Only customer and company accounts can create requests; admin and driver
 * accounts manage shipments through later workflow steps.
 */
export async function POST(request: NextRequest) {
    try {
        // Create requests need a valid authenticated sender.
        const authUser = getAuthUserFromHeaders(request);

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (authUser.role !== "CUSTOMER" && authUser.role !== "COMPANY") {
            return NextResponse.json(
                { error: "Only customers or companies can create shipments" },
                { status: 403 }
            );
        }

        // The request body contains the shipment form and proposed quote.
        const body = await request.json();
        const { cargoType, weight, dimensions, origin, destination, timeline, proposedPrice } = body;

        if (!cargoType || !weight || !origin || !destination || !timeline) {
            return NextResponse.json(
                { error: "All required fields must be completed" },
                { status: 400 }
            );
        }

        // The sender is always the authenticated user, not a client-provided id.
        const newShipment = await prisma.shipment.create({
            data: {
                cargoType,
                weight: Number(weight),
                dimensions: dimensions ?? null,
                origin,
                destination,
                timeline,
                senderId: authUser.id,
                proposedPrice: proposedPrice,
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return NextResponse.json(newShipment, { status: 201 });
    } catch (error) {
        console.error("POST Shipment Error:", error);
        return NextResponse.json(
            { error: "Error creating shipment" },
            { status: 500 }
        );
    }
}
