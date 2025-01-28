import { NextResponse } from "next/server";
import { searchUsersAction } from "@/actions/user-server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const querySchema = z.object({
    query: z.string().min(2).max(250),
});

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.banchoId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";

        const validated = querySchema.parse({ query });

        const users = await searchUsersAction(validated.query);

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }
}
