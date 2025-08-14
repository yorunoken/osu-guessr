"use client";

import { Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { ResultMessage } from "../../shared/components/Result";
import { useTranslationsContext } from "@/context/translations-provider";
import { GameMediaProps } from "@/lib/game/interfaces";

export default function GameAudio({ mediaUrl, isRevealed, result, songInfo, onVolumeChange, initialVolume }: GameMediaProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslationsContext();

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsLoading(true);

            const handleCanPlay = () => {
                setIsLoading(false);
                if (!isRevealed) {
                    const playPromise = audioRef.current!.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.log("Audio playback failed:", error);
                        });
                    }
                }
            };

            const audio = audioRef.current; // Copy ref to variable
            audio.addEventListener("canplay", handleCanPlay);
            audio.load();

            return () => {
                audio.removeEventListener("canplay", handleCanPlay);
                audio.pause();
                audio.currentTime = 0;
            };
        }
    }, [mediaUrl, isRevealed]);

    useEffect(() => {
        if (audioRef.current && initialVolume !== undefined) {
            audioRef.current.volume = initialVolume;
        }
    }, [initialVolume]);

    useEffect(() => {
        if (audioRef.current && onVolumeChange) {
            const audio = audioRef.current; // Copy ref to variable
            const handleVolumeChange = () => {
                onVolumeChange(audio.volume);
            };
            audio.addEventListener("volumechange", handleVolumeChange);

            return () => {
                audio.removeEventListener("volumechange", handleVolumeChange);
            };
        }
    }, [onVolumeChange]);

    useEffect(() => {
        if (isRevealed && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [isRevealed]);

    return (
        <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-[50px] mb-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
                <audio ref={audioRef} controls className={`w-full mb-4 ${isLoading ? "hidden" : "block"}`}>
                    <source src={mediaUrl} type="audio/mp3" />
                    {t.game.audio.browserNotSupported}
                </audio>
                {!isRevealed && <p className="text-center text-muted-foreground">{t.game.audio.instructions}</p>}
            </div>
            {isRevealed && result && songInfo && (
                <div className="bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <ResultMessage result={result} />
                    <div className="space-y-2">
                        <p className="text-xl font-semibold">{songInfo.title}</p>
                        <p className="text-foreground/70">by {songInfo.artist}</p>
                        <p className="text-sm text-foreground/50">Mapped by {songInfo.mapper}</p>
                        {songInfo.mapsetId && (
                            <a
                                href={`https://osu.ppy.sh/beatmapsets/${songInfo.mapsetId}`}
                                className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Beatmap
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
