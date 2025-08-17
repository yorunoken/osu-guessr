import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ORIGIN = process.env.NEXTAUTH_URL || "https://your-domain.example";

const APP_DIR = path.join(process.cwd(), "src", "app");

function isPageFile(name: string) {
    return /^(page)\.(tsx|ts|jsx|js)$/.test(name);
}

async function collectPages(dir: string, routeBase = ""): Promise<Array<{ loc: string; lastmod?: string }>> {
    let results: Array<{ loc: string; lastmod?: string }> = [];

    const entries = await fs.readdir(dir, { withFileTypes: true });

    const pageFile = entries.find((e) => e.isFile() && isPageFile(e.name));
    if (pageFile) {
        if (!routeBase.includes("[")) {
            const filePath = path.join(dir, pageFile.name);
            try {
                const st = await fs.stat(filePath);
                const loc = routeBase === "" ? "/" : routeBase;
                results.push({ loc, lastmod: st.mtime.toISOString() });
            } catch {}
        }
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        if (entry.name === "api" || entry.name === "components" || entry.name === "_components" || entry.name === "admin") continue;

        const segment = entry.name;
        const nextBase = routeBase === "" ? `/${segment}` : `${routeBase}/${segment}`;
        const childDir = path.join(dir, segment);
        try {
            const child = await collectPages(childDir, nextBase);
            results = results.concat(child);
        } catch {}
    }

    return results;
}

function formatUrl(loc: string, lastmod?: string, changefreq?: string, priority?: string) {
    return `  <url>\n    <loc>${ORIGIN}${loc}</loc>\n${lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n` : ""}${changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ""}${
        priority ? `    <priority>${priority}</priority>\n` : ""
    }  </url>`;
}

export async function GET() {
    const parts: string[] = [];

    parts.push(formatUrl("/", undefined, "daily", "1.0"));
    parts.push(formatUrl("/about", undefined, "monthly", "0.7"));
    parts.push(formatUrl("/announcements", undefined, "weekly", "0.6"));
    parts.push(formatUrl("/games", undefined, "weekly", "0.8"));
    parts.push(formatUrl("/games/audio", undefined, "weekly", "0.6"));
    parts.push(formatUrl("/games/background", undefined, "weekly", "0.6"));
    parts.push(formatUrl("/games/skin", undefined, "weekly", "0.6"));
    parts.push(formatUrl("/leaderboard", undefined, "daily", "0.7"));
    parts.push(formatUrl("/privacy", undefined, "yearly", "0.3"));
    parts.push(formatUrl("/settings", undefined, "monthly", "0.4"));
    parts.push(formatUrl("/support", undefined, "monthly", "0.4"));
    parts.push(formatUrl("/tos", undefined, "yearly", "0.2"));

    try {
        const pages = await collectPages(APP_DIR, "");
        const seen = new Set<string>();
        for (const p of pages) {
            if (seen.has(p.loc)) continue;
            seen.add(p.loc);
            parts.push(formatUrl(p.loc, p.lastmod, "weekly", "0.6"));
        }
    } catch (err) {
        console.error("Error collecting pages for sitemap:", err);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${parts.join("\n")}\n</urlset>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
