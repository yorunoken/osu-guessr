import { z } from "zod";

const appConfigSchema = z.object({
    game: z.object({
        roundTime: z.number().min(5),
        maxRounds: z.number().min(1),
        skipPenalty: z.number().min(0),
        basePoints: z.number().min(0),
        streakBonus: z.number().min(0),
        timeBonusMultiplier: z.number().min(0),
        autoAdvanceDelay: z.number().min(0),
    }),
    ui: z.object({
        animationDuration: z.number().min(0),
        toastDuration: z.number().min(0),
        debounceDelay: z.number().min(0),
    }),
    api: z.object({
        timeout: z.number().min(1000),
        retries: z.number().min(0),
        baseUrl: z.string(),
    }),
    audio: z.object({
        defaultVolume: z.number().min(0).max(1),
        enableSounds: z.boolean(),
        preloadSounds: z.boolean(),
    }),
    performance: z.object({
        enableAnalytics: z.boolean(),
        metricsInterval: z.number().min(1000),
    }),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

const DEFAULT_CONFIG: AppConfig = {
    game: {
        roundTime: 30,
        maxRounds: 10,
        skipPenalty: 50,
        basePoints: 100,
        streakBonus: 25,
        timeBonusMultiplier: 2,
        autoAdvanceDelay: 3000,
    },
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        debounceDelay: 300,
    },
    api: {
        timeout: 30000,
        retries: 3,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    },
    audio: {
        defaultVolume: 0.3,
        enableSounds: true,
        preloadSounds: true,
    },
    performance: {
        enableAnalytics: true,
        metricsInterval: 10000,
    },
};

class ConfigManager {
    private config: AppConfig = DEFAULT_CONFIG;
    private listeners: Set<(config: AppConfig) => void> = new Set();

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        if (typeof window === "undefined") return; // Ensure this runs safely
        try {
            const stored = localStorage.getItem("app-config");
            if (stored) {
                const parsedConfig = JSON.parse(stored);
                // Validate parsed JSON to ensure it matches AppConfig shapes
                const result = appConfigSchema.safeParse({ ...DEFAULT_CONFIG, ...parsedConfig });
                if (result.success) {
                    this.config = result.data;
                } else {
                    console.warn("Invalid config detected in localStorage, falling back to defaults.", result.error);
                }
            }
        } catch (error) {
            console.warn("Failed to load config from localStorage:", error);
        }
    }

    private saveConfig(): void {
        try {
            localStorage.setItem("app-config", JSON.stringify(this.config));
            this.notifyListeners();
        } catch (error) {
            console.warn("Failed to save config to localStorage:", error);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.config));
    }

    getConfig(): AppConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<AppConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    resetConfig(): void {
        this.config = { ...DEFAULT_CONFIG };
        this.saveConfig();
    }

    subscribe(listener: (config: AppConfig) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Specific getters for common config values
    get gameConfig() {
        return this.config.game;
    }

    get uiConfig() {
        return this.config.ui;
    }

    get apiConfig() {
        return this.config.api;
    }

    get audioConfig() {
        return this.config.audio;
    }
}

export const configManager = new ConfigManager();
