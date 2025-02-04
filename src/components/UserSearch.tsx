"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { searchUsersAction } from "@/actions/user-server";
import { useTranslations } from "@/hooks/use-translations";

interface SearchResult {
    bancho_id: number;
    username: string;
    avatar_url: string;
}

export default function UserSearch() {
    const { t } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const searchResults = await searchUsersAction(query);
                    setResults(searchResults);
                } catch (error) {
                    console.error("Search failed:", error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Search className="h-4 w-4" />
                    <span className="text-muted-foreground inline">{t.user.search.title}</span>
                    <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                        {t.user.search.shortcut}
                    </kbd>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-3xl">
                <VisuallyHidden>
                    <DialogTitle>{t.user.search.title}</DialogTitle>
                    <DialogDescription>{t.user.search.description}</DialogDescription>
                </VisuallyHidden>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
                        <Input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.user.search.placeholder} className="pl-9 pr-4" />
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                        <div className="p-8 text-center text-foreground/70">{t.user.search.searching}</div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((user) => (
                                <Link
                                    key={user.bancho_id.toString()}
                                    href={`/user/${user.bancho_id.toString()}`}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                                    onClick={() => handleSelect()}
                                >
                                    <Image src={user.avatar_url || "/placeholder.svg"} alt={user.username} width={40} height={40} className="rounded-full" />
                                    <span className="font-medium">{user.username}</span>
                                </Link>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-8 text-center text-foreground/70">{t.user.search.noResults}</div>
                    ) : (
                        <div className="p-8 text-center text-foreground/70">{t.user.search.startTyping}</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
