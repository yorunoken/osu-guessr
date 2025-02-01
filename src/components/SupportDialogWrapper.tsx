"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DONATION_LINKS = [
    {
        name: "Buy me a Coffee",
        url: "https://www.buymeacoffee.com/yorunoken",
        description: "Support with a one-time donation",
    },
    {
        name: "Ko-fi",
        url: "https://ko-fi.com/yorunoken",
        description: "Buy me a coffee through Ko-fi",
    },
];

export function SupportDialogWrapper() {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
            <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10" onClick={() => setShowDialog(true)}>
                <Heart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Support</span>
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Support osu!guessr</DialogTitle>
                        <DialogDescription>
                            If you enjoy using osu!guessr and want to support its development, consider making a donation. Your support helps keep the servers running and enables new features! Leave your name
                            with your donation to be featured on the homepage.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {DONATION_LINKS.map((link, index) => (
                            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                                <span className="font-medium">{link.name}</span>
                                <span className="text-sm text-muted-foreground">{link.description}</span>
                            </a>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
