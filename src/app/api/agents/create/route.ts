import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * POST /api/agents/create persists an agent configuration for the current user.
 * The proxy protects write access so only admins can create agent records.
 */
export async function POST(req: Request) {
    try {
        // User id is injected by the proxy after token validation.
        const userId = parseInt(req.headers.get("x-user-id")!);

        // Agent fields are intentionally flexible because config is JSON.
        const { name, description, type, config } = await req.json();

        // Persist the agent as public by default for the current app flow.
        const agent = await prisma.agent.create({
            data: {
                name,
                description,
                userId,
                isPublic: true,
                type,
                config
            }
        });

        return NextResponse.json({ success: true, agent }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error persisting agent" }, { status: 500 });
    }
}
