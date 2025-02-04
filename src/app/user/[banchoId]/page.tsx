import { getUserStatsAction, getUserLatestGamesAction, getUserByIdAction, getUserTopGamesAction, Game } from "@/actions/user-server";
import Image from "next/image";
import UserNotFound from "./NotFound";
import { Metadata } from "next";
import Link from "next/link";
import { GameVariant } from "@/app/games/config";

type GameModes = "background" | "audio" | "skin";

interface GameStats {
    game_mode: GameModes;
    total_score: number;
    games_played: number;
    highest_streak: number;
    highest_score: number;
    last_played: Date;
}

const gamemodes: Array<GameModes> = ["audio", "background", "skin"];

interface Props {
    params: Promise<{ banchoId: string }>;
    searchParams: Promise<{ mode?: string; variant?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { banchoId } = await params;
    const { mode = "background" } = await searchParams;
    const user = await getUserByIdAction(Number(banchoId));

    return {
        title: user ? `${user.username}'s ${mode} Stats | osu!guessr` : "User Profile | osu!guessr",
        description: user ? `Check out ${user.username}'s ${mode} mode statistics and achievements on osu!guessr` : "View player statistics and achievements on osu!guessr",
    };
}

export default async function UserProfile({ params, searchParams }: Props) {
    const { banchoId } = await params;
    const { mode = "background", variant = "classic" } = await searchParams;
    const currentMode = mode as GameModes;
    const currentVariant = variant as GameVariant;

    const userStats = await getUserStatsAction(Number(banchoId));
    const user = await getUserByIdAction(Number(banchoId));
    let userGames = await getUserLatestGamesAction(Number(banchoId), undefined, currentVariant);
    const topPlays = await getUserTopGamesAction(Number(banchoId), undefined, currentVariant);

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

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    userGames = userGames.filter((x) => new Date(x.ended_at) > twentyFourHoursAgo);

    if (!user) {
        return UserNotFound();
    }

    const { username, avatar_url, achievements, ranks } = user;

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
                        <StatBox label="Hi-Score" value={Math.max(...(achievements?.map((a) => a.highest_score) ?? [0])).toLocaleString()} />
                        <StatBox label="Total Games" value={achievements?.reduce((sum, a) => sum + a.games_played, 0).toLocaleString() ?? "0"} />
                        <StatBox label="Global Rank" value={ranks?.globalRank?.toLocaleString() ?? "-"} />
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
                            {mode}
                        </Link>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Link
                        href={`/user/${banchoId}?mode=${currentMode}&variant=classic`}
                        className={`min-w-[120px] text-center px-4 py-2 rounded-lg ${currentVariant === "classic" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary/10"}`}
                    >
                        Classic Mode
                    </Link>
                    <Link
                        href={`/user/${banchoId}?mode=${currentMode}&variant=death`}
                        className={`min-w-[120px] text-center px-4 py-2 rounded-lg ${
                            currentVariant === "death" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-card hover:bg-destructive/10 hover:text-destructive"
                        }`}
                    >
                        Death Mode
                    </Link>
                </div>
            </div>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-center capitalize">Game Statistics ({currentMode})</h2>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                    {gameStats[currentMode].games_played > 0 ? (
                        <div className="space-y-4">
                            {currentVariant === "classic" && <StatItem label="Total Score" value={gameStats[currentMode].total_score.toLocaleString()} />}
                            <StatItem label="Games Played" value={gameStats[currentMode].games_played.toString()} />
                            <StatItem
                                label={currentVariant === "classic" ? "Highest Score" : "Best Streak"}
                                value={currentVariant === "classic" ? gameStats[currentMode].highest_score.toLocaleString() : gameStats[currentMode].highest_streak.toString()}
                            />
                            <StatItem label="Last Played" value={gameStats[currentMode].last_played.toLocaleDateString()} />
                        </div>
                    ) : (
                        <div className="text-center py-4 text-foreground/70">No plays yet</div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-center capitalize">Top Games ({currentMode})</h2>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                    <div className="space-y-4">
                        {topPlaysByMode[currentMode]?.slice(0, 5).map((game, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground/70">#{index + 1}</span>
                                    {currentVariant === "classic" ? <span>{game.points.toLocaleString()} points</span> : <span>{game.streak}x streak</span>}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/70">
                                    {currentVariant === "classic" && <span>{game.streak}x</span>}
                                    <span>{new Date(game.ended_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {(!topPlaysByMode[currentMode] || topPlaysByMode[currentMode].length === 0) && <div className="text-center py-4 text-foreground/70">No plays yet</div>}
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Recent Games</h2>
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
                            <h3 className="text-center text-foreground/70 py-4">No games played in the last 24 hours</h3>
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
