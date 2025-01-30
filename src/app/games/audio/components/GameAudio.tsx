"use client";

import { useRef, useEffect } from "react";

interface GameAudioProps {
    audioUrl: string;
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

export default function GameAudio({ audioUrl, isRevealed, result, songInfo }: GameAudioProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.load();
            audioRef.current.volume = 0.25;

            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.log("Audio playback failed:", error);
                });
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [audioRef]);

    return (
        <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6">
                <audio ref={audioRef} controls className="w-full mb-4">
                    <source src={audioUrl} type="audio/mp3" />
                    Your browser does not support the audio element.
                </audio>
                {!isRevealed && <p className="text-center text-muted-foreground">Listen to the audio and try to guess the song title!</p>}
            </div>
            {isRevealed && result && songInfo && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className={`text-2xl font-bold mb-4 ${result.correct ? "text-green-500" : "text-destructive"}`}>{result.correct ? "Correct!" : "Wrong!"}</div>
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
