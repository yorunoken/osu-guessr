"use client";

import { Game, UserAchievement } from "@/actions/user-server";
import Image from "next/image";
import Link from "next/link";
import { GameVariant } from "@/app/games/config";
import { useTranslationsContext } from "@/context/translations-provider";

type GameModes = "background" | "audio" | "skin";

interface GameStats {
    game_mode: GameModes;
    total_score: number;
    games_played: number;
    highest_streak: number;
    highest_score: number;
    last_played: Date;
}

interface UserRanks {
    globalRank?: {
        classic?: number;
        death?: number;
    };
    modeRanks: {
        [key in GameModes]: {
            classic?: number;
            death?: number;
        };
    };
}

const gamemodes: Array<GameModes> = ["audio", "background", "skin"];

interface UserProfileClientProps {
    user: {
        username: string;
        avatar_url: string;
        achievements: UserAchievement[];
        ranks: UserRanks;
        special_badge?: string;
        special_badge_color?: string;
    };
    userStats: UserAchievement[];
    userGames: Game[];
    topPlays: Game[];
    currentMode: GameModes;
    currentVariant: GameVariant;
    banchoId: string;
}

export default function UserProfileClient({ user, userStats, userGames, topPlays, currentMode, currentVariant, banchoId }: UserProfileClientProps) {
    const { t } = useTranslationsContext();
    const { username, avatar_url, achievements, ranks } = user;

    const topPlaysByMode = topPlays.reduce(
        (acc, game) => {
            if (!acc[game.game_mode]) {
                acc[game.game_mode] = [];
            }
            acc[game.game_mode].push(game);
            return acc;
        },
        {} as Record<GameModes, Array<Game>>,
    );

    const gameStats: Record<GameModes, GameStats> = {
        background: {
            game_mode: "background",
            total_score: 0,
            games_played: 0,
            highest_streak: 0,
            highest_score: 0,
            last_played: new Date(0),
        },
        audio: {
            game_mode: "audio",
            total_score: 0,
            games_played: 0,
            highest_streak: 0,
            highest_score: 0,
            last_played: new Date(0),
        },
        skin: {
            game_mode: "skin",
            total_score: 0,
            games_played: 0,
            highest_streak: 0,
            highest_score: 0,
            last_played: new Date(0),
        },
    };

    userStats.forEach((stat) => {
        if (stat.game_mode) {
            gameStats[stat.game_mode] = {
                game_mode: stat.game_mode,
                total_score: stat.total_score,
                games_played: stat.games_played,
                highest_streak: stat.highest_streak,
                highest_score: stat.highest_score,
                last_played: new Date(stat.last_played),
            };
        }
    });

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
            <div className="flex items-center gap-6 bg-card p-8 rounded-xl">
                <div className="relative h-32 w-32">
                    <Image src={avatar_url} alt={username} fill className="rounded-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href={`https://osu.ppy.sh/u/${banchoId}`} target="_blank" rel="noopener noreferrer" className="text-4xl font-bold hover:text-primary transition-colors">
                            {username}
                        </Link>
                        {user.special_badge && (
                            <span
                                className={`px-2 py-1 rounded text-sm`}
                                style={{
                                    backgroundColor: user.special_badge_color ? `${user.special_badge_color}10` : "var(--primary-10)",
                                    color: user.special_badge_color || "var(--primary)",
                                }}
                            >
                                {user.special_badge}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <StatBox label={t.user.profile.stats.hiScore} value={Math.max(...(achievements?.map((a) => a.highest_score) ?? [0])).toLocaleString()} />
                        <StatBox label={t.user.profile.stats.totalGames} value={achievements?.reduce((sum, a) => sum + a.games_played, 0).toLocaleString() ?? "0"} />
                        <StatBox
                            label={t.user.profile.stats.globalRank}
                            value={currentVariant === "classic" ? (ranks?.globalRank?.classic?.toLocaleString() ?? "-") : (ranks?.globalRank?.death?.toLocaleString() ?? "-")}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center gap-4">
                    {gamemodes.map((mode) => (
                        <Link
                            key={mode}
                            href={`/user/${banchoId}?mode=${mode}&variant=${currentVariant}`}
                            className={`px-4 py-2 rounded-lg capitalize ${currentMode === mode ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10"}`}
                        >
                            {t.leaderboard.filters.mode[mode]}
                        </Link>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Link
                        href={`/user/${banchoId}?mode=${currentMode}&variant=classic`}
                        className={`min-w-[120px] text-center px-4 py-2 rounded-lg ${currentVariant === "classic" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10"}`}
                    >
                        {t.leaderboard.filters.variant.classic}
                    </Link>
                    <Link
                        href={`/user/${banchoId}?mode=${currentMode}&variant=death`}
                        className={`min-w-[120px] text-center px-4 py-2 rounded-lg ${
                            currentVariant === "death" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-card hover:bg-destructive/10 hover:text-destructive"
                        }`}
                    >
                        {t.leaderboard.filters.variant.death}
                    </Link>
                </div>
            </div>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-center capitalize">
                    {t.user.profile.gameStats.title} ({currentMode})
                </h2>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                    {gameStats[currentMode].games_played > 0 ? (
                        <div className="space-y-4">
                            {currentVariant === "classic" && (
                                <>
                                    <StatItem label={t.user.profile.gameStats.totalScore} value={gameStats[currentMode].total_score.toLocaleString()} />
                                    <StatItem label={t.user.profile.gameStats.modeRank} value={ranks.modeRanks[currentMode].classic?.toLocaleString() ?? "-"} />
                                </>
                            )}
                            {currentVariant === "death" && <StatItem label={t.user.profile.gameStats.modeRank} value={ranks.modeRanks[currentMode].death?.toLocaleString() ?? "-"} />}
                            <StatItem label={t.user.profile.gameStats.gamesPlayed} value={gameStats[currentMode].games_played.toString()} />
                            <StatItem
                                label={currentVariant === "classic" ? t.user.profile.gameStats.highestScore : t.user.profile.gameStats.bestStreak}
                                value={currentVariant === "classic" ? gameStats[currentMode].highest_score.toLocaleString() : gameStats[currentMode].highest_streak.toString()}
                            />
                            <StatItem label={t.user.profile.gameStats.lastPlayed} value={gameStats[currentMode].last_played.toLocaleDateString()} />
                        </div>
                    ) : (
                        <div className="text-center py-4 text-foreground/70">{t.user.profile.noPlays}</div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-center capitalize">
                    {t.user.profile.topGames.title} ({currentMode})
                </h2>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                    <div className="space-y-4">
                        {topPlaysByMode[currentMode]?.slice(0, 5).map((game, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground/70">#{index + 1}</span>
                                    {currentVariant === "classic" ? (
                                        <span>{t.user.profile.topGames.points.replace("{points}", game.points.toLocaleString())}</span>
                                    ) : (
                                        <span>{t.user.profile.topGames.streak.replace("{count}", game.streak.toString())}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/70">
                                    {currentVariant === "classic" && <span>{game.streak}x</span>}
                                    <span>{new Date(game.ended_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {(!topPlaysByMode[currentMode] || topPlaysByMode[currentMode].length === 0) && <div className="text-center py-4 text-foreground/70">{t.user.profile.noPlays}</div>}
                    </div>
                </div>
            </section>

            {/* Recent Games */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">{t.user.profile.recentGames.title}</h2>
                <div className="bg-card rounded-xl border border-border/50">
                    {userGames.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {userGames.map((game, index) => (
                                <div key={index} className="p-4 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium capitalize">{game.game_mode} Mode</span>
                                        <span className="text-foreground/70 ml-4">{new Date(game.ended_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="space-x-4">
                                        {currentVariant === "classic" && <span className="font-semibold">{game.points.toLocaleString()} score</span>}
                                        <span className="font-semibold">{game.streak}x streak</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <h3 className="text-center text-foreground/70 py-4">{t.user.profile.recentGames.noGames}</h3>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-foreground/70">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-background/50 p-3 rounded-lg">
            <div className="text-sm text-foreground/70">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );
}
