// import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/context/session-wrapper";
import { ThemeProvider } from "@/context/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { headers } from "next/headers";
import { TranslationsProvider } from "@/context/translations-provider";

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--public-sans",
});

export async function generateMetadata() {
    const headersList = await headers();
    const locale = headersList.get("x-next-locale") || "en";
    const messages = (await import(`@/messages/${locale}.json`)).default;

    return {
        title: messages.metadata.title,
        description: messages.metadata.description,
        icons: {
            icon: "/favicon.png",
        },
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script defer src="https://cloud.umami.is/script.js" data-website-id="849dac77-219d-4a0e-ba65-910f76c78e6f"></script>
            </head>
            <body className={`${publicSans.variable} antialiased`}>
                <SessionWrapper>
                    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                        <TranslationsProvider>
                            <Header />

                            <div className="flex flex-col min-h-screen">
                                <main className="flex-grow">{children}</main>
                            </div>
                            <Footer />
                            <Toaster />
                        </TranslationsProvider>
                    </ThemeProvider>
                </SessionWrapper>
            </body>
        </html>
    );
}
