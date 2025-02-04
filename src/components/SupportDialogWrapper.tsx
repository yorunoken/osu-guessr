"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslationsContext } from "@/context/translations-provider";

const DONATION_LINKS = [
    {
        key: "coffee",
        url: "https://www.buymeacoffee.com/yorunoken",
    },
] as const;

export function SupportDialogWrapper() {
    const [showDialog, setShowDialog] = useState(false);
    const { t } = useTranslationsContext();

    return (
        <>
            <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10" onClick={() => setShowDialog(true)}>
                <Heart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Support</span>
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.support.dialog.title}</DialogTitle>
                        <DialogDescription>{t.support.dialog.description}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {DONATION_LINKS.map((link) => (
                            <a
                                key={link.key}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                            >
                                <span className="font-medium">{t.support.dialog.options[link.key].title}</span>
                                <span className="text-sm text-muted-foreground">{t.support.dialog.options[link.key].description}</span>
                            </a>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
