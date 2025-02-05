"use server";

import { query } from "@/lib/database";
import { z } from "zod";
import { authenticatedAction } from "./server";
import { GameVariant } from "@/app/games/config";

export interface User {
    bancho_id: number;
    username: string;
    avatar_url: string;
    special_badge?: string;
    special_badge_color?: string;
    created_at: Date;
}

export interface UserAchievement {
    user_id: number;
    game_mode: GameMode;
    variant: GameVariant;
    total_score: number;
    games_played: number;
    highest_streak: number;
    highest_score: number;
    last_played: Date;
}

export interface UserRanks {
    globalRank?: number;
    modeRanks: {
        [key in GameMode]: {
            globalRank?: number;
        };
    };
}

export interface UserWithStats extends User {
    achievements?: UserAchievement[];
    ranks?: UserRanks;
}

export interface Game {
    user_id: number;
    game_mode: GameMode;
    points: number;
    streak: number;
    variant: GameVariant;
    ended_at: Date;
}

export interface TopPlayer extends User {
    total_score: number;
    games_played: number;
    highest_streak: number;
    highest_score: number;
    variant: GameVariant;
}

export interface HighestStats {
    highest_points: number;
    total_games: number;
    total_users: number;
}

type GameMode = "background" | "audio" | "skin";

interface SpecialUser {
    banchoId: number;
    badge: string;
    color: string;
}

const SPECIAL_USERS: Array<SpecialUser> = [
    { banchoId: 17279598, badge: "Owner", color: "#FF6B6B" },
    { banchoId: 13845312, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 20367144, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 25468052, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 18567756, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 18153277, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 14519821, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 12643934, badge: "Beta Tester", color: "#7C3AED" },
    { banchoId: 4539930, badge: "Fish", color: "#DE9B4A" },
    { banchoId: 3171691, badge: "The Greatest Of All Time", color: "#FFA500" },
    { banchoId: 3516241, badge: "Fake Italian", color: "#DE9B4A" },
];

export async function getSpecialUsers(): Promise<Array<SpecialUser>> {
    return SPECIAL_USERS;
}

// Schemas
const gameModeSchema = z.enum(["background", "audio", "skin"]);
const searchSchema = z.object({
    term: z.string().min(2).max(250),
    limit: z.number().min(1).max(100).default(10),
});

// Server actions
export async function createUserAction(banchoId: number, username: string, avatar_url: string) {
    const specialUser = SPECIAL_USERS.find((user) => user.banchoId === banchoId);

    return query(
        `INSERT INTO users (bancho_id, username, avatar_url, special_badge, special_badge_color)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            avatar_url = VALUES(avatar_url),
            special_badge = VALUES(special_badge),
            special_badge_color = VALUES(special_badge_color)`,
        [banchoId, username, avatar_url, specialUser?.badge || null, specialUser?.color || null],
    );
}

export async function deleteUserAction(banchoId: number) {
    return authenticatedAction(async () => {
        await query("DELETE FROM users WHERE bancho_id = ?", [banchoId]);
        return { success: true };
    });
}

export async function getUserByIdAction(banchoId: number): Promise<UserWithStats | null> {
    const userResult = await query(`SELECT * FROM users WHERE bancho_id = ?`, [banchoId]);

    if (!userResult[0]) return null;
    const user = userResult[0];

    // Get achievements for both variants
    const achievements = await query(
        `SELECT g.user_id, g.game_mode, g.variant,
                COUNT(*) as games_played,
                MAX(CASE WHEN g.variant = 'classic' THEN g.points ELSE 0 END) as highest_score,
                MAX(g.streak) as highest_streak,
                SUM(CASE WHEN g.variant = 'classic' THEN g.points ELSE 0 END) as total_score,
                MAX(g.ended_at) as last_played
         FROM games g
         WHERE g.user_id = ?
         GROUP BY g.user_id, g.game_mode, g.variant`,
        [banchoId],
    );

    // Only consider classic mode for global ranking
    const globalRankResult = await query(
        `SELECT COUNT(*) as globalRank
         FROM (
             SELECT user_id, SUM(points) as total_points
             FROM games
             WHERE variant = 'classic'
             GROUP BY user_id
         ) scores
         WHERE scores.total_points > (
             SELECT COALESCE(SUM(points), 0)
             FROM games
             WHERE user_id = ? AND variant = 'classic'
         )`,
        [banchoId],
    );

    const modeRanks: { [key in GameMode]: { globalRank?: number } } = {
        background: {},
        audio: {},
        skin: {},
    };

    // Update mode ranks to consider variants
    for (const mode of Object.keys(modeRanks) as GameMode[]) {
        const classicRank = await query(
            `SELECT COUNT(*) as rank
             FROM (
                 SELECT user_id, SUM(points) as total_points
                 FROM games
                 WHERE game_mode = ? AND variant = 'classic'
                 GROUP BY user_id
             ) scores
             WHERE scores.total_points > (
                 SELECT COALESCE(SUM(points), 0)
                 FROM games
                 WHERE user_id = ? AND game_mode = ? AND variant = 'classic'
             )`,
            [mode, banchoId, mode],
        );

        modeRanks[mode] = {
            globalRank: classicRank[0].rank + 1,
        };
    }

    return {
        ...user,
        achievements,
        ranks: {
            globalRank: globalRankResult[0].globalRank + 1,
            modeRanks,
        },
    };
}

