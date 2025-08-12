import { startGameAction, submitGuessAction, getGameStateAction, endGameAction, getSuggestionsAction } from "@/actions/game-server";
import { soundManager } from "./sounds";
import { GameSession, GameClientConfig, GameClientEvents, GameClientStatus } from "./types";
import { GameVariant } from "@/app/games/config";
import { GameState, GameMode } from "@/actions/types";
import { GameError, handleGameError } from "./errors";

const DEFAULT_CONFIG: GameClientConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    sessionTimeout: 300000, // 5 minutes
    recoveryMode: "auto",
};

export class GameClient {
    private session: GameSession | null = null;
    private events: GameClientEvents;
    private gameMode: GameMode;
    private gameVariant: GameVariant;
    private userVolume: number = 0.25;
    private config: GameClientConfig;
    private status: GameClientStatus = "idle";

    constructor(events: GameClientEvents, gameMode: GameMode = "background", gameVariant: GameVariant = "classic", config: Partial<GameClientConfig> = {}) {
        this.events = events;
        this.gameMode = gameMode;
        this.gameVariant = gameVariant;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    private isSupportedGameMode(mode: GameMode): mode is GameMode {
        return mode === "audio" || mode === "background" || mode === "skin";
    }

    getStatus(): GameClientStatus {
        return this.status;
    }

    setVolume(volume: number): void {
        this.userVolume = Math.max(0, Math.min(1, volume));
        soundManager.setVolume(this.userVolume);
    }

    getVolume(): number {
        return this.userVolume;
    }

    private setStatus(status: GameClientStatus): void {
        this.status = status;
    }

    private async executeWithRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                const gameError = handleGameError(error);
                lastError = gameError;

                this.events.onError?.(gameError);

                if (!gameError.recoverable || attempt === this.config.maxRetries) {
                    throw gameError;
                }

                this.events.onRetry?.(attempt, this.config.maxRetries);
                console.warn(`${operationName} failed (attempt ${attempt}/${this.config.maxRetries}):`, gameError.message);

                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt - 1)));
            }
        }

        throw lastError || new GameError(`Failed to execute ${operationName}`, "OPERATION_FAILED");
    }

    async startGame(): Promise<void> {
        this.setStatus("starting");

        try {
            if (!this.isSupportedGameMode(this.gameMode)) {
                throw new GameError(`Game mode "${this.gameMode}" is not yet supported`, "UNSUPPORTED_MODE");
            }

            const initialState = await this.executeWithRetry(() => startGameAction(this.gameMode, this.gameVariant), "startGame");

            this.session = {
                id: initialState.sessionId,
                state: initialState,
                timer: null,
                isActive: true,
                lastActivity: new Date(),
                retryCount: 0,
            };

            this.setStatus("active");
            this.startTimer();
            console.log(`[Game Client]: Started ${this.gameMode} Game (${this.gameVariant} mode)`);
        } catch (error) {
            this.setStatus("error");
            console.error("Failed to start game:", error);
            throw error;
        }
    }

    private startTimer(): void {
        if (!this.session?.isActive) return;

        this.stopTimer();

        this.session.timer = setInterval(() => {
            if (!this.session?.state) return;

            const newTimeLeft = Math.max(0, this.session.state.timeLeft - 1);
            this.updateState({ ...this.session.state, timeLeft: newTimeLeft });

            if (newTimeLeft === 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    private stopTimer(): void {
        if (this.session?.timer) {
            clearInterval(this.session.timer);
            this.session.timer = null;
        }
    }

    private async handleTimeout(): Promise<void> {
        if (!this.session?.isActive || !this.session?.id) return;

        this.stopTimer();
        try {
            soundManager.play("timeout");
            const newState = await submitGuessAction(this.session.id, "");
            this.updateState(newState);
            console.log("[Game Client]: Round timed out");
        } catch (error) {
            console.error("Failed to handle timeout:", error);
            await this.recoverState();
        }
    }

    async submitGuess(guess: string): Promise<void> {
        if (!this.session?.isActive) return;

        this.stopTimer();

        try {
            const newState = await this.executeWithRetry(() => submitGuessAction(this.session!.id, guess), "submitGuess");

            if (newState.lastGuess?.correct) {
                soundManager.play("correct");
            } else {
                soundManager.play("wrong");
            }

            this.updateState(newState);
            console.log("[Game Client]: Submitted Guess");
        } catch (error) {
            console.error("Failed to submit guess:", error);
            if (this.config.recoveryMode === "auto") {
                await this.recoverState();
            }
            throw error;
        }
    }

    async skipAnswer(): Promise<void> {
        if (!this.session?.isActive) return;
        this.stopTimer();

        try {
            soundManager.play("skip");
            const newState = await this.executeWithRetry(() => submitGuessAction(this.session!.id, null), "skipAnswer");
            this.updateState(newState);
            console.log("[Game Client]: Revealed Answer");
        } catch (error) {
            console.error("Failed to reveal answer:", error);
            if (this.config.recoveryMode === "auto") {
                await this.recoverState();
            }
            throw error;
        }
    }

    async goNextRound(): Promise<void> {
        if (!this.session?.isActive) return;

        try {
            const newState = await this.executeWithRetry(() => submitGuessAction(this.session!.id, undefined), "goNextRound");
            this.updateState(newState);
            this.startTimer();
            console.log("[Game Client]: Next Round");
        } catch (error) {
            console.error("Failed to go to next round:", error);
            if (this.config.recoveryMode === "auto") {
                await this.recoverState();
            }
            throw error;
        }
    }

    private async recoverState(): Promise<void> {
        if (!this.session?.id) return;

        try {
            this.events.onRecovery?.();
            const currentState = await this.executeWithRetry(() => getGameStateAction(this.session!.id), "recoverState");
            this.updateState(currentState);
            console.log("[Game Client]: State recovered successfully");
        } catch (error) {
            console.error("Failed to recover state:", error);
            this.setStatus("error");
        }
    }

    private updateState(newState: GameState): void {
        if (!this.session) return;
        this.session.state = newState;
        this.session.lastActivity = new Date();
        this.events.onStateUpdate(newState);
    }

    async endGame(): Promise<void> {
        if (!this.session?.id) return;

        this.stopTimer();
        this.session.isActive = false;
        this.setStatus("ended");

        try {
            await this.executeWithRetry(() => endGameAction(this.session!.id), "endGame");
            console.log("[Game Client]: Ended Game");
        } catch (error) {
            console.error("Failed to end game:", error);
            // Don't throw here as the game is ending anyway
        } finally {
            this.cleanup();
        }
    }

    async getSuggestions(query: string): Promise<string[]> {
        if (!this.session?.isActive || this.session.state.currentBeatmap.revealed) {
            return [];
        }

        try {
            const suggestions = await getSuggestionsAction(query);
            return suggestions;
        } catch (error) {
            console.error("Failed to get suggestions:", error);
            return [];
        }
    }

    private cleanup(): void {
        this.stopTimer();
        this.session = null;
        this.setStatus("idle");
    }
}
