import Image from "next/image";

interface GameImageProps {
    imageUrl: string;
    isRevealed: boolean;
    result?: {
        correct: boolean;
        answer?: string;
    };
    songInfo?: {
        title?: string;
        artist?: string;
        mapper?: string;
        mapsetId?: number;
    };
}

export default function GameImage({ imageUrl, isRevealed, result, songInfo }: GameImageProps) {
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50">
            <Image src={imageUrl} alt="Beatmap Background" fill className="object-cover" />
            {isRevealed && result && songInfo && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className={`text-2xl font-bold mb-4 ${result.correct ? "text-green-500" : "text-destructive"}`}>{result.correct ? "Correct!" : "Wrong!"}</div>
                    <div className="space-y-2">
                        <p className="text-xl font-semibold">{songInfo.title}</p>
                        <p className="text-foreground/70">by {songInfo.artist}</p>
                        <p className="text-sm text-foreground/50">Mapped by {songInfo.mapper}</p>
                        <a
                            href={`https://osu.ppy.sh/beatmapsets/${songInfo.mapsetId}`}
                            className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Beatmap Link
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
