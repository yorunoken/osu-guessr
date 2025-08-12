"use client";

import { GameVariant } from "../../config";
import { gameRegistry } from "@/lib/game/registry";
import PreGameMenu from "../pages/PreGameMenu";
import { GameMode } from "@/actions/types";

export default function createPreGameMenu(gameMode: GameMode) {
    return function GameModePreGameMenu({ onStart }: { onStart: (variant: GameVariant) => void }) {
        const modeConfig = gameRegistry.getMode(gameMode);
        if (!modeConfig) {
            throw new Error(`Unknown game mode: ${gameMode}`);
        }

        return <PreGameMenu onStart={onStart} gameMode={modeConfig.id} />;
    };
}
