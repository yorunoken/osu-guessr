"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "lucide-react";
import { getTopPlayersAction } from "@/actions/user-server";
import type { GameMode, TopPlayer } from "@/actions/types";
import type { GameVariant } from "@/app/games/config";
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
    const [orderMetric, setOrderMetric] = useState<"total" | "highest">("highest");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const errorMessage = t.notifications.error;

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true);
            setError(null);

            try {
                const offset = (page - 1) * pageSize;
                const data = await getTopPlayersAction(selectedMode, selectedVariant, pageSize, orderMetric, offset);
                setLeaderboardData(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setError(error instanceof Error ? error.message : errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeaderboard();
    }, [selectedMode, selectedVariant, orderMetric, page, pageSize, errorMessage]);

    const gameModes: GameMode[] = ["background", "audio", "skin"];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">{t.leaderboard.title}</h1>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Mode:</span>
                    <Select value={selectedMode} onValueChange={(value: GameMode) => setSelectedMode(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {gameModes.map((mode) => (
                                <SelectItem key={mode} value={mode} className="capitalize">
                                    {t.leaderboard.filters.mode[mode]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Variant:</span>
                    <div className="flex rounded-md border">
                        <Button variant={selectedVariant === "classic" ? "default" : "ghost"} size="sm" onClick={() => setSelectedVariant("classic")} className="rounded-r-none border-r">
                            {t.leaderboard.filters.variant.classic}
                        </Button>
                        <Button variant={selectedVariant === "death" ? "destructive" : "ghost"} size="sm" onClick={() => setSelectedVariant("death")} className="rounded-l-none">
                            {t.leaderboard.filters.variant.death}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-6 py-4 text-left">{t.leaderboard.table.rank}</th>
                                <th className="px-6 py-4 text-left">{t.leaderboard.table.player}</th>
                                {selectedVariant === "classic" && (
                                    <th className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setOrderMetric("total")} className="h-auto p-0 font-semibold hover:bg-transparent">
                                            {t.leaderboard.table.totalScore}
                                            {orderMetric === "total" && <ChevronDownIcon className="ml-1 h-3 w-3" />}
                                        </Button>
                                    </th>
                                )}
                                <th className="px-6 py-4 text-right">{t.leaderboard.table.gamesPlayed}</th>
                                <th className="px-6 py-4 text-right">
                                    {selectedVariant === "classic" ? (
                                        <Button variant="ghost" size="sm" onClick={() => setOrderMetric("highest")} className="h-auto p-0 font-semibold hover:bg-transparent">
                                            {t.leaderboard.table.hiScore}
                                            {orderMetric === "highest" && <ChevronDownIcon className="ml-1 h-3 w-3" />}
                                        </Button>
                                    ) : (
                                        t.leaderboard.table.bestStreak
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={selectedVariant === "classic" ? 5 : 4} className="p-8 text-center">
                                        {t.common.loading}
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={selectedVariant === "classic" ? 5 : 4} className="p-8 text-center text-destructive">
                                        <p>{error}</p>
                                    </td>
                                </tr>
                            ) : leaderboardData.length > 0 ? (
                                leaderboardData.map((player, index) => (
                                    <tr key={index} className={`hover:bg-secondary/20 transition-colors ${session?.user?.name === player.username ? "bg-primary/10" : ""}`}>
                                        <td className="px-6 py-4">
                                            {(index + 1 <= 3) && page < 1 ? (
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                                                    {(page - 1) * pageSize + index + 1}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground font-mono">{(page - 1) * pageSize + index + 1}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/user/${player.bancho_id}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                                                <Image
                                                    src={player.avatar_url || "/placeholder.svg"}
                                                    alt={player.username}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{player.username}</span>
                                                    {player.badges &&
                                                        player.badges.map((badge, badgeIndex) => (
                                                            <Badge
                                                                key={badgeIndex}
                                                                variant="secondary"
                                                                className="text-xs"
                                                                style={{
                                                                    backgroundColor: `${badge.color}15`,
                                                                    color: badge.color,
                                                                    borderColor: `${badge.color}30`,
                                                                }}
                                                            >
                                                                {badge.name}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </Link>
                                        </td>
                                        {selectedVariant === "classic" && <td className="px-6 py-4 text-right font-mono text-sm">{BigInt(player.total_score).toLocaleString()}</td>}
                                        <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">{player.games_played}</td>
                                        <td className="px-6 py-4 text-right font-mono text-sm font-semibold">{selectedVariant === "classic" ? player.highest_score : player.highest_streak}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={selectedVariant === "classic" ? 5 : 4} className="p-8 text-center text-foreground/70">
                                        <p>{t.leaderboard.empty}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4 mt-4">
                <div />

                <div className="flex items-center justify-center">
                    <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        {"Prev"}
                    </Button>
                    <span className="text-sm text-muted-foreground mx-3">Page {page}</span>
                    <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={leaderboardData.length < pageSize}>
                        {"Next"}
                    </Button>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">Page size</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                            setPageSize(Number(v));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 25, 50, 100].map((s) => (
                                <SelectItem key={s} value={String(s)}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <AdSlider />
        </div>
    );
}
