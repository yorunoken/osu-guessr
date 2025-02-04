import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GameVariant } from "../../config";

interface GameStatsProps {
    totalPoints: number;
    correctGuesses: number;
    maxStreak: number;
    totalRounds: number;
    averageTime: number;
    onPlayAgain: () => void;
    gameVariant: GameVariant;
    gameEndReason?: "completed" | "died";
}

export default function GameStats({ totalPoints, correctGuesses, maxStreak, totalRounds, averageTime, onPlayAgain, gameVariant, gameEndReason }: GameStatsProps) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    {gameVariant === "classic" ? (
                        <>
                            <h1 className="text-3xl font-bold mb-6">Game Complete!</h1>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                                    <div className="text-sm text-foreground/70">Total Points</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{maxStreak}</div>
                                    <div className="text-sm text-foreground/70">Highest Streak</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{`${correctGuesses}/${totalRounds}`}</div>
                                    <div className="text-sm text-foreground/70">Correct Guesses</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{averageTime.toFixed(1)}s</div>
                                    <div className="text-sm text-foreground/70">Average Time</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className={`text-3xl font-bold mb-6 ${gameEndReason === "died" ? "text-destructive" : "text-primary"}`}>{gameEndReason === "died" ? "Game Over!" : "Amazing Run!"}</h1>

                            <div className="grid grid-cols-1 gap-6 mb-8">
                                <div className="bg-secondary/50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">{maxStreak}</div>
                                    <div className="text-lg text-foreground/70">Maximum Streak</div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-lg grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{correctGuesses}</div>
                                        <div className="text-sm text-foreground/70">Total Correct</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{averageTime.toFixed(1)}s</div>
                                        <div className="text-sm text-foreground/70">Average Time</div>
                                    </div>
                                </div>

                                {gameEndReason === "died" && (
                                    <div className="bg-destructive/10 p-4 rounded-lg text-center">
                                        <p className="text-destructive font-medium">You made two mistakes!</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex gap-4">
                        <Button onClick={onPlayAgain} className="flex-1" variant={gameVariant === "death" ? "destructive" : "default"}>
                            Try Again
                        </Button>
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
