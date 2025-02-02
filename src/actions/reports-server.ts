"use server";

import { z } from "zod";
import { query } from "@/lib/database";
import { authenticatedAction } from "./server";
import { createGithubIssue } from "@/lib/github";

const reportSchema = z.object({
    mapsetId: z.number(),
    reportType: z.enum(["incorrect_title", "inappropriate_content", "wrong_audio", "wrong_background", "other"]),
    description: z.string().min(10).max(1000),
});

export type ReportType = z.infer<typeof reportSchema>["reportType"];

export interface Report {
    id: number;
    user_id: number;
    mapset_id: number;
    report_type: ReportType;
    description: string;
    status: "pending" | "investigating" | "resolved" | "rejected";
    created_at: Date;
    updated_at: Date;
}

export async function createReportAction(mapsetId: number, reportType: ReportType, description: string): Promise<void> {
    return authenticatedAction(async (session) => {
        const validated = reportSchema.parse({
            mapsetId,
            reportType,
            description,
        });

        const [mapset] = await query(`SELECT title, artist FROM mapset_data WHERE mapset_id = ?`, [validated.mapsetId]);

        const issueTitle = `[${reportType}] ${mapset.artist} - ${mapset.title}`;
        const issueBody = `
**Report Type:** ${reportType}
**Mapset ID:** ${mapsetId}
**Reported By:** ${session.user.banchoId}

**Description:**
${description}

**Links:**
- [Mapset Page](https://osu.ppy.sh/s/${mapsetId})
`;

        const labels = ["report", reportType, "pending"];
        const githubIssue = await createGithubIssue(issueTitle, issueBody, labels);

        await query(
            `INSERT INTO reports (
                user_id, mapset_id, report_type, description,
                github_issue_number, github_issue_url
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [session.user.banchoId, validated.mapsetId, validated.reportType, validated.description, githubIssue.data.number, githubIssue.data.html_url],
        );
    });
}

export async function getUserReportsAction(): Promise<Report[]> {
    return authenticatedAction(async (session) => {
        return query(`SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC`, [session.user.banchoId]);
    });
}
