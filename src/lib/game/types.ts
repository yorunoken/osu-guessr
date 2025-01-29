import { GameState } from "@/actions/game-server";

export interface GameSession {
    id: string;
    state: GameState;
    timer: NodeJS.Timeout | null;
    isActive: boolean;
}
