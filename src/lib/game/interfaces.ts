import { GameMode, GameVariant } from "@/actions/types";

export interface GameMediaProps {
    mediaUrl: string;
    isRevealed: boolean;
    result?: {
        correct: boolean;
        answer?: string;
        type: "guess" | "timeout" | "skip";
    };
    songInfo?: {
        title?: string;
        artist?: string;
        mapper?: string;
        mapsetId?: number;
    };
    onVolumeChange?(volume: number): void;
    initialVolume?: number;
}

export interface GameModeComponents {
    GameMedia: React.ComponentType<GameMediaProps>;
    PreGameMenu: React.ComponentType<{ onStart: (variant: GameVariant) => void }>;
    GameScreen: React.ComponentType<{ onExit: () => void; variant: GameVariant }>;
}

export interface GamePageProps {
    mode: GameMode;
    metadata: {
        title: string;
        description: string;
    };
}

export interface PreGameMenuProps {
    onStart: (variant: GameVariant) => void;
    gameMode: GameMode;
}

export interface GameScreenProps {
    onExit: () => void;
    gameVariant: GameVariant;
    gameMode: GameMode;
    GameMedia: React.ComponentType<GameMediaProps>;
}
