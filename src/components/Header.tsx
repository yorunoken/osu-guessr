"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import UserSearch from "./UserSearch";
import { Menu } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslationsContext } from "@/context/translations-provider";
import { SupportPageLink } from "./SupportDialogWrapper";
import { OWNER_ID } from "@/lib";

const NAV_ITEMS = ["leaderboard", "about"] as const;

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useTranslationsContext();

    return (
        <header className="bg-background/95 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                        osu!guessr
                    </Link>
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 items-center">
                            {NAV_ITEMS.map((item) => (
                                <li key={item}>
                                    <Link href={`/${item}`} className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium">
                                        {t.components.header.nav[item]}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <UserSearch />
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="hidden md:block">
                        <SupportPageLink />
                    </div>

                    <Button variant="ghost" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>

                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                    <Image src={session.user?.image || "/default-avatar.png"} alt="Avatar" className="rounded-full" fill style={{ objectFit: "cover" }} />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href={`/user/${session.user.banchoId}`} className="flex items-center">
                                        <div className="relative h-8 w-8 rounded-full mr-2">
                                            <Image src={session.user?.image || "/default-avatar.png"} alt="Avatar" className="rounded-full" fill style={{ objectFit: "cover" }} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{session.user.name}</span>
                                            <span className="text-xs text-muted-foreground">{t.components.header.nav.viewProfile}</span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                {session.user.banchoId === OWNER_ID && (
                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                        <Link href="/admin">Admin</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/settings">{t.components.header.nav.settings}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                                    {t.components.header.nav.signOut}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => signIn("osu")}>{t.components.header.nav.signIn}</Button>
                    )}
                </div>

                <nav
                    className={`${
                        isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    } md:hidden overflow-hidden transition-all duration-200 ease-in-out absolute top-full left-0 w-full bg-background shadow-md`}
                >
                    <ul className="flex flex-col space-y-4 items-center py-4">
                        <li className="w-full px-4">
                            <UserSearch />
                        </li>
                        {NAV_ITEMS.map((item) => (
                            <li className="flex items-center w-full" key={item}>
                                <Link
                                    href={`/${item}`}
                                    className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium w-full text-center px-4 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.components.header.nav[item]}
                                </Link>
                            </li>
                        ))}
                        <li className="flex items-center w-full">
                            <div className="w-full text-center px-4 py-2" onClick={() => setIsMenuOpen(false)}>
                                <SupportPageLink />
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
