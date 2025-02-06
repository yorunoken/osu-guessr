"use server";

import { query } from "@/lib/database";
import presetBadges from "./badges.json";

export type PresetBadge = keyof typeof presetBadges;

export async function addBadge(banchoId: number, badge: string, color?: string) {
    const finalColor = badge.toLowerCase() in presetBadges ? color || presetBadges[badge.toLowerCase() as PresetBadge] : color;

    if (!finalColor) {
        throw Error("Please either type in a color hex code, or select a badge title from the presets.");
    }

    try {
        await query(
            `UPDATE users
             SET special_badge = ?,
                 special_badge_color = ?
             WHERE bancho_id = ?`,
            [badge, finalColor, banchoId],
        );
        return `Successfully added badge "${badge}" to user ${banchoId}`;
    } catch (error) {
        throw new Error(`Error adding badge to user ${banchoId}: ${error}`);
    }
}

export async function removeBadge(banchoId: number) {
    try {
        await query(
            `UPDATE users
             SET special_badge = NULL,
                 special_badge_color = NULL
             WHERE bancho_id = ?`,
            [banchoId],
        );
        return `Successfully removed badge from user ${banchoId}`;
    } catch (error) {
        throw new Error(`Error removing badge from user ${banchoId}: ${error}`);
    }
}

export async function listBadges() {
    try {
        const users = await query(
            `SELECT bancho_id, username, special_badge, special_badge_color
             FROM users
             WHERE special_badge IS NOT NULL`,
        );
        return users;
    } catch (error) {
        throw new Error(`Error listing badges: ${error}`);
    }
}
