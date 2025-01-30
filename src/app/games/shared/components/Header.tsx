interface GameHeaderProps {
    streak: number;
    points: number;
    timeLeft: number;
    currentRound: number;
    totalRounds: number;
    mode: "Background" | "Audio";
}

export default function GameHeader({ streak, points, timeLeft, currentRound, totalRounds, mode }: GameHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{mode} Guessr</h1>
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
            </div>
            <div className="text-2xl font-mono">
                <span className={timeLeft < 10 ? "text-destructive" : "text-foreground"}>{timeLeft}s</span>
            </div>
        </div>
    );
}
