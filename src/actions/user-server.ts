"use server";

import { query } from "@/lib/database";
import { z } from "zod";
import { authenticatedAction } from "./server";

// Types
export interface OsuPlayer {
    user_id: string;
    username: string;
    join_date: string;
    count300: string;
    count100: string;
    count50: string;
    playcount: string;
    ranked_score: string;
    total_score: string;
    pp_rank: string;
    level: string;
    pp_raw: string;
    accuracy: string;
    count_rank_ss: string;
    count_rank_ssh: string;
    count_rank_s: string;
    count_rank_sh: string;
    count_rank_a: string;
    country: string;
    total_seconds_played: string;
    pp_country_rank: string;
    events: [];
}

interface User {
    bancho_id: number;
    username: string;
    avatar_url: string;
    created_at: Date;
}

interface UserAchievement {
    game_mode: GameMode;
    total_score: number;
    games_played: number;
    highest_streak: number;
    last_played: Date;
}

export interface UserStats extends User, UserAchievement {}

export interface TopPlayer {
    username: string;
    avatar_url: string;
    bancho_id: number;
    total_score: number;
    games_played: number;
    highest_streak: number;
}

export interface Game {
    user_id: number;
    game_mode: GameMode;
    points: number;
    streak: number;
    played: Date;
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
const scoreSchema = z.object({
    gameMode: gameModeSchema,
    totalPoints: z.number().min(0),
    finalStreak: z.number().min(0),
});

// Public server actions
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

export async function getUserByIdAction(banchoId: number): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE bancho_id = ?", [banchoId]);
    return result[0];
}

export async function getOsuUserByIdAction(banchoId: number): Promise<OsuPlayer | null> {
    const res = await fetch(`https://osu.ppy.sh/api/get_user?k=${process.env.OSU_API_KEY}&u=${banchoId}&type="user_id"`);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0];
}

export async function getUserStatsAction(banchoId: number): Promise<Array<UserStats>> {
    const result = await query(
        `SELECT
                u.bancho_id, u.username, u.avatar_url, u.created_at,
                ua.game_mode, ua.total_score, ua.games_played,
                ua.highest_streak, ua.last_played
             FROM users u
             LEFT JOIN user_achievements ua ON u.bancho_id = ua.user_id
             WHERE u.bancho_id = ?`,
        [banchoId],
    );
    return result;
}

export async function getUserLatestGamesAction(banchoId: number, gameMode?: string): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, played
               FROM games
               WHERE user_id = ? AND game_mode = ?
               ORDER BY played DESC`
        : `SELECT user_id, game_mode, points, streak, played
               FROM games
               WHERE user_id = ?
               ORDER BY played DESC`;

    const params = validatedMode ? [banchoId, validatedMode] : [banchoId];
    const result = await query(query_string, params);
    return result;
}

export async function getUserTopGamesAction(banchoId: number, gameMode?: string): Promise<Array<Game>> {
    const validatedMode = gameMode ? gameModeSchema.parse(gameMode) : undefined;

    const query_string = validatedMode
        ? `SELECT user_id, game_mode, points, streak, played
               FROM games
               WHERE user_id = ? AND game_mode = ?
               ORDER BY points DESC`
        : `SELECT user_id, game_mode, points, streak, played
               FROM games
               WHERE user_id = ?
               ORDER BY points DESC`;

    const params = validatedMode ? [banchoId, validatedMode] : [banchoId];
    const result = await query(query_string, params);
    return result;
}

export async function getTopPlayersAction(gamemode: string, limit: number = 10): Promise<Array<TopPlayer>> {
    const validatedMode = gameModeSchema.parse(gamemode);
    const result = await query(
        `SELECT
                u.username, u.avatar_url, u.bancho_id,
                ua.total_score, ua.games_played, ua.highest_streak
            FROM user_achievements ua
                JOIN users u ON ua.user_id = u.bancho_id
            WHERE ua.game_mode = ?
                ORDER BY ua.total_score DESC
            LIMIT ?`,
        [validatedMode, limit],
    );
    return result;
}

export async function updateFinalScoreAction(gameMode: string, totalPoints: number, finalStreak: number) {
    return authenticatedAction(async (session) => {
        const banchoId = session.user.banchoId;

        const validated = scoreSchema.parse({
            gameMode,
            totalPoints,
            finalStreak,
        });

        // Insert game record
        await query(
            `INSERT INTO games (user_id, game_mode, points, streak)
                VALUES (?, ?, ?, ?)`,
            [banchoId, validated.gameMode, validated.totalPoints, validated.finalStreak],
        );

        // Update achievements
        await query(
            `INSERT INTO user_achievements
                (user_id, game_mode, total_score, games_played)
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                total_score = total_score + VALUES(total_score),
                games_played = games_played + 1,
                highest_streak = GREATEST(highest_streak, ?),
                last_played = CURRENT_TIMESTAMP`,
            [banchoId, validated.gameMode, validated.totalPoints, validated.finalStreak],
        );

        // Update streak
        await query(
            `UPDATE user_achievements
            SET highest_streak = GREATEST(highest_streak, ?)
            WHERE user_id = ? AND game_mode = ?`,
            [validated.finalStreak, banchoId, validated.gameMode],
        );

        return { success: true };
    });
}

export async function searchUsersAction(searchTerm: string, limit: number = 10): Promise<Array<User>> {
    const validated = searchSchema.parse({
        term: searchTerm,
        limit,
    });

    const result = await query(
        `SELECT bancho_id, username, avatar_url
            FROM users WHERE username LIKE ?
        ORDER BY username
            LIMIT ?`,
        [`%${validated.term}%`, validated.limit],
    );
    return result;
}

export async function getHighestStatsAction(): Promise<HighestStats> {
    const result = await query(
        `SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM games) as total_games,
            MAX(points) as highest_score
        FROM games`,
        [],
    );

    return {
        total_users: Number(result[0].total_users),
        total_games: Number(result[0].total_games),
        highest_points: Number(result[0].highest_score),
    };
}
