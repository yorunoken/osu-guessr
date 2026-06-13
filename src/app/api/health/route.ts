import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.json({
        ok: true,
        deploymentId: process.env.NEXT_DEPLOYMENT_ID || null,
    });
}
