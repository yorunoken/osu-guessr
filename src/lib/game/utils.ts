import { GameMode, GameVariant } from "@/actions/types";
import { gameRegistry } from "./registry";

export function createGameMode(config: { id: GameMode; name: string; description: string; image: string; supportedVariants?: GameVariant[]; enabled?: boolean }) {
    gameRegistry.registerMode({
        id: config.id,
        name: config.name,
        description: config.description,
        image: config.image,
        url: `/games/${config.id}`,
        isEnabled: config.enabled ?? true,
        supportedVariants: config.supportedVariants ?? ["classic", "death"],
    });
}

export function createGameVariant(config: {
    id: GameVariant;
    name: string;
    description: string;
    rules: {
        maxRounds?: number;
        timePerRound: number;
        basePoints: number;
        timeBonusMultiplier?: number;
        streakBonus?: number;
        skipPenalty?: number;
        streakOnly?: boolean;
        endConditions: Array<"maxRounds" | "firstIncorrect" | "timeLimit">;
    };
    enabled?: boolean;
}) {
    gameRegistry.registerVariant({
        id: config.id,
        name: config.name,
        description: config.description,
        isEnabled: config.enabled ?? true,
        rules: {
            maxRounds: config.rules.maxRounds,
            timePerRound: config.rules.timePerRound,
            scoring: {
                basePoints: config.rules.basePoints,
                timeBonusMultiplier: config.rules.timeBonusMultiplier ?? 0,
                streakBonus: config.rules.streakBonus ?? 0,
                skipPenalty: config.rules.skipPenalty ?? 0,
                streakOnly: config.rules.streakOnly,
            },
            endConditions: config.rules.endConditions,
        },
    });
}

export function getGameModeInfo(mode: GameMode) {
    return gameRegistry.getMode(mode);
}

export function getGameVariantInfo(variant: GameVariant) {
    return gameRegistry.getVariant(variant);
}

export function getAllAvailableGames() {
    const modes = gameRegistry.getAllModes();
    return modes.map((mode) => ({
        mode,
        variants: gameRegistry.getSupportedVariants(mode.id),
    }));
}

export function isGameSupported(mode: GameMode, variant: GameVariant) {
    return gameRegistry.isModeVariantSupported(mode, variant);
}
