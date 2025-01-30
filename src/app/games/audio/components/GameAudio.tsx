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
            audioRef.current.play();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.src = "";
            }
        };
    }, [audioUrl]);

    return (
        <div className="relative aspect-[3/1] rounded-xl border border-border/50 bg-card p-8">
            <div className="flex flex-col items-center justify-center h-full">
                <audio ref={audioRef} controls className="w-full mb-6">
                    <source src={audioUrl} type="audio/mp3" />
                    Your browser does not support the audio element.
                </audio>

                {!isRevealed && <p className="text-foreground/70">Listen to the audio and try to guess the song title!</p>}

                {isRevealed && result && songInfo && (
                    <div className="w-full max-w-md space-y-6">
                        <div
                            className={`text-center px-4 py-2 rounded-lg ${
                                result.correct ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                        >
                            <span className="text-2xl font-bold">{result.correct ? "Correct!" : "Wrong!"}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-card/50 rounded-lg p-4 space-y-2 text-center">
                                <h3 className="text-2xl font-bold text-primary">{songInfo.title}</h3>
                                <p className="text-lg text-foreground/70">by {songInfo.artist}</p>
                                <div className="pt-2 border-t border-border/20">
                                    <p className="text-sm text-foreground/50">Mapped by {songInfo.mapper}</p>
                                </div>
                            </div>

                            <a
                                href={`https://osu.ppy.sh/beatmapsets/${songInfo.mapsetId}`}
                                className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Beatmap ↗
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
