import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getTopPlayersAction } from "@/actions/user-server";
import { GameMode } from "@/actions/types";
import { z } from "zod";

const querySchema = z.object({
    mode: z.nativeEnum(GameMode).default(GameMode.Background),
    variant: z.enum(["classic", "death"]).default("classic"),
    limit: z.coerce.number().min(1).max(100).default(100),
});

export async function GET(request: Request) {
    const headers = new Headers(request.headers);
    const apiKey = headers.get("X-API-Key");

    try {
        await validateApiKey(apiKey);
    } catch {
        return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            mode: searchParams.get("mode"),
            variant: searchParams.get("variant"),
            limit: Number(searchParams.get("limit")),
        });

        const leaderboard = await getTopPlayersAction(query.mode, query.variant, query.limit);

        return NextResponse.json({
            success: true,
            data: leaderboard,
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
