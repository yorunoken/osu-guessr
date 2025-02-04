"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ROUND_TIME, BASE_POINTS, SKIP_PENALTY, STREAK_BONUS, TIME_BONUS_MULTIPLIER, MAX_ROUNDS, GameVariant } from "../../config";

interface PreGameMenuProps {
    onStart(variant: GameVariant): void;
    gameType: "audio" | "background";
}

export default function PreGameMenu({ onStart, gameType }: PreGameMenuProps) {
    const [selectedMode, setSelectedMode] = useState<GameVariant>("classic");

    const gameTitle = gameType === "audio" ? "Audio Guessr" : "Background Guessr";
    const gameDescription = gameType === "audio" ? "You'll hear short clips from osu! songs" : "You'll be shown beatmap backgrounds from osu!";

    const ClassicModeContent = () => (
        <>
            <div>
                <h2 className="text-xl font-semibold mb-3">How to Play</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {gameDescription}</li>
                    <li>• Complete {MAX_ROUNDS} rounds of guessing</li>
                    <li>• Try to guess the song title within {ROUND_TIME} seconds per round</li>
                    <li>• Earn points based on speed and accuracy</li>
                    <li>• Build a streak for bonus points</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Scoring</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• Base Points: {BASE_POINTS}</li>
                    <li>• Time Bonus: {TIME_BONUS_MULTIPLIER} points per second remaining</li>
                    <li>• Streak Bonus: {STREAK_BONUS} points per streak level</li>
                    <li>• Skip Penalty: {SKIP_PENALTY} points</li>
                </ul>
            </div>
        </>
    );

    const DeathModeContent = () => (
        <>
            <div>
                <h2 className="text-xl font-semibold mb-3">How to Play</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {gameDescription}</li>
                    <li>• Keep playing until you make a mistake</li>
                    <li>• Try to guess the song title within {ROUND_TIME} seconds per round</li>
                    <li>• Build the longest streak possible</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Scoring</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• Only your streak count matters</li>
                    <li>• Points are not recorded in this mode</li>
                    <li>• Compete for the longest streak on the leaderboard</li>
                </ul>
            </div>
        </>
    );

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-3xl font-bold mb-6">{gameTitle}</h1>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Button onClick={() => setSelectedMode("classic")} variant={selectedMode === "classic" ? "default" : "outline"} className="flex-1 h-auto py-6 flex flex-col gap-2">
                            <span className="text-lg font-semibold">Classic Mode</span>
                            <span className="text-sm text-muted-foreground">10 rounds, score as many points as you can</span>
                        </Button>
                        <Button
                            onClick={() => setSelectedMode("death")}
                            variant={selectedMode === "death" ? "destructive" : "outline"}
                            className="flex-1 h-auto py-6 flex flex-col gap-2 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <span className="text-lg font-semibold">Death Mode</span>
                            <span className="text-sm text-muted-foreground">Only one life, treasure it!</span>
                        </Button>
                    </div>

                    <div className="space-y-6 mb-8">
                        {selectedMode === "classic" ? <ClassicModeContent /> : <DeathModeContent />}

                        {selectedMode === "classic" && (
                            <div className="bg-destructive/10 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2 text-destructive">Important Note</h2>
                                <p className="text-foreground/70">Your score will only be counted if you complete all {MAX_ROUNDS} rounds. Leaving the game early will forfeit your progress!</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => onStart(selectedMode)} className="flex-1" variant={selectedMode === "death" ? "destructive" : "default"}>
                            Start Game
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
