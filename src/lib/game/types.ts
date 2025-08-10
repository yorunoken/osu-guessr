import { GameState } from "@/actions/types";

export interface GameSession {
    id: string;
    state: GameState;
    timer: NodeJS.Timeout | null;
    isActive: boolean;
    lastActivity: Date;
    retryCount: number;
}

export interface GameClientConfig {
    maxRetries: number;
    retryDelay: number;
    sessionTimeout: number;
    recoveryMode: "auto" | "manual";
}

export interface GameClientEvents {
    onStateUpdate: (state: GameState) => void;
    onError?: (error: Error) => void;
    onRetry?: (attempt: number, maxRetries: number) => void;
    onRecovery?: () => void;
}

export type GameClientStatus = "idle" | "starting" | "active" | "paused" | "ended" | "error";
