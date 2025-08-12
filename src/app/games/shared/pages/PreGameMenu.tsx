"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ROUND_TIME, BASE_POINTS, SKIP_PENALTY, STREAK_BONUS, TIME_BONUS_MULTIPLIER, MAX_ROUNDS, GameVariant } from "../../config";
import { useTranslationsContext } from "@/context/translations-provider";
import { GameMode } from "@/actions/types";

interface PreGameMenuProps {
    onStart(variant: GameVariant): void;
    gameMode: GameMode;
}

export default function PreGameMenu({ onStart, gameMode }: PreGameMenuProps) {
    const { t } = useTranslationsContext();
    const [selectedMode, setSelectedMode] = useState<GameVariant>("classic");

    const descriptions = t.game.preGame.description as Record<string, string>;
    const gameDescription = descriptions[gameMode] || descriptions.background;

    const ClassicModeContent = () => (
        <>
            <div>
                <h2 className="text-xl font-semibold mb-3">{t.game.preGame.howToPlay.title}</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {gameDescription}</li>
                    <li>• {t.game.preGame.howToPlay.classic.rounds.replace("{count}", MAX_ROUNDS.toString())}</li>
                    <li>• {t.game.preGame.howToPlay.classic.time.replace("{seconds}", ROUND_TIME.toString())}</li>
                    <li>• {t.game.preGame.howToPlay.classic.points}</li>
                    <li>• {t.game.preGame.howToPlay.classic.streak}</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">{t.game.preGame.scoring.title}</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {t.game.preGame.scoring.classic.base.replace("{points}", BASE_POINTS.toString())}</li>
                    <li>• {t.game.preGame.scoring.classic.timeBonus.replace("{points}", TIME_BONUS_MULTIPLIER.toString())}</li>
                    <li>• {t.game.preGame.scoring.classic.streakBonus.replace("{points}", STREAK_BONUS.toString())}</li>
                    <li>• {t.game.preGame.scoring.classic.skipPenalty.replace("{points}", SKIP_PENALTY.toString())}</li>
                </ul>
            </div>
        </>
    );

    const DeathModeContent = () => (
        <>
            <div>
                <h2 className="text-xl font-semibold mb-3">{t.game.preGame.howToPlay.title}</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {gameDescription}</li>
                    <li>• {t.game.preGame.howToPlay.death.continuous}</li>
                    <li>• {t.game.preGame.howToPlay.death.time.replace("{seconds}", ROUND_TIME.toString())}</li>
                    <li>• {t.game.preGame.howToPlay.death.streak}</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">{t.game.preGame.scoring.title}</h2>
                <ul className="space-y-2 text-foreground/70">
                    <li>• {t.game.preGame.scoring.death.streakOnly}</li>
                    <li>• {t.game.preGame.scoring.death.noPoints}</li>
                    <li>• {t.game.preGame.scoring.death.compete}</li>
                </ul>
            </div>
        </>
    );

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-3xl font-bold mb-6">{t.game.preGame.title[gameMode as keyof typeof t.game.preGame.title]}</h1>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Button onClick={() => setSelectedMode("classic")} variant={selectedMode === "classic" ? "default" : "outline"} className="flex-1 h-auto py-6 flex flex-col gap-2">
                            <span className="text-lg font-semibold">{t.game.preGame.modes.classic.title}</span>
                            <span className="text-sm text-muted-foreground">{t.game.preGame.modes.classic.description}</span>
                        </Button>
                        <Button
                            onClick={() => setSelectedMode("death")}
                            variant={selectedMode === "death" ? "destructive" : "outline"}
                            className="flex-1 h-auto py-6 flex flex-col gap-2 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <span className="text-lg font-semibold">{t.game.preGame.modes.death.title}</span>
                            <span className="text-sm text-muted-foreground">{t.game.preGame.modes.death.description}</span>
                        </Button>
                    </div>

                    <div className="space-y-6 mb-8">
                        {selectedMode === "classic" ? <ClassicModeContent /> : <DeathModeContent />}

                        {selectedMode === "classic" && (
                            <div className="bg-destructive/10 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2 text-destructive">{t.game.preGame.warning.title}</h2>
                                <p className="text-foreground/70">{t.game.preGame.warning.description.replace("{rounds}", MAX_ROUNDS.toString())}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => onStart(selectedMode)} className="flex-1" variant={selectedMode === "death" ? "destructive" : "default"}>
                            {t.game.preGame.actions.startGame}
                        </Button>
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                {t.game.preGame.actions.backToHome}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
