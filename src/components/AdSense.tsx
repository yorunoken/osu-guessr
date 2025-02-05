"use client";

declare global {
    interface Window {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        adsbygoogle: any[];
    }
}

import { useEffect } from "react";

export function AdPlaceholder() {
    return (
        <div className="w-full bg-card/50 border border-dashed border-border rounded-lg p-6 my-8">
            <div className="text-center text-muted-foreground">
                <p className="font-medium">Advertisement</p>
                <p className="text-sm">Ads coming soon to help support osu!guessr</p>
            </div>
        </div>
    );
}

export function AdSense({ slot }: { slot: string }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className="w-full my-8">
            <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client="ca-pub-3511683752810096" data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
        </div>
    );
}