export async function getUserStatsAction(banchoId: number): Promise<Array<UserAchievement>> {
    const result = await query(
        `SELECT user_id, game_mode, total_score, games_played,
                highest_streak, highest_score, last_played
         FROM user_achievements
         WHERE user_id = ?`,
        [banchoId],
    );
    return result;
}

export async function getUserLatestGamesAction(banchoId: number, gameMode?: GameMode, variant: GameVariant = "classic"): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, variant, ended_at
           FROM games
           WHERE user_id = ? AND game_mode = ? AND variant = ?
           ORDER BY ended_at DESC`
        : `SELECT user_id, game_mode, points, streak, variant, ended_at
           FROM games
           WHERE user_id = ? AND variant = ?
           ORDER BY ended_at DESC`;

    const params = validatedMode ? [banchoId, validatedMode, variant] : [banchoId, variant];

    return query(query_string, params);
}

export async function getUserTopGamesAction(banchoId: number, gameMode?: GameMode, variant: GameVariant = "classic"): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const orderBy = variant === "classic" ? "points" : "streak";

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, variant, ended_at
           FROM games
           WHERE user_id = ? AND game_mode = ? AND variant = ?
           ORDER BY ${orderBy} DESC`
        : `SELECT user_id, game_mode, points, streak, variant, ended_at
           FROM games
           WHERE user_id = ? AND variant = ?
           ORDER BY ${orderBy} DESC`;

    const params = validatedMode ? [banchoId, validatedMode, variant] : [banchoId, variant];

    return query(query_string, params);
}

export async function getTopPlayersAction(gamemode: GameMode, variant: GameVariant = "classic", limit: number = 10): Promise<Array<TopPlayer>> {
    const validatedMode = gameModeSchema.parse(gamemode);

    const query_string =
        variant === "classic"
            ? `SELECT u.*,
                COUNT(*) as games_played,
                MAX(g.streak) as highest_streak,
                MAX(g.points) as highest_score,
                SUM(g.points) as total_score
         FROM games g
         JOIN users u ON g.user_id = u.bancho_id
         WHERE g.game_mode = ? AND g.variant = 'classic'
         GROUP BY g.user_id
         ORDER BY total_score DESC
         LIMIT ?`
            : `SELECT u.*,
                COUNT(*) as games_played,
                MAX(g.streak) as highest_streak,
                0 as highest_score,
                0 as total_score
         FROM games g
         JOIN users u ON g.user_id = u.bancho_id
         WHERE g.game_mode = ? AND g.variant = 'death'
         GROUP BY g.user_id
         ORDER BY highest_streak DESC
         LIMIT ?`;

    return query(query_string, [validatedMode, limit]);
}

export async function searchUsersAction(searchTerm: string, limit: number = 10): Promise<Array<User>> {
    const validated = searchSchema.parse({ term: searchTerm, limit });
    return query(
        `SELECT bancho_id, username, avatar_url, created_at
         FROM users
         WHERE username LIKE ?
         ORDER BY username
         LIMIT ?`,
        [`%${validated.term}%`, validated.limit],
    );
}

export async function getHighestStatsAction(variant: GameVariant = "classic"): Promise<HighestStats> {
    const result = await query(
        `SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            COUNT(*) as total_games,
            CASE
                WHEN ? = 'classic' THEN COALESCE(MAX(points), 0)
                ELSE COALESCE(MAX(streak), 0)
            END as highest_score
         FROM games
         WHERE variant = ?`,
        [variant, variant],
    );

    return {
        total_users: Number(result[0].total_users),
        total_games: Number(result[0].total_games),
        highest_points: variant === "classic" ? Number(result[0].highest_score) : Number(result[0].highest_score), // This is actually highest streak for death mode
    };
}
