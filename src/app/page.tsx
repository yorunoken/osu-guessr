import { Suspense } from "react";
import Hero from "./components/Hero";
import GameModeCards from "./components/GameModeCards";
import HomeContent from "./HomeContent";
import LoadingFallback from "./LoadingFallback";

export const dynamic = "force-dynamic";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <main className="flex-grow">
                <Hero />
                <GameModeCards />
                <Suspense fallback={<LoadingFallback />}>
                    <HomeContent />
                </Suspense>
            </main>
        </div>
    );
}
