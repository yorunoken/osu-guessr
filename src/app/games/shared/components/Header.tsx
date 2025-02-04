import { useTranslationsContext } from "@/context/translations-provider";

interface GameHeaderProps {
    streak: number;
    points: number;
    timeLeft: number;
    currentRound: number;
    totalRounds: number;
    mode: "Background" | "Audio";
    gameVariant: "classic" | "death";
    maxStreak?: number;
    lives?: number;
}

export default function GameHeader({ streak, points, timeLeft, currentRound, totalRounds, mode, gameVariant, maxStreak = 0, lives = 1 }: GameHeaderProps) {
    const { t } = useTranslationsContext();

    const getLivesDisplay = (lives: number) => {
        if (lives === 1) {
            return (
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                    <span className="font-semibold">🎯 {t.game.header.death.lives.oneShot}</span>
                </div>
            );
        } else {
            return (
                <div className="bg-destructive/20 text-destructive px-4 py-1 rounded-full">
                    <span className="font-semibold">💀 {t.game.header.death.lives.gameOver}</span>
                </div>
            );
        }
    };

    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{t.game.header.title.replace("{mode}", mode)}</h1>

                {gameVariant === "classic" ? (
                    <>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">{t.game.header.classic.round.replace("{current}", currentRound.toString()).replace("{total}", totalRounds.toString())}</span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">{t.game.header.classic.streak.replace("{count}", streak.toString())}</span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">{t.game.header.classic.points.replace("{count}", points.toString())}</span>
                        </div>
                    </>
                ) : (
                    <>
                        {getLivesDisplay(lives)}
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">{t.game.header.death.currentStreak.replace("{count}", streak.toString())}</span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">{t.game.header.death.maxStreak.replace("{count}", maxStreak.toString())}</span>
                        </div>
                    </>
                )}
            </div>
            <div className="text-2xl font-mono">
                <span className={timeLeft < 10 ? "text-destructive" : "text-foreground"}>{t.game.header.timeLeft.replace("{seconds}", timeLeft.toString())}</span>
            </div>
        </div>
    );
}
