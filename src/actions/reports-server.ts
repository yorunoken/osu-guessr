"use server";

import { z } from "zod";
import { query } from "@/lib/database";
import { authenticatedAction } from "./server";
import { ReportType, Report } from "./types";
import redisClient from "@/lib/redis";

import { env } from "@/lib/env";

export type { ReportType };

const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK!;
const REPORT_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const REPORT_RATE_LIMIT_MAX_REQUESTS = 3;

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
        body: JSON.stringify({
            content,
            allowed_mentions: { parse: [] },
        }),
    });
}

async function enforceReportRateLimit(userId: number) {
    const key = `report_rate:${userId}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, REPORT_RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > REPORT_RATE_LIMIT_MAX_REQUESTS) {
        throw new Error("Too many reports. Please try again later.");
    }
}

function escapeDiscordMentions(value: string): string {
    return value.replace(/@/g, "@\u200b");
}

export async function createReportAction(mapsetId: number, reportType: ReportType, description: string): Promise<void> {
    return authenticatedAction(async (session) => {
        await enforceReportRateLimit(session.user.banchoId);
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
${escapeDiscordMentions(validated.description)}

Mapset Link: https://osu.ppy.sh/s/${validated.mapsetId}
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
