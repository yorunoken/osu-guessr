import { startGameAction, submitGuessAction, getGameStateAction, endGameAction, deleteSessionAction } from "@/actions/game-server";
import { GameState, GameSession } from "./types";

export class GameClient {
    private session: GameSession | null = null;
    private onStateUpdate: (state: GameState) => void;

    constructor(onStateUpdate: (state: GameState) => void) {
        this.onStateUpdate = onStateUpdate;
    }

    async startGame(): Promise<void> {
        try {
            const initialState = await startGameAction();
            this.session = {
                id: initialState.sessionId,
                state: initialState,
                timer: null,
                isActive: true,
            };
            this.startTimer();
            console.log("[Game Client]: Started Game");
        } catch (error) {
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
        this.stopTimer();
        await this.revealAnswer();
    }

    async submitGuess(guess: string): Promise<void> {
        if (!this.session?.isActive) return;

        this.stopTimer();

        try {
            const newState = await submitGuessAction(this.session.id, guess);
            this.updateState(newState);
            console.log("[Game Client]: Submitted Guess");
        } catch (error) {
            console.error("Failed to submit guess:", error);
            await this.recoverState();
        }
    }

    async revealAnswer(): Promise<void> {
        if (!this.session?.isActive) return;
        this.stopTimer();

        try {
            const newState = await submitGuessAction(this.session.id, null);
            this.updateState(newState);
            console.log("[Game Client]: Revealed Answer");
        } catch (error) {
            console.error("Failed to reveal answer:", error);
            await this.recoverState();
        }
    }

    async goNextRound(): Promise<void> {
        if (!this.session?.isActive) return;

        try {
            const newState = await submitGuessAction(this.session.id, undefined);
            this.updateState(newState);
            this.startTimer();
            console.log("[Game Client]: Next Round");
        } catch (error) {
            console.error("Failed to go to next round:", error);
            await this.recoverState();
        }
    }

    private async recoverState(): Promise<void> {
        try {
            if (!this.session?.id) return;
            const currentState = await getGameStateAction(this.session.id);
            this.updateState(currentState);
        } catch (error) {
            console.error("Failed to recover state:", error);
        }
    }

    private updateState(newState: GameState): void {
        if (!this.session) return;
        this.session.state = newState;
        this.onStateUpdate(newState);
    }

    async endGame(): Promise<void> {
        if (!this.session?.id) return;

        this.stopTimer();
        this.session.isActive = false;

        try {
            await endGameAction(this.session.id);
            console.log("[Game Client]: Ended Game");
        } catch (error) {
            console.error("Failed to end game:", error);
            throw error;
        } finally {
            this.cleanup();
        }
    }

    async cleanUpSession(): Promise<void> {
        if (!this.session?.id) return;

        this.stopTimer();
        this.session.isActive = false;

        try {
            await deleteSessionAction(this.session.id);
            console.log("[Game Client]: Ended Game (0 points, deleted session)");
        } catch (error) {
            console.error("Failed to end game:", error);
            throw error;
        } finally {
            this.cleanup();
        }
    }

    private cleanup(): void {
        this.stopTimer();
        this.session = null;
    }
}
