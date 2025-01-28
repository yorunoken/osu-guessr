import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getUserLatestGamesAction } from "@/actions/user-server";
import { z } from "zod";

const querySchema = z.object({
    mode: z.enum(["background", "audio", "skin"]).optional(),
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
            limit: Number(searchParams.get("limit")),
            offset: Number(searchParams.get("offset")),
        });

        const games = await getUserLatestGamesAction(Number(userId), query.mode);
        const paginatedGames = games.slice(query.offset, query.offset + query.limit);

        return NextResponse.json({
            success: true,
            data: paginatedGames,
            meta: {
                total: games.length,
                offset: query.offset,
                limit: query.limit,
            },
        });
    } catch (error) {
        console.error("Games error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch user games" }, { status: 500 });
    }
}
