"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { GameClient } from "@/lib/game/GameClient";
import { GameState } from "@/actions/game-server";

import { ROUND_TIME, AUTO_ADVANCE_DELAY_MS } from "../../config";
import GameImage from "../components/GameImage";
import GameStats from "../../shared/components/GameStats";
import GuessInput from "../../shared/components/GuessInput";
import LoadingScreen from "../../shared/components/LoadingScreen";
import GameHeader from "../../shared/components/Header";

interface GameScreenProps {
    onExit(): void;
}

export default function GameScreen({ onExit }: GameScreenProps) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [guess, setGuess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState<number>(AUTO_ADVANCE_DELAY_MS / 1000);
    const [showStats, setShowStats] = useState(false);

    const gameClient = useRef<GameClient | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartGame = useCallback(async () => {
        try {
            setIsLoading(true);
            setShowStats(false);
            setGuess("");

            gameClient.current = new GameClient(setGameState, "background");
            await gameClient.current.startGame();

            setCountdown(AUTO_ADVANCE_DELAY_MS / 1000);
            inputRef.current?.focus();
        } catch (error) {
            console.error("Failed to restart game:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        handleStartGame();

        return () => {
            gameClient.current?.endGame().catch(console.error);
        };
    }, [handleStartGame]);

    const handleAction = useCallback(
        async (action: () => Promise<void>) => {
            if (isLoading) return;

            setIsLoading(true);
            try {
                await action();
                setGuess("");
                inputRef.current?.focus();
            } catch (error) {
                console.error("Action failed:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading],
    );

    const handleGameComplete = useCallback(async () => {
        if (!gameState) return;

        setShowStats(true);
        await gameClient.current?.endGame();
    }, [gameState]);

    const handleGuess = useCallback(() => {
        if (!gameClient.current || !guess.trim() || gameState?.currentBeatmap.revealed) return;
        return handleAction(() => gameClient.current!.submitGuess(guess));
    }, [guess, gameState?.currentBeatmap.revealed, handleAction]);

    const handleSkip = useCallback(() => {
        if (!gameClient.current || gameState?.currentBeatmap.revealed) return;
        return handleAction(() => gameClient.current!.revealAnswer());
    }, [gameState?.currentBeatmap.revealed, handleAction]);

    const handleNextRound = useCallback(async () => {
        if (!gameState?.currentBeatmap.revealed) return;

        if (gameState.rounds.current >= gameState.rounds.total) {
            await handleGameComplete();
            return;
        }

        return handleAction(() => gameClient.current!.goNextRound());
    }, [gameState, handleAction, handleGameComplete]);

    const handleExit = useCallback(async (): Promise<boolean> => {
        if (!gameClient.current || !gameState) return false;

        const isGameIncomplete = gameState.rounds.current < gameState.rounds.total;

        if (isGameIncomplete) {
            const confirmed = window.confirm("Are you sure you want to exit? Your score will not be counted if you leave before completing all rounds!");
            if (!confirmed) return false;
        }

        try {
            if (isGameIncomplete) {
                await gameClient.current.cleanUpSession();
            } else {
                await gameClient.current.endGame();
            }
            onExit();
            return true;
        } catch (error) {
            console.error("Failed to end game:", error);
            return false;
        }
    }, [gameState, onExit]);

    // Prevent game from closing when user tries to close the tab
    useEffect(() => {
        if (!gameClient.current || !gameState) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameState?.rounds.current < gameState.rounds.total) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [gameState, handleExit]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" && gameState?.currentBeatmap.revealed) {
                handleNextRound();
            }
        };

        window.addEventListener("keypress", handleKeyPress);
        return () => window.removeEventListener("keypress", handleKeyPress);
    }, [gameState?.currentBeatmap.revealed, handleNextRound]);

    useEffect(() => {
        if (gameState?.currentBeatmap.revealed) {
            setCountdown(AUTO_ADVANCE_DELAY_MS / 1000);

            const countdownInterval = setInterval(() => {
                setCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);

            const advanceTimer = setTimeout(() => {
                handleNextRound();
            }, AUTO_ADVANCE_DELAY_MS);

            return () => {
                clearInterval(countdownInterval);
                clearTimeout(advanceTimer);
            };
        }
    }, [gameState?.currentBeatmap.revealed, handleNextRound]);

    if (!gameState) return <LoadingScreen />;

    if (showStats && gameState) {
        return (
            <GameStats
                totalPoints={gameState.score.total}
                correctGuesses={gameState.rounds.correctGuesses}
                maxStreak={gameState.score.highestStreak}
                totalRounds={gameState.rounds.total}
                averageTime={gameState.rounds.totalTimeUsed / gameState.rounds.current}
                onPlayAgain={handleStartGame}
            />
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <GameHeader
                streak={gameState.score.streak}
                points={gameState.score.total}
                timeLeft={gameState.timeLeft}
                currentRound={gameState.rounds.current}
                totalRounds={gameState.rounds.total}
                mode="Background"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                    <GameImage imageUrl={gameState.currentBeatmap.imageUrl!} isRevealed={gameState.currentBeatmap.revealed} result={gameState.lastGuess} songInfo={gameState.currentBeatmap} />
                    {isLoading && <LoadingScreen />}
                </div>

                <div className="flex flex-col gap-6">
                    <GuessInput ref={inputRef} guess={guess} setGuess={setGuess} isRevealed={gameState.currentBeatmap.revealed} onGuess={handleGuess} onSkip={handleSkip} gameClient={gameClient.current!} />

                    <div className="bg-card p-6 rounded-xl border border-border/50">
                        <h3 className="font-semibold mb-2">How to play:</h3>
                        <ul className="list-disc list-inside space-y-1 text-foreground/70">
                            <li>Look at the beatmap background image</li>
                            <li>Try to guess the song title</li>
                            <li>You have {ROUND_TIME} seconds per round</li>
                            <li>Maintain your streak for bonus points!</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleExit} disabled={isLoading || gameState.rounds.current > gameState.rounds.total}>
                    Exit Game
                </Button>
                {gameState.currentBeatmap.revealed && (
                    <Button onClick={handleNextRound} className="px-8">
                        {gameState.rounds.current >= gameState.rounds.total ? "View Results" : `Next Round (${countdown}s)`}
                    </Button>
                )}
            </div>
        </div>
    );
}
