import { GameMode } from "@/actions/types";
import { GameModeComponents } from "./interfaces";
import { gameRegistry } from "./registry";

class GameModeFactory {
    private components = new Map<GameMode, GameModeComponents>();

    register(mode: GameMode, components: GameModeComponents): void {
        this.components.set(mode, components);
    }

    getComponents(mode: GameMode): GameModeComponents | undefined {
        return this.components.get(mode);
    }

    getAllAvailableModes(): GameMode[] {
        return gameRegistry.getAllModes().map((mode) => mode.id);
    }

    isModeRegistered(mode: GameMode): boolean {
        return this.components.has(mode) && gameRegistry.getMode(mode)?.isEnabled === true;
    }
}

export const gameModeFactory = new GameModeFactory();
