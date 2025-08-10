"use server";

import { z } from "zod";
import { query } from "@/lib/database";
import { authenticatedAction } from "./server";
import { ReportType, Report } from "./types";

export type { ReportType };

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK!;

const reportSchema = z.object({
    mapsetId: z.number(),
    reportType: z.enum(["incorrect_title", "inappropriate_content", "wrong_audio", "wrong_background", "other"]),
    description: z.string().min(10).max(1000),
});

async function sendDiscordWebhook(content: string) {
    await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
    });
}

export async function createReportAction(mapsetId: number, reportType: ReportType, description: string): Promise<void> {
    return authenticatedAction(async (session) => {
        const validated = reportSchema.parse({
            mapsetId,
            reportType,
            description,
        });

        const [mapset] = (await query(`SELECT title, artist FROM mapset_data WHERE mapset_id = ?`, [validated.mapsetId])) as [{ title: string; artist: string }];

        const reportMessage = `
**New Report**
Type: ${reportType}
Mapset: ${mapset.artist} - ${mapset.title}
Mapset ID: ${mapsetId}
Reported By: ${session.user.banchoId}

Description:
${description}

Mapset Link: https://osu.ppy.sh/s/${mapsetId}
`;

        await sendDiscordWebhook(reportMessage);

        await query(
            `INSERT INTO reports (
                user_id, mapset_id, report_type, description
            ) VALUES (?, ?, ?, ?)`,
            [session.user.banchoId, validated.mapsetId, validated.reportType, validated.description]
        );
    });
}

export async function getUserReportsAction(): Promise<Report[]> {
    return authenticatedAction(async (session) => {
        return query(`SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC`, [session.user.banchoId]);
    });
}
