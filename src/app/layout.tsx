import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/context/session-wrapper";
import { ThemeProvider } from "@/context/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { UmamiAnalytics } from "./Umami";

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
            {/* <head>
                <Script src="/umami.js" data-website-id="849dac77-219d-4a0e-ba65-910f76c78e6f" strategy="afterInteractive" />
            </head> */}
            <body className={`${publicSans.variable} antialiased`}>
                <SessionWrapper>
                    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                        <Header />
                        <div className="flex flex-col min-h-screen">
                            <main className="flex-grow">{children}</main>
                        </div>
                        <Footer />
                        <Toaster />
                        <UmamiAnalytics />
                    </ThemeProvider>
                </SessionWrapper>
            </body>
        </html>
    );
}
