"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import UserSearch from "./UserSearch";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-primary">
                    osu!guessr
                </Link>
                <nav>
                    <ul className="flex space-x-6 items-center">
                        <UserSearch />
                        {["Leaderboard", "About"].map((item) => (
                            <li className="flex items-center" key={item}>
                                <Link href={"/" + item.toLowerCase()} className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium">
                                    {item}
                                </Link>
                            </li>
                        ))}
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
                    </ul>
                </nav>
            </div>
        </header>
    );
}
