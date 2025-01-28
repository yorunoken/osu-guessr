"use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    const { data: session } = useSession();

    return (
        <section className="relative min-h-[80vh] flex items-center">
            <div className="absolute inset-0 bg-[url('/main_bg.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
            <Link href={"https://twitter.com/Akariimia"} target="_blank" className="absolute bottom-0 p-2 text-muted-foreground hover:underline">
                Art by Triantafyllia
            </Link>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-5xl md:text-7xl font-bold mb-6">
                        Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">osu!guessr</span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="text-xl md:text-2xl text-foreground/80 mb-12 leading-relaxed">
                        Test your osu! knowledge, compete with friends, and discover new beatmaps in this engaging guessing game
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                        {session ? (
                            <Link href="#gamemodes">
                                <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                                    Start Playing
                                </Button>
                            </Link>
                        ) : (
                            <Button size="lg" onClick={() => signIn("osu")} className="text-lg px-8 w-full sm:w-auto">
                                Sign in with osu!
                            </Button>
                        )}
                        <Link href="/about">
                            <Button variant="outline" size="lg" className="text-lg px-8 w-full sm:w-auto">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// export function fHero() {
//     const [showHowToPlay, setShowHowToPlay] = useState(false);

//     return (
//         <section className="relative bg-secondary py-32 overflow-hidden">
//             <div className="absolute inset-0 bg-[url('/main_bg.jpg')] opacity-20 blur-md"></div>
//             <Link href={"https://twitter.com/Akariimia"} target="_blank" className="absolute bottom-0 p-2 text-muted-foreground hover:underline">
//                 Art by Triantafyllia
//             </Link>
//             <div className="container mx-auto px-4 text-center relative z-10">
//                 <h1 className="text-6xl font-bold mb-6 text-foreground">
//                     Welcome to <span className="text-primary">osu!guessr</span>
//                 </h1>
//                 <p className="text-2xl mb-12 text-foreground/80">Test your osu! knowledge!</p>
//                 <Button onClick={() => setShowHowToPlay(!showHowToPlay)} variant="outline" className="mb-6">
//                     {showHowToPlay ? "Hide How to Play" : "Show How to Play"}
//                     {showHowToPlay ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
//                 </Button>
//                 {showHowToPlay && (
//                     <div className="bg-card/80 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-border/50 transition-all duration-300 ease-in-out">
//                         <p className="text-xl mb-4 font-semibold">How to play:</p>
//                         <ol className="list-decimal list-inside text-left space-y-2">
//                             <li className="text-lg text-foreground/80">Choose a game mode</li>
//                             <li className="text-lg text-foreground/80">Observe the clue (background, audio, or skin)</li>
//                             <li className="text-lg text-foreground/80">Make your best guess</li>
//                             <li className="text-lg text-foreground/80">Earn points and compete on the leaderboard!</li>
//                         </ol>
//                     </div>
//                 )}
//             </div>
//         </section>
//     );
// }
