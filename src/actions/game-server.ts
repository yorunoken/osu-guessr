"use server";

import { getAuthSession } from "./server";
import { query } from "@/lib/database";
import { z } from "zod";
import { BASE_POINTS, SIMILARITY_THRESHOLD, STREAK_BONUS, TIME_BONUS_MULTIPLIER } from "../app/games/config";
import FuzzySet from "fuzzyset.js";
import { getRandomBackgroundAction, MapsetDataWithTags } from "./mapsets-server";
import path from "path";
import fs from "fs/promises";

const gameSchema = z.object({
    sessionId: z.string().uuid(),
    guess: z
        .string()
        .optional()
        .nullable()
        .transform((g) => g?.trim()),
});

// const rateLimits = new Map<string, number>();
// const RATE_LIMIT_WINDOW = 1000;

export interface GameState {
    sessionId: string;
    currentBeatmap: {
        imageUrl: string;
        revealed: boolean;
        title?: string;
        artist?: string;
        mapper?: string;
        mapsetId?: number;
    };
    score: {
        total: number;
        current: number;
        streak: number;
        highestStreak: number;
    };
    timeLeft: number;
    gameStatus: "active" | "finished";
    lastGuess?: {
        correct: boolean;
        answer?: string;
    };
}

async function checkRateLimit(userId: number) {
    console.log(userId);
}

async function validateGameSession(sessionId: string, userId: number) {
    const [session] = await query(
        `SELECT g.*, m.title, m.artist, m.mapper, mt.image_filename
            FROM game_sessions g
            JOIN mapset_data m ON g.current_beatmap_id = m.mapset_id
            JOIN mapset_tags mt ON g.current_beatmap_id = mt.mapset_id
            WHERE g.id = ? AND g.user_id = ? AND g.is_active = TRUE
            FOR UPDATE`,
        [sessionId, userId],
    );

    if (!session) {
        throw new Error("Game session not found or expired");
    }

    return session;
}

