"use server";

import { getAuthSession } from "./server";
import { query } from "@/lib/database";
import { z } from "zod";
import { BASE_POINTS, STREAK_BONUS, TIME_BONUS_MULTIPLIER, MAX_ROUNDS, ROUND_TIME, GameVariant } from "../app/games/config";
import { getRandomAudioAction, getRandomBackgroundAction } from "./mapsets-server";
import type { MapsetDataWithTags, GameState } from "./types";
import path from "path";
import fs from "fs/promises";
import { checkGuess, GuessDifficulty } from "@/lib/guess-checker";

const GRACE_PERIOD = 1;

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

const activeSessions = new Map<string, boolean>();

async function acquireSessionLock(sessionId: string, timeoutMs: number = 5000): Promise<boolean> {
    if (activeSessions.get(sessionId)) {
        return false;
    }

    activeSessions.set(sessionId, true);

    setTimeout(() => {
        activeSessions.delete(sessionId);
    }, timeoutMs);

    return true;
}

async function validateGameSession(sessionId: string, userId: number) {
    const [session] = await query(
        `SELECT g.*, m.title, m.artist, m.mapper, mt.image_filename, mt.audio_filename,
            CASE
                WHEN g.current_round = 1 AND g.last_guess IS NULL THEN FALSE
                WHEN g.last_guess IS NOT NULL
                    AND g.current_beatmap_id = (
                        SELECT mapset_id
                        FROM session_mapsets
                        WHERE session_id = g.id
                        ORDER BY round_number DESC
                        LIMIT 1
                    ) THEN TRUE
                ELSE FALSE
            END as has_guessed_current_round
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

export async function startGameAction(gameMode: "audio" | "background", variant: GameVariant = "classic"): Promise<GameState> {
    const authSession = await getAuthSession();
    const sessionId = crypto.randomUUID();

    try {
        await query(
            `INSERT INTO game_sessions
                (id, user_id, game_mode, total_points, current_streak, highest_streak, variant)
                VALUES (?, ?, ?, 0, 0, 0, ?)`,
            [sessionId, authSession.user.banchoId, gameMode, variant],
        );

        const beatmap = gameMode === "audio" ? await getRandomAudioAction(sessionId) : await getRandomBackgroundAction(sessionId);

        await query(
            `UPDATE game_sessions
            SET current_beatmap_id = ?,
                time_left = ?,
                last_action_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [beatmap.data.mapset_id, ROUND_TIME, sessionId],
        );

        await query(
            `INSERT INTO session_mapsets (session_id, mapset_id, round_number)
                VALUES (?, ?, 1)`,
            [sessionId, beatmap.data.mapset_id],
        );

        await query("COMMIT");

        const currentBeatmap =
            gameMode === "audio"
                ? { audioUrl: "audioData" in beatmap ? beatmap.audioData : undefined, revealed: false }
                : { imageUrl: "backgroundData" in beatmap ? beatmap.backgroundData : undefined, revealed: false };

        return {
            sessionId,
            currentBeatmap,
            score: {
                total: 0,
                current: 0,
                streak: 0,
                highestStreak: 0,
            },
            rounds: {
                current: 1,
                total: MAX_ROUNDS,
                correctGuesses: 0,
                totalTimeUsed: 0,
            },
            timeLeft: ROUND_TIME,
            gameStatus: "active",
            variant,
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function submitGuessAction(sessionId: string, guess?: string | null): Promise<GameState> {
    const authSession = await getAuthSession();
    const validated = gameSchema.parse({ sessionId, guess });

    if (!(await acquireSessionLock(validated.sessionId))) {
        throw new Error("Action in progress, please wait");
    }

    try {
        await query("START TRANSACTION");

        const gameState = await validateGameSession(validated.sessionId, authSession.user.banchoId);

        if (guess !== undefined && gameState.has_guessed_current_round) {
            throw new Error("Already submitted a guess for this round");
        }

        const isDeathMode = gameState.variant === "death";

        if (!isDeathMode && gameState.current_round > MAX_ROUNDS) {
            throw new Error("Game is complete");
        }

        const timeElapsed = Math.floor((Date.now() - new Date(gameState.last_action_at).getTime()) / 1000);
        const timeLeft = Math.max(0, gameState.time_left - timeElapsed + GRACE_PERIOD);

        const guessingDifficulty: GuessDifficulty = 0.5;
        let isSkipped = guess === null;
        const isNextRound = guess === undefined;
        const isTimeout = guess === "";
        let effectiveGuess = isSkipped ? "" : guess;
        const isGuess = !isNextRound && !isTimeout;

        if (timeLeft <= -GRACE_PERIOD && !isSkipped) {
            isSkipped = true;
            effectiveGuess = "";
        }

        const [beatmap]: Array<MapsetDataWithTags> = await query(`SELECT * FROM mapset_data WHERE mapset_id = ?`, [gameState.current_beatmap_id]);

        const currentMedia: { backgroundData?: string; audioData?: string } = {};
        if (gameState.game_mode === "background") {
            const imagePath = path.join(process.cwd(), "mapsets", "backgrounds", gameState.image_filename);
            const imageBuffer = await fs.readFile(imagePath);
            currentMedia.backgroundData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
        } else {
            const audioPath = path.join(process.cwd(), "mapsets", "audio", gameState.audio_filename);
            const audioBuffer = await fs.readFile(audioPath);
            currentMedia.audioData = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;
        }

        const isCorrect = isGuess ? checkGuess(effectiveGuess || "", beatmap.title, guessingDifficulty) : false;
        const points = isNextRound ? 0 : calculateScore(isCorrect, timeLeft, gameState.current_streak);

        if (isDeathMode && (isSkipped || (!isCorrect && isGuess))) {
            await endGameAction(sessionId);
            return {
                sessionId,
                currentBeatmap: {
                    imageUrl: gameState.game_mode === "background" ? currentMedia.backgroundData : undefined,
                    audioUrl: gameState.game_mode === "audio" ? currentMedia.audioData : undefined,
                    revealed: true,
                    title: beatmap.title,
                    artist: beatmap.artist,
                    mapper: beatmap.mapper,
                    mapsetId: beatmap.mapset_id,
                },
                score: {
                    total: gameState.total_points,
                    current: 0,
                    streak: 0,
                    highestStreak: gameState.highest_streak,
                },
                rounds: {
                    current: gameState.current_round,
                    total: gameState.current_round,
                    correctGuesses: gameState.correct_guesses,
                    totalTimeUsed: gameState.total_time_used,
                },
                timeLeft: 0,
                gameStatus: "finished",
                variant: "death",
                lastGuess: !isNextRound
                    ? {
                          correct: isCorrect,
                          answer: beatmap.title,
                          type: isTimeout ? "timeout" : isSkipped ? "skip" : "guess",
                      }
                    : undefined,
            };
        }

        let nextBeatmap: { data: MapsetDataWithTags; backgroundData?: string; audioData?: string } | null = null;

        if (isNextRound) {
            if (gameState.game_mode === "audio") {
                const audio = await getRandomAudioAction(validated.sessionId);
                nextBeatmap = { data: audio.data, audioData: audio.audioData };
            } else {
                const background = await getRandomBackgroundAction(validated.sessionId);
                nextBeatmap = { data: background.data, backgroundData: background.backgroundData };
            }
        }

        const newStreak = isNextRound ? gameState.current_streak : isCorrect ? gameState.current_streak + 1 : 0;

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
                last_points = ?,
                current_round = current_round + ?,
                correct_guesses = correct_guesses + ?,
                total_time_used = total_time_used + ?
            WHERE id = ?`,
            [
                points,
                newStreak,
                isCorrect ? gameState.current_streak + 1 : gameState.highest_streak,
                nextBeatmap ? nextBeatmap.data.mapset_id : gameState.current_beatmap_id,
                nextBeatmap ? ROUND_TIME : gameState.time_left,
                isTimeout ? "TIMEOUT" : isSkipped ? "SKIPPED" : effectiveGuess,
                isCorrect,
                points,
                isNextRound ? 1 : 0,
                isCorrect ? 1 : 0,
                isNextRound ? ROUND_TIME - timeLeft : 0,
                sessionId,
            ],
        );

        if (isNextRound && nextBeatmap) {
            await query(
                `INSERT INTO session_mapsets (session_id, mapset_id, round_number)
                    VALUES (?, ?, ?)`,
                [sessionId, nextBeatmap.data.mapset_id, gameState.current_round + 1],
            );
        }

        await query("COMMIT");

        return {
            sessionId,
            currentBeatmap: {
                imageUrl: gameState.game_mode === "background" ? (nextBeatmap?.backgroundData ?? currentMedia.backgroundData) : undefined,
                audioUrl: gameState.game_mode === "audio" ? (nextBeatmap?.audioData ?? currentMedia.audioData) : undefined,
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
            rounds: {
                current: gameState.current_round + (isNextRound ? 1 : 0),
                total: gameState.variant === "classic" ? MAX_ROUNDS : Infinity,
                correctGuesses: gameState.correct_guesses + (isCorrect ? 1 : 0),
                totalTimeUsed: gameState.total_time_used + (isNextRound ? ROUND_TIME - timeLeft : 0),
            },
            timeLeft: nextBeatmap ? ROUND_TIME : gameState.time_left,
            gameStatus: "active",
            variant: gameState.variant as GameVariant,
            lastGuess: !isNextRound
                ? {
                      correct: isCorrect,
                      answer: beatmap.title,
                      type: isTimeout ? "timeout" : isSkipped ? "skip" : "guess",
                  }
                : undefined,
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    } finally {
        activeSessions.delete(validated.sessionId);
    }
}

export async function getGameStateAction(sessionId: string): Promise<GameState> {
    const authSession = await getAuthSession();

    try {
        await query("START TRANSACTION");

        const [gameState] = await query(
            `SELECT g.*, m.title, m.artist, m.mapper, m.mapset_id, mt.image_filename, mt.audio_filename
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

        let mediaData: string | undefined;

        if (gameState.game_mode === "background") {
            const imagePath = path.join(process.cwd(), "mapsets", "backgrounds", gameState.image_filename);
            const imageBuffer = await fs.readFile(imagePath);
            mediaData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
        } else {
            const audioPath = path.join(process.cwd(), "mapsets", "audio", gameState.audio_filename);
            const audioBuffer = await fs.readFile(audioPath);
            mediaData = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;
        }

        return {
            sessionId,
            currentBeatmap: {
                imageUrl: gameState.game_mode === "background" ? mediaData : undefined,
                audioUrl: gameState.game_mode === "audio" ? mediaData : undefined,
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
            rounds: {
                current: gameState.current_round,
                total: gameState.variant === "classic" ? MAX_ROUNDS : Infinity,
                correctGuesses: gameState.correct_guesses,
                totalTimeUsed: gameState.total_time_used,
            },
            timeLeft,
            gameStatus: gameState.is_active ? "active" : "finished",
            variant: gameState.variant as GameVariant,
            lastGuess: gameState.last_guess
                ? {
                      correct: gameState.last_guess_correct === 1,
                      answer: gameState.title,
                      type: gameState.last_guess === "TIMEOUT" ? "timeout" : gameState.last_guess === "SKIPPED" ? "skip" : "guess",
                  }
                : undefined,
        };
    } catch (error) {
        await query("ROLLBACK");
        throw error;
    }
}

export async function endGameAction(sessionId: string): Promise<void> {
    console.log("Ending game for:", sessionId);
    const authSession = await getAuthSession();

    try {
        await query("START TRANSACTION");

        const [gameState] = await query(
            `SELECT * FROM game_sessions
                WHERE id = ? AND user_id = ?
                FOR UPDATE`,
            [sessionId, authSession.user.banchoId],
        );

        if (!gameState) {
            throw new Error("Game session not found");
        }

        await deactivateSessionAction(sessionId);

        if (!gameState.is_active) {
            await query("COMMIT");
            return;
        }

        if (gameState.variant === "classic" && gameState.current_round < MAX_ROUNDS) {
            await deactivateSessionAction(sessionId);
            return;
        }

        const points = gameState.variant === "death" ? 0 : gameState.total_points;

        await query(
            `INSERT INTO games (user_id, game_mode, points, streak, variant)
                VALUES (?, ?, ?, ?, ?)`,
            [authSession.user.banchoId, gameState.game_mode, points, gameState.highest_streak, gameState.variant],
        );

        if (gameState.variant === "classic") {
            await query(
                `INSERT INTO user_achievements
                 (user_id, game_mode, total_score, games_played, highest_streak, highest_score)
                 VALUES (?, ?, ?, 1, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   total_score = total_score + VALUES(total_score),
                   games_played = games_played + 1,
                   highest_streak = GREATEST(highest_streak, VALUES(highest_streak)),
                   highest_score = GREATEST(highest_score, VALUES(highest_score)),
                   last_played = CURRENT_TIMESTAMP`,
                [authSession.user.banchoId, gameState.game_mode, points, gameState.highest_streak, points],
            );
        } else {
            await query(
                `INSERT INTO user_achievements
                 (user_id, game_mode, total_score, games_played, highest_streak, highest_score)
                 VALUES (?, ?, 0, 1, ?, 0)
                 ON DUPLICATE KEY UPDATE
                   games_played = games_played + 1,
                   highest_streak = GREATEST(highest_streak, VALUES(highest_streak)),
                   last_played = CURRENT_TIMESTAMP`,
                [authSession.user.banchoId, gameState.game_mode, gameState.highest_streak],
            );
        }

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

function calculateScore(isCorrect: boolean, timeLeft: number, streak: number): number {
    // Ensure all values are numbers and valid
    timeLeft = Number(timeLeft) || 0;
    streak = Number(streak) || 0;

    if (!isCorrect) return -50;
    return BASE_POINTS + timeLeft * TIME_BONUS_MULTIPLIER + streak * STREAK_BONUS;
}
