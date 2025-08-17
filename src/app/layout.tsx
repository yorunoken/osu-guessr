import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/context/session-wrapper";
import { ThemeProvider } from "@/context/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TranslationsProvider } from "@/context/translations-provider";
import { auth } from "@/lib/auth";
import { getLockInfo } from "@/lib/lockdown";
import { OWNER_ID } from "@/lib";

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--public-sans",
});

export const metadata: Metadata = {
    title: "osu!guessr",
    description: "Test your osu! knowledge!",
    icons: {
        icon: "/favicon.png",
    },
    keywords: ["osu guessr", "osu guesser", "osu! guessr", "osu! guesser", "osu guessing game", "osu beatmap game", "osu quiz", "osu trivia"].join(", "),
    robots: {
        index: true,
        follow: true,
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const lock = await getLockInfo();
    const session = await auth();

    if (lock && session?.user?.banchoId !== OWNER_ID) {
        return (
            <html lang="en">
                <head>
                    <script defer src="https://umami.yorunoken.com/script.js" data-website-id="43244628-cb56-43d3-936e-0edbc45d4790"></script>
                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3511683752810096" crossOrigin="anonymous"></script>
                </head>
                <body className={`${publicSans.variable} antialiased`}>
                    <div className="flex items-center justify-center min-h-screen bg-background">
                        <div className="max-w-xl mx-auto p-8 bg-card rounded-lg border border-border">
                            <h1 className="text-2xl font-bold mb-4">Website Locked</h1>
                            <p className="mb-4">The site is temporarily locked until {new Date(lock.until).toLocaleString()}.</p>
                            <p className="text-sm text-muted-foreground">Access is restricted. Only the owner can access the site while it&apos;s locked. Sorry for the inconvenience.</p>
                        </div>
                    </div>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <head>
                <script defer src="https://umami.yorunoken.com/script.js" data-website-id="43244628-cb56-43d3-936e-0edbc45d4790"></script>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3511683752810096" crossOrigin="anonymous"></script>
            </head>
            <body className={`${publicSans.variable} antialiased`}>
                <TranslationsProvider>
                    <SessionWrapper>
                        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                            <Header />

                            <div className="flex flex-col min-h-screen">
                                <main className="flex-grow">{children}</main>
                            </div>
                            <Footer />
                            <Toaster />
                        </ThemeProvider>
                    </SessionWrapper>
                </TranslationsProvider>
            </body>
        </html>
    );
}
