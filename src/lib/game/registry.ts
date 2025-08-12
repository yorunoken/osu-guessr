import { GameMode, GameVariant } from "@/actions/types";

export interface GameModeConfig {
    id: GameMode;
    name: string;
    description: string;
    image: string;
    url: string;
    isEnabled: boolean;
    supportedVariants: GameVariant[];
}

export interface GameVariantConfig {
    id: GameVariant;
    name: string;
    description: string;
    isEnabled: boolean;
    rules: {
        maxRounds?: number;
        timePerRound: number;
        scoring: ScoringConfig;
        endConditions: EndCondition[];
    };
}

export interface ScoringConfig {
    basePoints: number;
    timeBonusMultiplier: number;
    streakBonus: number;
    skipPenalty: number;
    streakOnly?: boolean;
}

export type EndCondition = "maxRounds" | "firstIncorrect" | "timeLimit";

class GameRegistry {
    private modes = new Map<GameMode, GameModeConfig>();
    private variants = new Map<GameVariant, GameVariantConfig>();

    registerMode(config: GameModeConfig): void {
        this.modes.set(config.id, config);
    }

    registerVariant(config: GameVariantConfig): void {
        this.variants.set(config.id, config);
    }

    getMode(id: GameMode): GameModeConfig | undefined {
        return this.modes.get(id);
    }

    getVariant(id: GameVariant): GameVariantConfig | undefined {
        return this.variants.get(id);
    }

    getAllModes(shouldGetOnlyEnabled: boolean = false): GameModeConfig[] {
        if (shouldGetOnlyEnabled) {
            return Array.from(this.modes.values()).filter((mode) => mode.isEnabled);
        } else {
            return Array.from(this.modes.values());
        }
    }

    getAllVariants(): GameVariantConfig[] {
        return Array.from(this.variants.values()).filter((variant) => variant.isEnabled);
    }

    getSupportedVariants(modeId: GameMode): GameVariantConfig[] {
        const mode = this.getMode(modeId);
        if (!mode) return [];

        return mode.supportedVariants.map((variantId) => this.getVariant(variantId)).filter((variant): variant is GameVariantConfig => variant !== undefined && variant.isEnabled);
    }

    isModeVariantSupported(modeId: GameMode, variantId: GameVariant): boolean {
        const mode = this.getMode(modeId);
        return mode?.supportedVariants.includes(variantId) ?? false;
    }
}

export const gameRegistry = new GameRegistry();

gameRegistry.registerVariant({
    id: "classic",
    name: "Classic Mode",
    description: "10 rounds with time bonus scoring",
    isEnabled: true,
    rules: {
        maxRounds: 10,
        timePerRound: 30,
        scoring: {
            basePoints: 100,
            timeBonusMultiplier: 2,
            streakBonus: 25,
            skipPenalty: 50,
        },
        endConditions: ["maxRounds"],
    },
});

gameRegistry.registerVariant({
    id: "death",
    name: "Death Mode",
    description: "Unlimited rounds until first mistake",
    isEnabled: true,
    rules: {
        timePerRound: 30,
        scoring: {
            basePoints: 0,
            timeBonusMultiplier: 0,
            streakBonus: 1,
            skipPenalty: 0,
            streakOnly: true,
        },
        endConditions: ["firstIncorrect"],
    },
});

gameRegistry.registerMode({
    id: "background",
    name: "Background Guessr",
    description: "Test your knowledge by guessing songs from their beatmap backgrounds.",
    image: "/ghostrule.jpg",
    url: "/games/background",
    isEnabled: true,
    supportedVariants: ["classic", "death"],
});

gameRegistry.registerMode({
    id: "audio",
    name: "Audio Guessr",
    description: "Challenge yourself by identifying songs from short audio clips.",
    image: "/audio-mode.png",
    url: "/games/audio",
    isEnabled: true,
    supportedVariants: ["classic", "death"],
});

gameRegistry.registerMode({
    id: "skin",
    name: "Skin Guessr",
    description: "Test your knowledge of osu! skins by identifying them from screenshots.",
    image: "/skin-mode.png",
    url: "/games/skin",
    isEnabled: false,
    supportedVariants: ["classic", "death"],
});
