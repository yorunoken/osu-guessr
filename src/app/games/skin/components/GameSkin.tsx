"use client";

import Image from "next/image";
import { ResultMessage } from "../../shared/components/Result";
import { GameMediaProps } from "@/lib/game/interfaces";

export default function GameSkin({ mediaUrl, isRevealed, result, songInfo }: GameMediaProps) {
    return (
        <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="aspect-video">
                <Image src={mediaUrl || "/placeholder.svg"} alt="Skin screenshot" fill className="object-contain" priority />
            </div>

            {isRevealed && result && songInfo && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <ResultMessage result={result} />
                    <div className="space-y-2">
                        <p className="text-xl font-semibold">Skin Name: {songInfo.title}</p>
                        {songInfo.mapsetId && (
                            <a
                                href={`https://skins.osuck.net/skins/${songInfo.mapsetId}`}
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
