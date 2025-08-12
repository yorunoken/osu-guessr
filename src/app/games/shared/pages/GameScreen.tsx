"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { GameClient } from "@/lib/game/GameClient";
import { GameState, GameMode } from "@/actions/types";

import { AUTO_ADVANCE_DELAY_MS, GameVariant } from "../../config";
import GameStats from "../components/GameStats";
import GuessInput from "../components/GuessInput";
import LoadingScreen from "../components/LoadingScreen";
import GameHeader from "../components/Header";
import { ReportDialog } from "@/components/ReportDialog";
import { AdSlider } from "@/components/Ads";
import { useTranslationsContext } from "@/context/translations-provider";

interface GameScreenProps {
    onExit(): void;
    gameVariant: GameVariant;
    gameMode: GameMode;
    GameMedia: React.ComponentType<{
        mediaUrl: string;
        isRevealed: boolean;
        result?: {
            correct: boolean;
            answer?: string;
            type: "guess" | "timeout" | "skip";
        };
        songInfo?: {
            title?: string;
            artist?: string;
            mapper?: string;
            mapsetId?: number;
        };
        onVolumeChange?(volume: number): void;
        initialVolume?: number;
    }>;
}

export default function GameScreen({ onExit, gameVariant, gameMode, GameMedia }: GameScreenProps) {
    const { t } = useTranslationsContext();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [guess, setGuess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState<number>(AUTO_ADVANCE_DELAY_MS / 1000);
    const [showStats, setShowStats] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    const gameClient = useRef<GameClient | null>(null);

    const handleStartGame = useCallback(async () => {
        try {
            setIsLoading(true);
            setShowStats(false);
            setGuess("");

            gameClient.current = new GameClient(
                {
                    onStateUpdate: setGameState,
                    onError: (error) => {
                        console.error("Game error:", error);
                        // You could show a toast notification here
                    },
                    onRetry: (attempt, maxRetries) => {
                        console.log(`Retrying... (${attempt}/${maxRetries})`);
                        // You could show a retry indicator here
                    },
                    onRecovery: () => {
                        console.log("Game state recovered");
                        // You could show a recovery notification here
                    },
                },
                gameMode,
                gameVariant,
                {
                    maxRetries: 3,
                    retryDelay: 1000,
                    sessionTimeout: 300000,
                    recoveryMode: "auto",
                }
            );

            await gameClient.current.startGame();
            setCountdown(AUTO_ADVANCE_DELAY_MS / 1000);
        } catch (error) {
            console.error("Failed to restart game:", error);
        } finally {
            setIsLoading(false);
        }
    }, [gameMode, gameVariant]);

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
            } catch (error) {
                console.error("Action failed:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading]
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

        return handleAction(async () => {
            await gameClient.current!.skipAnswer();
        });
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

        if (gameVariant === "classic") {
            const isGameIncomplete = gameState.rounds.current < gameState.rounds.total;

            if (isGameIncomplete) {
                const confirmed = window.confirm("Are you sure you want to exit? Your score will not be counted if you leave before completing all rounds!");
                if (!confirmed) return false;
            } else if (gameState.score.total > 0) {
                const confirmed = window.confirm("Are you sure you want to exit? Your score will be saved.");
                if (!confirmed) return false;
            }

            try {
                await gameClient.current.endGame();
                onExit();
                return true;
            } catch (error) {
                console.error("Failed to end game:", error);
                return false;
            }
        } else {
            const confirmed = window.confirm("Are you sure you want to end your run? Your highest streak will be saved.");
            if (!confirmed) return false;

            try {
                await gameClient.current.endGame();
                setShowStats(true);
                return true;
            } catch (error) {
                console.error("Failed to end game:", error);
                return false;
            }
        }
    }, [gameState, onExit, gameVariant]);

    useEffect(() => {
        if (!gameClient.current || !gameState) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameVariant === "classic" && gameState?.rounds.current < gameState.rounds.total) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [gameState, gameVariant]);

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
        if (gameState?.currentBeatmap.revealed && !isReportDialogOpen) {
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
    }, [gameState?.currentBeatmap.revealed, handleNextRound, isReportDialogOpen]);

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
                gameVariant={gameVariant}
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
                mode={gameMode === "audio" ? "Audio" : "Background"}
                gameVariant={gameVariant}
                maxStreak={gameState.score.highestStreak}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                    <GameMedia
                        mediaUrl={gameMode === "audio" ? gameState.currentBeatmap.audioUrl! : gameState.currentBeatmap.imageUrl!}
                        isRevealed={gameState.currentBeatmap.revealed}
                        result={gameState.lastGuess}
                        songInfo={gameState.currentBeatmap}
                        onVolumeChange={gameMode === "audio" ? (volume) => gameClient.current?.setVolume(volume) : undefined}
                        initialVolume={gameMode === "audio" ? gameClient.current?.getVolume() : undefined}
                    />
                    {isLoading && <LoadingScreen />}
                </div>
                <div className="flex flex-col gap-6">
                    <GuessInput guess={guess} setGuess={setGuess} isRevealed={gameState.currentBeatmap.revealed} onGuess={handleGuess} onSkip={handleSkip} gameClient={gameClient.current!} />

                    <div className="bg-card p-6 rounded-xl border border-border/50">
                        <h3 className="font-semibold mb-2">{t.game.shortcuts.title}</h3>
                        <ul className="list-disc list-inside space-y-1 text-foreground/70">
                            <li>{t.game.shortcuts.items.tab}</li>
                            <li>{t.game.shortcuts.items.enter}</li>
                            <li>{t.game.shortcuts.items.ctrlS}</li>
                            <li>{t.game.shortcuts.items.arrows}</li>
                            <li>{t.game.shortcuts.items.esc}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExit} disabled={isLoading}>
                        {gameVariant === "death" ? t.game.actions.endRun : t.game.actions.exitGame}
                    </Button>
                    {gameState.currentBeatmap.revealed && gameState.currentBeatmap.mapsetId && (
                        <ReportDialog mapsetId={gameState.currentBeatmap.mapsetId} mapsetTitle={gameState.currentBeatmap.title || "Unknown"} onOpenChange={setIsReportDialogOpen} />
                    )}
                </div>
                {gameState.currentBeatmap.revealed && (
                    <Button onClick={handleNextRound} className="px-8">
                        {gameState.rounds.current >= gameState.rounds.total
                            ? t.game.actions.viewResults
                            : isReportDialogOpen
                            ? t.game.actions.nextRound
                            : t.game.actions.nextRoundTime.replace("{seconds}", countdown.toString())}
                    </Button>
                )}
            </div>

            <AdSlider />
        </div>
    );
}
