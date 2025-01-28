"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { GameClient } from "@/lib/game/GameClient";
import { GameState } from "@/lib/game/types";

import { ROUND_TIME, AUTO_ADVANCE_DELAY } from "../../config";
import GameHeader from "../components/Header";
import GameImage from "../components/GameImage";
import GuessInput from "../components/GuessInput";
import LoadingScreen from "../components/LoadingScreen";

interface GameScreenProps {
    onExit(): void;
}

export default function GameScreen({ onExit }: GameScreenProps) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [guess, setGuess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState<number>(AUTO_ADVANCE_DELAY / 1000);

    const gameClient = useRef<GameClient | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchGame() {
            setIsLoading(true);
            console.log("Loading game client");

            gameClient.current = new GameClient(setGameState);
            await gameClient.current.startGame();
            console.log("Loaded game client");
            setIsLoading(false);
        }
        fetchGame();

        return () => {
            gameClient.current?.endGame().catch(console.error);
        };
    }, []);

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

    const handleGuess = useCallback(() => {
        if (!gameClient.current || !guess.trim() || gameState?.currentBeatmap.revealed) return;
        return handleAction(() => gameClient.current!.submitGuess(guess));
    }, [guess, gameState?.currentBeatmap.revealed, handleAction]);

    const handleSkip = useCallback(() => {
        if (!gameClient.current || gameState?.currentBeatmap.revealed) return;
        return handleAction(() => gameClient.current!.revealAnswer());
    }, [gameState?.currentBeatmap.revealed, handleAction]);

    const handleNextRound = useCallback(() => {
        if (!gameClient.current || !gameState?.currentBeatmap.revealed) return;
        return handleAction(() => gameClient.current!.goNextRound());
    }, [gameState?.currentBeatmap.revealed, handleAction]);

    const handleExit = useCallback(async () => {
        if (!gameClient.current) return;

        if (gameState?.score.total && gameState.score.total > 0) {
            const confirmed = window.confirm("Are you sure you want to exit? Your score will be saved.");
            if (!confirmed) return;
        }

        try {
            await gameClient.current.endGame();
            onExit();
        } catch (error) {
            console.error("Failed to end game:", error);
        }
    }, [gameState?.score.total, onExit]);

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
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameState?.score.total && gameState.score.total > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [gameState?.score.total]);

    useEffect(() => {
        if (gameState?.currentBeatmap.revealed) {
            setCountdown(AUTO_ADVANCE_DELAY / 1000);

            const countdownInterval = setInterval(() => {
                setCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);

            const advanceTimer = setTimeout(() => {
                handleNextRound();
            }, AUTO_ADVANCE_DELAY);

            return () => {
                clearInterval(countdownInterval);
                clearTimeout(advanceTimer);
            };
        }
    }, [gameState?.currentBeatmap.revealed, handleNextRound]);

    if (!gameState) return <LoadingScreen />;

    return (
        <div className="container mx-auto px-4 py-8">
            <GameHeader streak={gameState.score.streak} points={gameState.score.total} timeLeft={gameState.timeLeft} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                    <GameImage imageUrl={gameState.currentBeatmap.imageUrl} isRevealed={gameState.currentBeatmap.revealed} result={gameState.lastGuess} songInfo={gameState.currentBeatmap} />
                    {isLoading && <LoadingScreen />}
                </div>

                <div className="flex flex-col gap-6">
                    <GuessInput ref={inputRef} guess={guess} setGuess={setGuess} isRevealed={gameState.currentBeatmap.revealed} onGuess={handleGuess} onSkip={handleSkip} />

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
                <Button variant="outline" onClick={handleExit}>
                    {gameState.score.total > 0 ? "Conclude Game" : "Exit Game"}
                </Button>
                {gameState.currentBeatmap.revealed && (
                    <Button onClick={handleNextRound} className="px-8">
                        Next Round ({countdown}s)
                    </Button>
                )}
            </div>
        </div>
    );
}
