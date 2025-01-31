"use server";

import { query } from "@/lib/database";
import { z } from "zod";
import { authenticatedAction } from "./server";

export interface User {
    bancho_id: number;
    username: string;
    avatar_url: string;
    created_at: Date;
}

export interface UserAchievement {
    user_id: number;
    game_mode: GameMode;
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
    ended_at: Date;
}

export interface TopPlayer {
    username: string;
    avatar_url: string;
    bancho_id: number;
    total_score: number;
    games_played: number;
    highest_streak: number;
    highest_score: number;
}

export interface HighestStats {
    highest_points: number;
    total_games: number;
    total_users: number;
}

type GameMode = "background" | "audio" | "skin";

// Schemas
const gameModeSchema = z.enum(["background", "audio", "skin"]);
const searchSchema = z.object({
    term: z.string().min(2).max(250),
    limit: z.number().min(1).max(100).default(10),
});

// Server actions
export async function createUserAction(banchoId: number, username: string, avatar_url: string) {
    return query(
        `INSERT INTO users (bancho_id, username, avatar_url)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            avatar_url = VALUES(avatar_url)`,
        [banchoId, username, avatar_url],
    );
}

export async function deleteUserAction(banchoId: number) {
    return authenticatedAction(async () => {
        await query("DELETE FROM users WHERE bancho_id = ?", [banchoId]);
        return { success: true };
    });
}

export async function getUserByIdAction(banchoId: number): Promise<UserWithStats | null> {
    const userResult = await query(
        `SELECT bancho_id, username, avatar_url, created_at
         FROM users
         WHERE bancho_id = ?`,
        [banchoId],
    );

    if (!userResult[0]) return null;
    const user = userResult[0];

    const achievements = await query(
        `SELECT user_id, game_mode, total_score, games_played,
                highest_streak, highest_score, last_played
         FROM user_achievements
         WHERE user_id = ?`,
        [banchoId],
    );

    const globalRankResult = await query(
        `SELECT
            COUNT(*) as globalRank
         FROM user_achievements ua1
         JOIN users u ON u.bancho_id = ua1.user_id
         WHERE ua1.total_score > (
             SELECT COALESCE(SUM(total_score), 0)
             FROM user_achievements ua2
             WHERE ua2.user_id = ?
         )`,
        [banchoId],
    );

    const modeRanks: { [key in GameMode]: { globalRank?: number } } = {
        background: {},
        audio: {},
        skin: {},
    };

    for (const mode of Object.keys(modeRanks) as GameMode[]) {
        const modeGlobalRank = await query(
            `SELECT COUNT(*) as rank
             FROM user_achievements ua1
             WHERE ua1.game_mode = ?
             AND ua1.total_score > (
                 SELECT COALESCE(total_score, 0)
                 FROM user_achievements ua2
                 WHERE ua2.user_id = ?
                 AND ua2.game_mode = ?
             )`,
            [mode, banchoId, mode],
        );

        modeRanks[mode] = {
            globalRank: modeGlobalRank[0].rank + 1,
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

export async function getUserLatestGamesAction(banchoId: number, gameMode?: GameMode): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, ended_at
           FROM games
           WHERE user_id = ? AND game_mode = ?
           ORDER BY ended_at DESC`
        : `SELECT user_id, game_mode, points, streak, ended_at
           FROM games
           WHERE user_id = ?
           ORDER BY ended_at DESC`;

    const params = validatedMode ? [banchoId, validatedMode] : [banchoId];
    return query(query_string, params);
}

export async function getUserTopGamesAction(banchoId: number, gameMode?: GameMode): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, ended_at
           FROM games
           WHERE user_id = ? AND game_mode = ?
           ORDER BY points DESC`
        : `SELECT user_id, game_mode, points, streak, ended_at
           FROM games
           WHERE user_id = ?
           ORDER BY points DESC`;

    const params = validatedMode ? [banchoId, validatedMode] : [banchoId];
    return query(query_string, params);
}

export async function getTopPlayersAction(gamemode: GameMode, limit: number = 10): Promise<Array<TopPlayer>> {
    const validatedMode = gameModeSchema.parse(gamemode);
    return query(
        `SELECT u.username, u.avatar_url, u.bancho_id,
                ua.total_score, ua.games_played, ua.highest_streak, ua.highest_score
         FROM user_achievements ua
         JOIN users u ON ua.user_id = u.bancho_id
         WHERE ua.game_mode = ?
         ORDER BY ua.total_score DESC
         LIMIT ?`,
        [validatedMode, limit],
    );
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

export async function getHighestStatsAction(): Promise<HighestStats> {
    const result = await query(
        `SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM games) as total_games,
            COALESCE(MAX(points), 0) as highest_score
         FROM games`,
        [],
    );

    return {
        total_users: Number(result[0].total_users),
        total_games: Number(result[0].total_games),
        highest_points: Number(result[0].highest_score),
    };
}