export async function startGameAction(): Promise<GameState> {
    const authSession = await getAuthSession();
    const sessionId = crypto.randomUUID();

    try {
        await query(
            `INSERT INTO game_sessions
                (id, user_id, game_mode, total_points, current_streak, highest_streak)
                VALUES (?, ?, 'background', 0, 0, 0)`,
            [sessionId, authSession.user.banchoId],
        );

        const beatmap = await getRandomBackgroundAction();

        // Store current beatmap in session
        await query(
            `UPDATE game_sessions
            SET current_beatmap_id = ?,
                time_left = 30,
                last_action_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [beatmap.data.mapset_id, sessionId],
        );

        await query("COMMIT");

        return {
            sessionId,
            currentBeatmap: {
                imageUrl: beatmap.backgroundData,
                revealed: false,
            },
            score: {
                total: 0,
                current: 0,
                streak: 0,
                highestStreak: 0,
            },
            timeLeft: 30,
            gameStatus: "active",
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function submitGuessAction(sessionId: string, guess?: string | null): Promise<GameState> {
    const authSession = await getAuthSession();
    const validated = gameSchema.parse({ sessionId, guess });

    // Check rate limit
    // await checkRateLimit(authSession.user.banchoId);

    try {
        await query("START TRANSACTION");

        const gameState = await validateGameSession(validated.sessionId, authSession.user.banchoId);

        const timeElapsed = Math.floor((Date.now() - new Date(gameState.last_action_at).getTime()) / 1000);
        const timeLeft = Math.max(0, gameState.time_left - timeElapsed);

        if (timeLeft <= 0) {
            throw new Error("Time has expired for this round");
        }

        const [beatmap]: Array<MapsetDataWithTags> = await query(`SELECT * FROM mapset_data WHERE mapset_id = ?`, [gameState.current_beatmap_id]);

        const isSkipped = guess === null;
        const isNextRound = guess === undefined;
        const effectiveGuess = isSkipped ? "" : guess;
        const isGuess = !isNextRound;

        const isCorrect = isGuess ? checkGuess(effectiveGuess || "", beatmap.title) : false;
        const points = isNextRound ? 0 : calculateScore(isCorrect, timeLeft, gameState.current_streak);

        const nextBeatmap = isNextRound ? await getRandomBackgroundAction(gameState.current_beatmap_id) : null;

        const newStreak = isNextRound ? gameState.current_streak : isCorrect ? gameState.current_streak + 1 : 0;

        // Update session atomically
        await query(
            `UPDATE game_sessions
            SET total_points = total_points + ?,
                current_streak = ?,
                highest_streak = GREATEST(highest_streak, ?),
                current_beatmap_id = ?,
                time_left = ?,
                last_action_at = CURRENT_TIMESTAMP,
                last_guess = ?,
                last_guess_correct = ?,
                last_points = ?
            WHERE id = ?`,
            [
                points,
                newStreak,
                isCorrect ? gameState.current_streak + 1 : gameState.highest_streak,
                nextBeatmap ? nextBeatmap.data.mapset_id : gameState.current_beatmap_id,
                nextBeatmap ? 30 : gameState.time_left,
                isSkipped ? "SKIPPED" : effectiveGuess,
                isCorrect,
                points,
                sessionId,
            ],
        );

        await query("COMMIT");

        const imagePath = path.join(process.cwd(), "mapsets", "backgrounds", gameState.image_filename);
        const imageBuffer = await fs.readFile(imagePath);
        const backgroundImageData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

        return {
            sessionId,
            currentBeatmap: {
                imageUrl: nextBeatmap ? nextBeatmap.backgroundData : backgroundImageData,
                revealed: !isNextRound,
                title: !isNextRound ? beatmap.title : undefined,
                artist: !isNextRound ? beatmap.artist : undefined,
                mapper: !isNextRound ? beatmap.mapper : undefined,
                mapsetId: !isNextRound ? beatmap.mapset_id : undefined,
            },
            score: {
                total: gameState.total_points + points,
                current: points,
                streak: newStreak,
                highestStreak: Math.max(gameState.highest_streak, isCorrect ? gameState.current_streak + 1 : gameState.highest_streak),
            },
            timeLeft: nextBeatmap ? 30 : gameState.time_left,
            gameStatus: "active",
            lastGuess: !isNextRound
                ? {
                      correct: isCorrect,
                      answer: beatmap.title,
                  }
                : undefined,
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function getGameStateAction(sessionId: string): Promise<GameState> {
    const authSession = await getAuthSession();
    await checkRateLimit(authSession.user.banchoId);

    try {
        await query("START TRANSACTION");

        const [gameState] = await query(
            `SELECT g.*, m.title, m.artist, m.mapper, m.mapset_id, mt.image_filename
                FROM game_sessions g
                JOIN mapset_data m ON g.current_beatmap_id = m.mapset_id
                JOIN mapset_tags mt ON g.current_beatmap_id = mt.mapset_id
                WHERE g.id = ? AND g.user_id = ?
                FOR UPDATE`,
            [sessionId, authSession.user.banchoId],
        );

        if (!gameState) {
            throw new Error("Game session not found");
        }

        const timeElapsed = Math.floor((Date.now() - new Date(gameState.last_action_at).getTime()) / 1000);
        const timeLeft = Math.max(0, gameState.time_left - timeElapsed);

        if (timeLeft !== gameState.time_left) {
            await query(`UPDATE game_sessions SET time_left = ? WHERE id = ?`, [timeLeft, sessionId]);
        }

        await query("COMMIT");

        const imagePath = path.join(process.cwd(), "mapsets", "backgrounds", gameState.image_filename);
        const imageBuffer = await fs.readFile(imagePath);
        const backgroundImageData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

        return {
            sessionId,
            currentBeatmap: {
                imageUrl: backgroundImageData,
                revealed: Boolean(gameState.last_guess),
                title: gameState.last_guess ? gameState.title : undefined,
                artist: gameState.last_guess ? gameState.artist : undefined,
                mapper: gameState.last_guess ? gameState.mapper : undefined,
                mapsetId: gameState.last_guess ? gameState.mapset_id : undefined,
            },
            score: {
                total: gameState.total_points,
                current: gameState.last_points || 0,
                streak: gameState.current_streak,
                highestStreak: gameState.highest_streak,
            },
            timeLeft,
            gameStatus: gameState.is_active ? "active" : "finished",
            lastGuess: gameState.last_guess
                ? {
                      correct: gameState.last_guess_correct === 1,
                      answer: gameState.title,
                  }
                : undefined,
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function endGameAction(sessionId: string): Promise<void> {
    const authSession = await getAuthSession();
    await checkRateLimit(authSession.user.banchoId);

    try {
        await query("START TRANSACTION");

        const [gameState] = await query(
            `SELECT * FROM game_sessions
                WHERE id = ? AND user_id = ? AND is_active = TRUE
                FOR UPDATE`,
            [sessionId, authSession.user.banchoId],
        );

        if (!gameState) {
            throw new Error("Game session not found or already ended");
        }

        await query(
            `INSERT INTO games (user_id, game_mode, points, streak)
                VALUES (?, 'background', ?, ?)`,
            [authSession.user.banchoId, gameState.total_points, gameState.highest_streak],
        );

        await query(
            `INSERT INTO user_achievements
             (user_id, game_mode, total_score, games_played, highest_streak)
             VALUES (?, 'background', ?, 1, ?)
             ON DUPLICATE KEY UPDATE
               total_score = total_score + VALUES(total_score),
               games_played = games_played + 1,
               highest_streak = GREATEST(highest_streak, VALUES(highest_streak)),
               last_played = CURRENT_TIMESTAMP`,
            [authSession.user.banchoId, gameState.total_points, gameState.highest_streak],
        );

        await deactivateSessionAction(sessionId);

        await query("COMMIT");
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function deactivateSessionAction(sessionId: string) {
    await query(
        `UPDATE game_sessions SET is_active = FALSE
            WHERE id = ?`,
        [sessionId],
    );
}

export async function getSuggestionsAction(str: string): Promise<string[]> {
    if (!str || str.length < 2) return [];

    const results: Array<{ title: string }> = await query(
        `SELECT DISTINCT title
            FROM mapset_data
            WHERE title LIKE ?
            LIMIT 5`,
        [`%${str}%`],
    );

    return results.map((r) => r.title);
}

function checkGuess(guess: string, actual: string): boolean {
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, "");

    const normalizedGuess = normalizeString(guess);
    const normalizedActual = normalizeString(actual);

    if (normalizedGuess === normalizedActual) {
        return true;
    }

    if (normalizedGuess.length >= 4) {
        const guessWords = normalizedGuess.split(" ");

        const guessPhrase = guessWords.join(" ");
        if (normalizedActual.includes(guessPhrase)) {
            const mainTitle = normalizedActual.split("(")[0].trim();
            if (guessPhrase.length >= mainTitle.length * 0.3) {
                return true;
            }
        }
    }

    const fuzz = FuzzySet([normalizedActual]);
    const match = fuzz.get(normalizedGuess);

    if (match && match[0]) {
        const [score] = match[0];
        return score >= SIMILARITY_THRESHOLD;
    }

    return false;
}

function calculateScore(isCorrect: boolean, timeLeft: number, streak: number): number {
    // Ensure all values are numbers and valid
    timeLeft = Number(timeLeft) || 0;
    streak = Number(streak) || 0;

    if (!isCorrect) return -50;
    return BASE_POINTS + timeLeft * TIME_BONUS_MULTIPLIER + streak * STREAK_BONUS;
}
