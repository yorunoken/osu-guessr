import { TIME_BONUS_MULTIPLIER, BASE_POINTS, SKIP_PENALTY, STREAK_BONUS, MAX_ROUNDS, ROUND_TIME } from "../games/config";
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
                    <p className="text-foreground/80 leading-relaxed mb-4">
                        <span className="text-primary">osu!guessr</span> is an engaging trivia game that challenges osu! players to test their knowledge of the vast beatmap library. Whether you{"'"}re a casual
                        player or a hardcore mapper, this game offers a fun way to discover new songs and show off your familiarity with the community{"'"}s diverse musical collection.
                    </p>
                    <p className="text-foreground/80 leading-relaxed">Compete with friends, climb the leaderboards, and maybe even discover some new favorite beatmaps along the way!</p>
                </section>

                {/* Game Modes */}
                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-6">Game Modes</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Background Guessr</h3>
                            <p className="text-foreground/80">
                                Test your ability to recognize songs from their beatmap backgrounds. From anime screenshots to abstract art, how well do you know these iconic images?
                            </p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Audio Guessr</h3>
                            <p className="text-foreground/80">Put your musical knowledge to the test! Listen to short clips from beatmaps and try to identify the song before time runs out.</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">
                                Skin Guessr <span className="text-xs bg-primary/20 px-2 py-1 rounded ml-2">Coming Soon</span>
                            </h3>
                            <p className="text-foreground/80">Think you know your osu! skins? Challenge yourself to recognize popular skins from gameplay screenshots and menu elements.</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">
                                More Modes <span className="text-xs bg-primary/20 px-2 py-1 rounded ml-2">Planned</span>
                            </h3>
                            <p className="text-foreground/80">We{"'"}re working on exciting new game modes for you. Stay tuned!</p>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
                            <div>
                                <h3 className="text-lg font-medium mb-1">Choose Your Mode</h3>
                                <p className="text-foreground/80">Select from available game modes based on your preference - backgrounds, audio clips, or skins.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
                            <div>
                                <h3 className="text-lg font-medium mb-1">Start Guessing</h3>
                                <p className="text-foreground/80">
                                    You{"'"}ll have {ROUND_TIME} seconds per round to identify the correct song. Type your guess or use the auto-complete suggestions.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
                            <div>
                                <h3 className="text-lg font-medium mb-1">Score Points</h3>
                                <p className="text-foreground/80">Earn points based on accuracy and speed. Build streaks for bonus points and compete for high scores!</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">Scoring System</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-background/50 p-4 rounded-lg">
                            <p className="text-foreground/80">
                                • Base Points: <span className="text-primary font-medium">{BASE_POINTS}</span> per correct guess
                            </p>
                            <p className="text-foreground/80">
                                • Time Bonus: <span className="text-primary font-medium">{TIME_BONUS_MULTIPLIER}</span> × seconds remaining
                            </p>
                            <p className="text-foreground/80">
                                • Streak Bonus: <span className="text-primary font-medium">{STREAK_BONUS}</span> × current streak
                            </p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-lg">
                            <p className="text-foreground/80">
                                • Game Length: <span className="text-primary font-medium">{MAX_ROUNDS}</span> rounds (planning more diversity soon)
                            </p>
                            <p className="text-foreground/80">
                                • Round Time: <span className="text-primary font-medium">{ROUND_TIME}</span> seconds
                            </p>
                            <p className="text-foreground/80">
                                • Skip Penalty: <span className="text-primary font-medium">{SKIP_PENALTY}</span> points
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-6">Features</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Leaderboards</h3>
                            <p className="text-foreground/80">Compete globally with other players. Separate leaderboards for each game mode let you showcase your expertise!</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Auto-Complete</h3>
                            <p className="text-foreground/80">Smart suggestion system helps you find the right song title without requiring perfect spelling.</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Player Profiles</h3>
                            <p className="text-foreground/80">Track your progress, view stats, and see your ranking across different game modes.</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">API Access</h3>
                            <p className="text-foreground/80">Developers can integrate with our API to create their own tools and applications.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-6">Documentation</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">API Documentation</h3>
                            <p className="text-foreground/80 mb-4">Want to integrate with osu!guessr? Our comprehensive API documentation has everything you need to get started.</p>
                            <a
                                href="https://github.com/yorunoken/osu-guessr/blob/main/docs/API.md"
                                className="text-primary hover:underline inline-flex items-center gap-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View API Documentation →
                            </a>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Technical Details</h3>
                            <p className="text-foreground/80 mb-4">Interested in how the game works under the hood? Check out our detailed technical documentation.</p>
                            <a
                                href="https://github.com/yorunoken/osu-guessr/blob/main/docs/game-flow.md"
                                className="text-primary hover:underline inline-flex items-center gap-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Game Flow Documentation →
                            </a>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-6">Credits & Attribution</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Development</h3>
                            <p className="text-foreground/80">
                                Created and maintained by{" "}
                                <a href="https://osu.ppy.sh/u/yorunoken" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    yorunoken
                                </a>
                            </p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Artwork</h3>
                            <p className="text-foreground/80">
                                Main background art by{" "}
                                <a href="https://twitter.com/Akariimia" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    Triantafyllia
                                </a>
                            </p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Inspiration</h3>
                            <div className="space-y-2">
                                <p className="text-foreground/80">
                                    • Inspired by{" "}
                                    <a href="https://guesser.lapaii.dev" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                        Lapaii{"'"}s Score Guesser
                                    </a>
                                </p>
                                <p className="text-foreground/80">
                                    • Original concept from this{" "}
                                    <a href="https://old.reddit.com/r/osugame/comments/14w0cs7/osuguesser_guess_osu_stuff/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                        reddit thread
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Special Thanks</h3>
                            <div className="space-y-2">
                                <p className="text-foreground/80">
                                    • Dean Herbert (peppy) and the{" "}
                                    <a href="https://osu.ppy.sh" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                        osu!
                                    </a>{" "}
                                    team
                                </p>
                                <p className="text-foreground/80">• The amazing osu! community</p>
                                <p className="text-foreground/80">• All beatmap creators and skin designers</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-6">Contact & Support</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Get in Touch</h3>
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
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Contribute</h3>
                            <p className="text-foreground/80 mb-4">Found a bug? Have a suggestion? Want to contribute? Visit our GitHub repository to:</p>
                            <div className="space-y-2">
                                <p className="text-foreground/80">• Submit bug reports and feature requests</p>
                                <p className="text-foreground/80">• Contribute to the codebase</p>
                                <p className="text-foreground/80">• Help improve documentation</p>
                                <a href="https://github.com/yorunoken/osu-guessr" className="text-primary hover:underline inline-flex items-center gap-2 mt-2" target="_blank" rel="noopener noreferrer">
                                    View Repository →
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">Privacy & Legal</h2>
                    <div className="space-y-4">
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Data Usage</h3>
                            <p className="text-foreground/80">We only store necessary game data and osu! profile information. Your privacy is important to us!</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Content Usage</h3>
                            <p className="text-foreground/80">All beatmap content, including backgrounds and audio, belongs to their respective creators and is used under fair use for educational purposes.</p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-2 text-primary">Disclaimer</h3>
                            <p className="text-foreground/80">osu!guessr is not affiliated with or endorsed by osu! or ppy Pty Ltd. This is a fan-made project created for the community.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
