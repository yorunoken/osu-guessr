import { Metadata } from "next";
import { GameVariant } from "@/app/games/config";
import UserProfileClient from "./client";
import { GameMode } from "@/actions/types";

interface Props {
    params: Promise<{ banchoId: string }>;
    searchParams: Promise<{ mode?: string; variant?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `User Profile | osu!guessr`,
        description: `View player statistics and achievements on osu!guessr`,
    };
}

export default async function UserProfile({ params, searchParams }: Props) {
    const { banchoId } = await params;
    const { mode = "background", variant = "classic" } = await searchParams;
    const currentMode = mode as GameMode;
    const currentVariant = variant as GameVariant;

    return <UserProfileClient currentMode={currentMode} currentVariant={currentVariant} banchoId={banchoId} />;
}
