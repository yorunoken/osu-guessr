import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: { remotePatterns: [{ hostname: "a.ppy.sh" }, { hostname: "assets.ppy.sh" }] },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
