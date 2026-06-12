import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getUserGamesCountAction, getUserLatestGamesAction } from "@/actions/user-server";
import { GameMode } from "@/actions/types";
import { z } from "zod";

const querySchema = z.object({
    mode: z.nativeEnum(GameMode).optional(),
    variant: z.enum(["classic", "death"]).default("classic"),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const headers = new Headers(request.headers);
    const apiKey = headers.get("X-API-Key");

    try {
        await validateApiKey(apiKey);
    } catch {
        return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 403 });
    }

    try {
        const { userId } = await params;
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            mode: searchParams.get("mode"),
            variant: searchParams.get("variant") || "classic",
            limit: searchParams.get("limit") ?? undefined,
            offset: searchParams.get("offset") ?? undefined,
        });

        const banchoId = Number(userId);
        const [games, total] = await Promise.all([getUserLatestGamesAction(banchoId, query.mode, query.variant, query.limit, query.offset), getUserGamesCountAction(banchoId, query.mode, query.variant)]);

        return NextResponse.json({
            success: true,
            data: games,
            meta: {
                total,
                offset: query.offset,
                limit: query.limit,
            },
        });
    } catch (error) {
        console.error("Games error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch user games" }, { status: 500 });
    }
}
