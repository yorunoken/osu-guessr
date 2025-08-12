"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTopPlayersAction } from "@/actions/user-server";
import { GameMode, TopPlayer } from "@/actions/types";
import { GameVariant } from "@/app/games/config";
import { useTranslationsContext } from "@/context/translations-provider";
import { AdSlider } from "@/components/Ads";

export default function LeaderboardClient() {
    const { t } = useTranslationsContext();
    const { data: session } = useSession();
    const [selectedMode, setSelectedMode] = useState<GameMode>("background");
    const [selectedVariant, setSelectedVariant] = useState<GameVariant>("classic");
    const [leaderboardData, setLeaderboardData] = useState<Array<TopPlayer>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const errorMessage = t.notifications.error;

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTopPlayersAction(selectedMode, selectedVariant, 100);
                setLeaderboardData(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setError(error instanceof Error ? error.message : errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeaderboard();
    }, [selectedMode, selectedVariant, errorMessage]);

    const gameModes: GameMode[] = ["background", "audio", "skin"];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">{t.leaderboard.title}</h1>

            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-center gap-4">
                    {gameModes.map((mode) => (
                        <Button key={mode} variant={selectedMode === mode ? "default" : "outline"} onClick={() => setSelectedMode(mode)} className="capitalize">
                            {t.leaderboard.filters.mode[mode]}
                        </Button>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        variant={selectedVariant === "classic" ? "default" : "outline"}
                        onClick={() => setSelectedVariant("classic")}
                        className={`min-w-[120px] ${selectedVariant === "classic" ? "bg-primary" : ""}`}
                    >
                        {t.leaderboard.filters.variant.classic}
                    </Button>
                    <Button
                        variant={selectedVariant === "death" ? "default" : "outline"}
                        onClick={() => setSelectedVariant("death")}
                        className={`min-w-[120px] ${
                            selectedVariant === "death" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        }`}
                    >
                        {t.leaderboard.filters.variant.death}
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">{t.common.loading}</div>
                ) : error ? (
                    <div className="p-8 text-center text-destructive">
                        <p>{error}</p>
                    </div>
                ) : leaderboardData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-4 text-left">{t.leaderboard.table.rank}</th>
                                    <th className="px-6 py-4 text-left">{t.leaderboard.table.player}</th>
                                    {selectedVariant === "classic" && <th className="px-6 py-4 text-right">{t.leaderboard.table.totalScore}</th>}
                                    <th className="px-6 py-4 text-right">{t.leaderboard.table.gamesPlayed}</th>
                                    <th className="px-6 py-4 text-right">{selectedVariant === "classic" ? t.leaderboard.table.hiScore : t.leaderboard.table.bestStreak}</th>
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
                                                    {player.badges &&
                                                        player.badges.map((badge, badgeIndex) => (
                                                            <span
                                                                key={badgeIndex}
                                                                className="text-xs px-1.5 py-0.5 rounded"
                                                                style={{
                                                                    backgroundColor: `${badge.color}10`,
                                                                    color: badge.color,
                                                                }}
                                                            >
                                                                {badge.name}
                                                            </span>
                                                        ))}
                                                </div>
                                            </Link>
                                        </td>
                                        {selectedVariant === "classic" && <td className="px-6 py-4 text-right font-mono">{BigInt(player.total_score).toLocaleString()}</td>}
                                        <td className="px-6 py-4 text-right font-mono">{player.games_played}</td>
                                        <td className="px-6 py-4 text-right font-mono">{selectedVariant === "classic" ? player.highest_score : player.highest_streak}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-foreground/70">
                        <p>{t.leaderboard.empty}</p>
                    </div>
                )}
            </div>

            <AdSlider />
        </div>
    );
}
