import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ComingSoonProps {
    mode: "Audio" | "Skin";
}

export default function ComingSoon({ mode }: ComingSoonProps) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-3xl font-bold mb-6">{mode} Guessr</h1>

                    <div className="space-y-6 mb-8">
                        <div className="py-8">
                            <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
                            <p className="text-foreground/70">
                                We{"'"}re working hard to bring you the {mode.toLowerCase()} guessing game mode. Stay tuned for updates!
                            </p>
                        </div>

                        <div className="bg-secondary/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-3">What to expect:</h3>
                            {mode === "Audio" ? (
                                <p className="text-foreground/70">Test your music knowledge by identifying osu! songs from short audio clips. How many can you recognize?</p>
                            ) : (
                                <p className="text-foreground/70">Challenge yourself to recognize popular osu! skins from gameplay screenshots. Perfect for skin enthusiasts!</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/">
                            <Button>Back to Home</Button>
                        </Link>
                        <Link href="/games/background">
                            <Button variant="outline">Try Background Guessr</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
