import { getUserStatsAction, getUserLatestGamesAction, getUserByIdAction, getUserTopGamesAction, UserRanks } from "@/actions/user-server";
import UserNotFound from "./NotFound";
import { Metadata } from "next";
import { GameVariant } from "@/app/games/config";
import UserProfileClient from "./client";

type GameModes = "background" | "audio" | "skin";

interface Props {
    params: Promise<{ banchoId: string }>;
    searchParams: Promise<{ mode?: string; variant?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { banchoId } = await params;
    const { mode = "background" } = await searchParams;
    const user = await getUserByIdAction(Number(banchoId));

    return {
        title: user ? `${user.username}'s ${mode} Stats | {osu_guessr}` : "User Profile | {osu_guessr}",
        description: user ? `Check out ${user.username}'s ${mode} mode statistics and achievements on {osu_guessr}` : "View player statistics and achievements on {osu_guessr}",
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

    if (!user) {
        return <UserNotFound />;
    }

    const defaultRanks: UserRanks = {
        globalRank: undefined,
        modeRanks: {
            background: { globalRank: undefined },
            audio: { globalRank: undefined },
            skin: { globalRank: undefined },
        },
    };

    const userWithDefaults = {
        ...user,
        achievements: user.achievements || [],
        ranks: user.ranks || defaultRanks,
    };

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    userGames = userGames.filter((x) => new Date(x.ended_at) > twentyFourHoursAgo);

    return <UserProfileClient user={userWithDefaults} userStats={userStats} userGames={userGames} topPlays={topPlays} currentMode={currentMode} currentVariant={currentVariant} banchoId={banchoId} />;
}
