"use server";

import { query } from "@/lib/database";
import { Announcement } from "./types";

export async function listAnnouncements(): Promise<Announcement[]> {
    try {
        const results = await query<Announcement>(`
            SELECT id, title, content, created_at
            FROM announcements
            ORDER BY created_at DESC
        `);
        return (results as Announcement[]).map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() } as unknown as Announcement));
    } catch (error) {
        console.error("Error listing announcements:", error);
        return [];
    }
}

export async function getLatestAnnouncement(): Promise<Announcement | null> {
    try {
        const results = await query<Announcement>(`
            SELECT id, title, content, created_at
            FROM announcements
            ORDER BY created_at DESC
            LIMIT 1
        `);
        return results.length > 0 ? ({ ...results[0], created_at: new Date(results[0].created_at).toISOString() } as unknown as Announcement) : null;
    } catch (error) {
        console.error("Error fetching latest announcement:", error);
        return null;
    }
}

export async function addAnnouncement(title: string, content: string): Promise<void> {
    try {
        await query(`INSERT INTO announcements (title, content) VALUES (?, ?);`, [title, content]);
    } catch (error) {
        console.error("Error adding announcement:", error);
        throw error;
    }
}

export async function removeAnnouncement(id: number): Promise<void> {
    try {
        await query(`DELETE FROM announcements WHERE id = ?;`, [id]);
    } catch (error) {
        console.error(`Error removing announcement ${id}:`, error);
        throw error;
    }
}
