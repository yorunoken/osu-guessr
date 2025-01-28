"use client";

import { Loader2 } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";

function AuthContent({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">Loading osu!guessr</h2>
                        <p className="text-sm text-muted-foreground">Preparing your session...</p>
                    </div>

                    <div className="max-w-sm mx-auto mt-8 p-4 bg-card rounded-lg border border-border/50">
                        <p className="text-sm text-foreground/70">Did you know? I didn{"'"}t either!</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function SessionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthContent>{children}</AuthContent>
        </SessionProvider>
    );
}
