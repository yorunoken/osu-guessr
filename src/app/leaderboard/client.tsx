"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTopPlayersAction, TopPlayer } from "@/actions/user-server";
import { GameVariant } from "@/app/games/config";

type GameMode = "background" | "audio" | "skin";

export default function LeaderboardClient() {
    const { data: session } = useSession();
    const [selectedMode, setSelectedMode] = useState<GameMode>("background");
    const [selectedVariant, setSelectedVariant] = useState<GameVariant>("classic");
    const [leaderboardData, setLeaderboardData] = useState<Array<TopPlayer>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTopPlayersAction(selectedMode, selectedVariant, 100);
                setLeaderboardData(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setError(error instanceof Error ? error.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeaderboard();
    }, [selectedMode, selectedVariant]);

    const gameModes: GameMode[] = ["background", "audio", "skin"];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>

            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-center gap-4">
                    {gameModes.map((mode) => (
                        <Button key={mode} variant={selectedMode === mode ? "default" : "outline"} onClick={() => setSelectedMode(mode)} className="capitalize">
                            {mode}
                        </Button>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        variant={selectedVariant === "classic" ? "default" : "outline"}
                        onClick={() => setSelectedVariant("classic")}
                        className={`min-w-[120px] ${selectedVariant === "classic" ? "bg-primary" : ""}`}
                    >
                        Classic Mode
                    </Button>
                    <Button
                        variant={selectedVariant === "death" ? "default" : "outline"}
                        onClick={() => setSelectedVariant("death")}
                        className={`min-w-[120px] ${
                            selectedVariant === "death" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        }`}
                    >
                        Death Mode
                    </Button>
                </div>
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
                                    {selectedVariant === "classic" && <th className="px-6 py-4 text-right">Total Score</th>}
                                    <th className="px-6 py-4 text-right">Games Played</th>
                                    <th className="px-6 py-4 text-right">{selectedVariant === "classic" ? "Hi-Score" : "Best Streak"}</th>
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
                                                    {player.special_badge && (
                                                        <span
                                                            className="text-xs px-1.5 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: player.special_badge_color ? `${player.special_badge_color}10` : "var(--primary-10)",
                                                                color: player.special_badge_color || "var(--primary)",
                                                            }}
                                                        >
                                                            {player.special_badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        {selectedVariant === "classic" && <td className="px-6 py-4 text-right font-mono">{Number(player.total_score).toLocaleString()}</td>}
                                        <td className="px-6 py-4 text-right font-mono">{player.games_played}</td>
                                        <td className="px-6 py-4 text-right font-mono">{selectedVariant === "classic" ? player.highest_score : player.highest_streak}</td>
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
        </div>
    );
}
