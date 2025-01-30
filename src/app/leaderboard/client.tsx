"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTopPlayersAction, TopPlayer } from "@/actions/user-server";

type GameMode = "background" | "audio" | "skin";

export default function LeaderboardClient() {
    const { data: session } = useSession();
    const [selectedMode, setSelectedMode] = useState<GameMode>("background");
    const [leaderboardData, setLeaderboardData] = useState<Array<TopPlayer>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTopPlayersAction(selectedMode, 100);

                setLeaderboardData(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setError(error instanceof Error ? error.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeaderboard();
    }, [selectedMode]);

    const gameModes: GameMode[] = ["background", "audio", "skin"];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>

            <div className="flex justify-center gap-4 mb-8">
                {gameModes.map((mode) => (
                    <Button key={mode} variant={selectedMode === mode ? "default" : "outline"} onClick={() => setSelectedMode(mode)} className="capitalize">
                        {mode}
                    </Button>
                ))}
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : error ? (
                    <div className="p-8 text-center text-destructive">
                        <p>{error}</p>
                    </div>
                ) : leaderboardData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-4 text-left">#</th>
                                    <th className="px-6 py-4 text-left">Player</th>
                                    <th className="px-6 py-4 text-right">Total Score</th>
                                    <th className="px-6 py-4 text-right">Games Played</th>
                                    <th className="px-6 py-4 text-right">Hi-Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {leaderboardData.map((player, index) => (
                                    <tr key={index} className={`hover:bg-secondary/20 transition-colors ${session?.user?.name === player.username ? "bg-primary/10" : ""}`}>
                                        <td className="px-6 py-4">
                                            {index + 1 <= 3 ? <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">{index + 1}</span> : index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/user/${player.bancho_id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                                <Image src={player.avatar_url} alt={player.username} width={32} height={32} className="rounded-full" />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{player.username}</span>
                                                    {player.bancho_id === 17279598 && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Owner</span>}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">{Number(player.total_score).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-mono">{player.games_played}</td>
                                        <td className="px-6 py-4 text-right font-mono">{player.highest_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-foreground/70">
                        <p>No players found for this game mode.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-sm text-foreground/50">
                <p>Leaderboard updates every minute</p>
            </div>
        </div>
    );
}
