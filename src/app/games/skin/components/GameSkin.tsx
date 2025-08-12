"use client";

import Image from "next/image";
import { GameMediaProps } from "../../shared/types/props";
import { ResultMessage } from "../../shared/components/Result";

export default function GameSkin({ mediaUrl, isRevealed, result, songInfo }: GameMediaProps) {
    return (
        <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="aspect-video">
                <Image src={mediaUrl || "/placeholder.svg"} alt="Skin screenshot" fill className="object-contain" priority />
                {!isRevealed && <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-foreground text-sm">🎨 Guess the skin name</div>}
            </div>

            {isRevealed && result && songInfo && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <ResultMessage result={result} />
                    <div className="space-y-2">
                        <p className="text-xl font-semibold">{songInfo.title}</p>
                        <p className="text-foreground/70">by {songInfo.artist}</p>
                        <p className="text-sm text-foreground/50">Created by {songInfo.mapper}</p>
                        {songInfo.mapsetId && (
                            <a
                                href={`https://osu.ppy.sh/beatmapsets/${songInfo.mapsetId}`}
                                className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Skin
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
