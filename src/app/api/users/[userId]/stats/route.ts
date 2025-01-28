import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getUserStatsAction } from "@/actions/user-server";
import { z } from "zod";

const querySchema = z.object({
    mode: z.enum(["background", "audio", "skin"]).optional(),
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
        });

        const stats = await getUserStatsAction(Number(userId));
        const filteredStats = query.mode ? stats.filter((s) => s.game_mode === query.mode) : stats;

        return NextResponse.json({
            success: true,
            data: filteredStats,
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch user stats" }, { status: 500 });
    }
}
