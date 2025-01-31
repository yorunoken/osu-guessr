import { NextResponse } from "next/server";
import { validateApiKey } from "@/actions/api-keys-server";
import { getUserByIdAction } from "@/actions/user-server";

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
        const user = await getUserByIdAction(Number(userId));

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("User fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 });
    }
}
