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
    onVolumeChange(volume: number): void;
    initialVolume: number;
}
