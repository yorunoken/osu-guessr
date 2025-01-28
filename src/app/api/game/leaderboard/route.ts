import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopPlayersAction } from "@/actions/user-server";
import { z } from "zod";

const querySchema = z.object({
    mode: z.enum(["background", "audio", "skin"]),
    limit: z.coerce.number().min(1).max(100).default(100),
});

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode") || "background";
        const limit = Number(searchParams.get("limit")) || 100;

        const query = querySchema.parse({ mode, limit });

        const leaderboard = await getTopPlayersAction(query.mode, query.limit);

        return NextResponse.json({
            success: true,
            data: leaderboard,
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
