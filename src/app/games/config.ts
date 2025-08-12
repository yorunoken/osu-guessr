import { gameRegistry } from "@/lib/game/registry";
import { GameMode } from "@/actions/types";

export const ROUND_TIME = 30;
export const SKIP_PENALTY = 50;
export const BASE_POINTS = 100;
export const STREAK_BONUS = 25;
export const TIME_BONUS_MULTIPLIER = 2;
export const MAX_ROUNDS = 10;
export const AUTO_ADVANCE_DELAY_MS = 3000;

export type GameVariant = "classic" | "death";

export function getVariantConfig(variant: GameVariant) {
    const config = gameRegistry.getVariant(variant);
    if (!config) {
        throw new Error(`Unknown game variant: ${variant}`);
    }
    return config;
}

export function getModeConfig(mode: GameMode) {
    const config = gameRegistry.getMode(mode);
    if (!config) {
        throw new Error(`Unknown game mode: ${mode}`);
    }
    return config;
}
