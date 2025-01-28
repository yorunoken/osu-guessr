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
                <Link href="/" className="text-2xl font-bold text-primary">
                    osu!guessr
                </Link>
                <Button variant="ghost" className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
                <nav
                    className={`${
                        isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    } sm:max-h-none sm:opacity-100 overflow-hidden transition-all duration-200 ease-in-out sm:block absolute sm:relative top-full left-0 w-full sm:w-auto bg-background sm:bg-transparent`}
                >
                    <ul className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center pb-4 sm:pb-0">
                        <li className="w-full sm:w-auto px-4 sm:px-0">
                            <UserSearch />
                        </li>
                        {["Leaderboard", "About"].map((item) => (
                            <li className="flex items-center w-full sm:w-auto" key={item}>
                                <Link
                                    href={"/" + item.toLowerCase()}
                                    className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium w-full sm:w-auto text-center sm:text-left px-4 sm:px-0 py-2 sm:py-0"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                        {session ? (
                            <li className="w-full sm:w-auto px-4 sm:px-0 flex justify-center sm:justify-start">
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
                            </li>
                        ) : (
                            <li className="w-full sm:w-auto px-4 sm:px-0">
                                <Button onClick={() => signIn("osu")} className="w-full sm:w-auto">
                                    Sign In
                                </Button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
