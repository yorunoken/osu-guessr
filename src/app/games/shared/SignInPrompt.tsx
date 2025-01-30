"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPrompt() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card rounded-xl p-8 border border-border/50">
                    <h1 className="text-3xl font-bold mb-6">Sign in Required</h1>

                    <div className="space-y-4 mb-8">
                        <p className="text-foreground/70">You need to be signed in with your osu! account to play osu!guessr.</p>
                        <p className="text-foreground/70">Sign in to track your scores, compete on the leaderboard, and save your progress!</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => signIn("osu")} className="w-full sm:w-auto">
                            Sign in with osu!
                        </Button>
                        <Link href="/">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Return Home
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-sm text-foreground/50">
                            Don{"'"}t have an osu! account?{" "}
                            <a href="https://osu.ppy.sh/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Create one here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
