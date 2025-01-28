import { TIME_BONUS_MULTIPLIER, BASE_POINTS, SKIP_PENALTY, STREAK_BONUS } from "../games/config";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | osu!guessr",
    description: "Learn more about osu!guessr, how to play, and game mechanics.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">
                About <span className="text-primary">osu!guessr</span>
            </h1>

            <div className="space-y-8">
                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">
                        What is <span className="text-primary">osu!guessr</span>?
                    </h2>
                    <p className="text-foreground/80 leading-relaxed">
                        <span className="text-primary">osu!guessr</span> is a fun and challenging game designed for osu! players to test their knowledge of the rhythm game{"'"}s vast beatmap library. Players
                        can compete in different game modes, trying to identify songs from their backgrounds, audio snippets, or skin elements.
                    </p>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">Game Modes</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-medium mb-2">Background Guessr</h3>
                            <p className="text-foreground/80">Test your ability to recognize songs from their beatmap backgrounds. How well do you know those iconic images?</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-2">Audio Guessr</h3>
                            <p className="text-foreground/80">Listen to short clips from beatmaps and try to identify the song. Perfect for music enthusiasts!</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-2">Skin Guessr</h3>
                            <p className="text-foreground/80">Challenge yourself to recognize popular osu! skins from in-game screenshots.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">How Scoring Works</h2>
                    <div className="space-y-2">
                        <p className="text-foreground/80">• Base points: {BASE_POINTS} points per correct guess</p>
                        <p className="text-foreground/80">• Time bonus: {TIME_BONUS_MULTIPLIER} points for each second remaining</p>
                        <p className="text-foreground/80">• Streak bonus: {STREAK_BONUS} points per correct answer in a row</p>
                        <p className="text-foreground/80">• Skip penalty: {SKIP_PENALTY} points</p>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">Credits & Attribution</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-medium mb-2">Development</h3>
                            <p className="text-foreground/80">
                                Created by{" "}
                                <a href="https://osu.ppy.sh/u/yorunoken" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    yorunoken
                                </a>
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-2">Inspiration</h3>
                            <p className="text-foreground/80">
                                • Score guessing version of this website by{" "}
                                <a href="https://guesser.lapaii.dev" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    Lapaii
                                </a>
                            </p>
                            <p className="text-foreground/80">
                                • Original inspiration{" "}
                                <a href="https://old.reddit.com/r/osugame/comments/14w0cs7/osuguesser_guess_osu_stuff/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    reddit thread
                                </a>
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-2">Assets</h3>
                            <p className="text-foreground/80">
                                • Main background art by{" "}
                                <a href="https://twitter.com/Akariimia" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    Triantafyllia
                                </a>
                            </p>
                            <p className="text-foreground/80">• All beatmap and skin content belongs to their respective creators, which are linked in the game</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-2">Special Thanks</h3>
                            <p className="text-foreground/80">
                                • osu! and{" "}
                                <a href="https://osu.ppy.sh/home" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    ppy
                                </a>{" "}
                                for the amazing game
                            </p>
                            <p className="text-foreground/80">• The osu! community for their continued support</p>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">Contact & Support</h2>
                    <p className="text-foreground/80 mb-4">Found a bug or have a suggestion? Feel free to reach out through any of these channels:</p>
                    <div className="space-y-2">
                        <p className="text-foreground/80">
                            • GitHub:{" "}
                            <a href="https://github.com/yorunoken/osu-guessr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                osu-guessr
                            </a>
                        </p>
                        <p className="text-foreground/80">
                            • Twitter:{" "}
                            <a href="https://twitter.com/yorunoken727" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                @yorunoken727
                            </a>
                        </p>
                        <p className="text-foreground/80">
                            • Discord: <span className="text-primary">@yorunoken</span>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
