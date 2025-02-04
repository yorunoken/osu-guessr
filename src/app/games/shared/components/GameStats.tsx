import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GameVariant } from "../../config";
import { useTranslationsContext } from "@/context/translations-provider";

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
    const { t } = useTranslationsContext();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    {gameVariant === "classic" ? (
                        <>
                            <h1 className="text-3xl font-bold mb-6">{t.game.stats.classic.title}</h1>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                                    <div className="text-sm text-foreground/70">{t.game.stats.classic.totalPoints}</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{maxStreak}</div>
                                    <div className="text-sm text-foreground/70">{t.game.stats.classic.highestStreak}</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {t.game.stats.classic.correctGuesses.replace("{correct}", correctGuesses.toString()).replace("{total}", totalRounds.toString())}
                                    </div>
                                    <div className="text-sm text-foreground/70">{t.game.stats.labels.correctGuesses}</div>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">{t.game.stats.classic.averageTime.replace("{time}", averageTime.toFixed(1))}</div>
                                    <div className="text-sm text-foreground/70">{t.game.stats.labels.averageTime}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className={`text-3xl font-bold mb-6 ${gameEndReason === "died" ? "text-destructive" : "text-primary"}`}>
                                {gameEndReason === "died" ? t.game.stats.death.title.died : t.game.stats.death.title.completed}
                            </h1>

                            <div className="grid grid-cols-1 gap-6 mb-8">
                                <div className="bg-secondary/50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">{maxStreak}</div>
                                    <div className="text-lg text-foreground/70">{t.game.stats.death.maxStreak}</div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-lg grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{correctGuesses}</div>
                                        <div className="text-sm text-foreground/70">{t.game.stats.death.totalCorrect}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{t.game.stats.classic.averageTime.replace("{time}", averageTime.toFixed(1))}</div>
                                        <div className="text-sm text-foreground/70">{t.game.stats.labels.averageTime}</div>
                                    </div>
                                </div>

                                {gameEndReason === "died" && (
                                    <div className="bg-destructive/10 p-4 rounded-lg text-center">
                                        <p className="text-destructive font-medium">{t.game.stats.death.diedMessage}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex gap-4">
                        <Button onClick={onPlayAgain} className="flex-1" variant={gameVariant === "death" ? "destructive" : "default"}>
                            {t.game.stats.actions.tryAgain}
                        </Button>
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                {t.game.stats.actions.backToHome}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
