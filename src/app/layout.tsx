import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/context/session-wrapper";
import { ThemeProvider } from "@/context/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script defer src="/umami.js" data-website-id="b95e60a2-630f-4dab-814f-7299ebab3d61"></script>
            </head>
            <body className={`${publicSans.variable} antialiased`}>
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
            </body>
        </html>
    );
}
