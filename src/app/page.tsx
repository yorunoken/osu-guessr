import { Suspense } from "react";
import Hero from "./components/Hero";
import GameModeCards from "./components/GameModeCards";
import HomeContent from "./HomeContent";
import LoadingFallback from "./LoadingFallback";
import { getHighestStatsAction } from "@/actions/user-server";
import { readChangelogs } from "@/actions/changelogs";

export const dynamic = "force-dynamic";

export default async function Home() {
    const [changelogs, highStats] = await Promise.all([readChangelogs(), getHighestStatsAction()]);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <main className="flex-grow">
                <Hero />
                <GameModeCards />
                <Suspense fallback={<LoadingFallback />}>
                    <HomeContent changelogs={changelogs} highStats={highStats} />
                </Suspense>
            </main>
        </div>
    );
}
