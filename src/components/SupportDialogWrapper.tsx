"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useTranslationsContext } from "@/context/translations-provider";
import Link from "next/link";

export function SupportPageLink() {
    const { t } = useTranslationsContext();

    return (
        <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10" asChild>
            <Link href="/support" target="_blank">
                <Heart className="h-5 w-5 mr-2" />
                <span className="inline">{t.common.support}</span>
            </Link>
        </Button>
    );
}
