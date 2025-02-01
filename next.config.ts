import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: { remotePatterns: [{ hostname: "a.ppy.sh" }, { hostname: "assets.ppy.sh" }] },
    typescript: {
        ignoreBuildErrors: true,
    },
    reactStrictMode: false,
    experimental: {
        serverActions: {
            allowedOrigins: ["guesser.yorunoken.com", "127.0.0.1:3011"],
        },
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.umami.is; connect-src 'self' https://analytics.umami.is;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
