import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/context/session-wrapper";
import { ThemeProvider } from "@/context/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TranslationsProvider } from "@/context/translations-provider";

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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script defer src="https://cloud.umami.is/script.js" data-website-id="849dac77-219d-4a0e-ba65-910f76c78e6f"></script>
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
