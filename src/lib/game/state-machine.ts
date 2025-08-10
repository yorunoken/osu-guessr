export type GamePhase =
    | "waiting" // Before game starts
    | "loading" // Loading game data
    | "playing" // Active round in progress
    | "answered" // User has submitted answer
    | "revealed" // Answer is shown
    | "transitioning" // Moving to next round
    | "finished" // Game completed
    | "error"; // Error state

export type GameEvent = "START_GAME" | "GAME_LOADED" | "SUBMIT_GUESS" | "REVEAL_ANSWER" | "NEXT_ROUND" | "FINISH_GAME" | "ERROR_OCCURRED" | "RECOVER";

export interface GameStateMachine {
    currentPhase: GamePhase;
    canTransition(event: GameEvent): boolean;
    transition(event: GameEvent): GamePhase;
    getValidEvents(): GameEvent[];
}

const PHASE_TRANSITIONS: Record<GamePhase, Partial<Record<GameEvent, GamePhase>>> = {
    waiting: {
        START_GAME: "loading",
        ERROR_OCCURRED: "error",
    },
    loading: {
        GAME_LOADED: "playing",
        ERROR_OCCURRED: "error",
    },
    playing: {
        SUBMIT_GUESS: "answered",
        REVEAL_ANSWER: "revealed",
        ERROR_OCCURRED: "error",
    },
    answered: {
        REVEAL_ANSWER: "revealed",
        NEXT_ROUND: "transitioning",
        FINISH_GAME: "finished",
        ERROR_OCCURRED: "error",
    },
    revealed: {
        NEXT_ROUND: "transitioning",
        FINISH_GAME: "finished",
        ERROR_OCCURRED: "error",
    },
    transitioning: {
        GAME_LOADED: "playing",
        FINISH_GAME: "finished",
        ERROR_OCCURRED: "error",
    },
    finished: {
        START_GAME: "loading",
    },
    error: {
        RECOVER: "playing",
        START_GAME: "loading",
    },
};

export class GameStateMachineImpl implements GameStateMachine {
    public currentPhase: GamePhase = "waiting";

    canTransition(event: GameEvent): boolean {
        const transitions = PHASE_TRANSITIONS[this.currentPhase];
        return event in transitions;
    }

    transition(event: GameEvent): GamePhase {
        if (!this.canTransition(event)) {
            console.warn(`Invalid transition: ${event} from ${this.currentPhase}`);
            return this.currentPhase;
        }

        const newPhase = PHASE_TRANSITIONS[this.currentPhase][event]!;
        console.log(`[Game State]: ${this.currentPhase} → ${newPhase} (${event})`);
        this.currentPhase = newPhase;
        return newPhase;
    }

    getValidEvents(): GameEvent[] {
        return Object.keys(PHASE_TRANSITIONS[this.currentPhase]) as GameEvent[];
    }

    reset(): void {
        this.currentPhase = "waiting";
    }
}
