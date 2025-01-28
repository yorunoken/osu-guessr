import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserNotFound() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-4xl font-bold mb-4">User Not Found</h1>

                    <div className="space-y-4 mb-8">
                        <p className="text-foreground/70">
                            Sorry, we couldn{"'"}t find the user you{"'"}re looking for.
                        </p>
                        <p className="text-foreground/70">The user might not exist or hasn{"'"}t signed up for osu!guessr yet.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button className="w-full sm:w-auto">Return Home</Button>
                        </Link>
                        <Link href="/leaderboard">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Check Leaderboard
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-sm text-foreground/50">If you believe this is an error, please contact support or try again later.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
