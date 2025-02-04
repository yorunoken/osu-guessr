import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getHighestStatsAction } from "@/actions/user-server";
import { z } from "zod";

const querySchema = z.object({
    variant: z.enum(["classic", "death"]).default("classic"),
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
            variant: searchParams.get("variant") || "classic",
        });

        const stats = await getHighestStatsAction(query.variant);

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
    }
}
