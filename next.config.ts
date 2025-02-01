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
};

export default nextConfig;
