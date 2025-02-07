"use client";

import { Button } from "@/components/ui/button";
import { Heart, Link } from "lucide-react";
import { useTranslationsContext } from "@/context/translations-provider";

export function SupportPageLink() {
    const { t } = useTranslationsContext();

    return (
        <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10" asChild>
            <Link href="/support" target="_blank">
                <Heart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{t.common.support}</span>
            </Link>
        </Button>
    );
}
