export interface GameState {
    sessionId: string;
    currentBeatmap: {
        imageUrl: string;
        revealed: boolean;
        title?: string;
        artist?: string;
        mapper?: string;
    };
    score: {
        total: number;
        current: number;
        streak: number;
        highestStreak: number;
    };
    timeLeft: number;
    gameStatus: "active" | "finished";
    lastGuess?: {
        correct: boolean;
        answer?: string;
    };
}

export interface GameSession {
    id: string;
    state: GameState;
    timer: NodeJS.Timeout | null;
    isActive: boolean;
}
