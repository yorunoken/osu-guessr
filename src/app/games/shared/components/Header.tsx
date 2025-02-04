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
    const getLivesDisplay = (lives: number) => {
        if (lives === 1) {
            return (
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                    <span className="font-semibold">🎯 One Shot</span>
                </div>
            );
        } else {
            return (
                <div className="bg-destructive/20 text-destructive px-4 py-1 rounded-full">
                    <span className="font-semibold">💀 Game Over</span>
                </div>
            );
        }
    };

    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{mode} Guessr</h1>

                {gameVariant === "classic" ? (
                    <>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">
                                Round: {currentRound}/{totalRounds}
                            </span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">Streak: {streak}</span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">Points: {points}</span>
                        </div>
                    </>
                ) : (
                    <>
                        {getLivesDisplay(lives)}
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">Current Streak: {streak}</span>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-1 rounded-full">
                            <span className="font-semibold">Max Streak: {maxStreak}</span>
                        </div>
                    </>
                )}
            </div>
            <div className="text-2xl font-mono">
                <span className={timeLeft < 10 ? "text-destructive" : "text-foreground"}>{timeLeft}s</span>
            </div>
        </div>
    );
}
