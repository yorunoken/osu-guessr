interface AppConfig {
    game: {
        roundTime: number;
        maxRounds: number;
        skipPenalty: number;
        basePoints: number;
        streakBonus: number;
        timeBonusMultiplier: number;
        autoAdvanceDelay: number;
    };
    ui: {
        animationDuration: number;
        toastDuration: number;
        debounceDelay: number;
    };
    api: {
        timeout: number;
        retries: number;
        baseUrl: string;
    };
    audio: {
        defaultVolume: number;
        enableSounds: boolean;
        preloadSounds: boolean;
    };
    performance: {
        enableAnalytics: boolean;
        metricsInterval: number;
    };
}

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
        try {
            const stored = localStorage.getItem("app-config");
            if (stored) {
                const parsedConfig = JSON.parse(stored);
                this.config = { ...DEFAULT_CONFIG, ...parsedConfig };
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
