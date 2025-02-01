"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import UserSearch from "./UserSearch";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SupportDialogWrapper } from "./SupportDialogWrapper";

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-background/95 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                        osu!guessr
                    </Link>
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 items-center">
                            {["Leaderboard", "About"].map((item) => (
                                <li key={item}>
                                    <Link href={"/" + item.toLowerCase()} className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium">
                                        {item}
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
                    <SupportDialogWrapper />

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
                                            <span className="text-xs text-muted-foreground">View Profile</span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => signIn("osu")}>Sign In</Button>
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
                        {["Leaderboard", "About"].map((item) => (
                            <li className="flex items-center w-full" key={item}>
                                <Link
                                    href={"/" + item.toLowerCase()}
                                    className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium w-full text-center px-4 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
