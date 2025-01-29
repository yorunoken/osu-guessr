"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import UserSearch from "./UserSearch";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        osu!guessr
                    </Link>
                    <span className="hidden sm:block text-foreground/30">|</span>
                    <nav className="hidden sm:block">
                        <ul className="flex space-x-6 items-center">
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

                <div className="flex items-center">
                    <Button variant="ghost" className="sm:hidden mr-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Image src={session.user?.image || "/default-avatar.png"} alt="Avatar" className="rounded-full" fill />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link href={`/user/${session.user.banchoId}`}>Profile</Link>
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
                    } sm:hidden overflow-hidden transition-all duration-200 ease-in-out absolute top-full left-0 w-full bg-background`}
                >
                    <ul className="flex flex-col space-y-4 items-center pb-4">
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
