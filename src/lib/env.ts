import { z } from "zod";

const envSchema = z.object({
    // Database
    DB_HOST: z.string().default("127.0.0.1"),
    DB_PORT: z.string().optional().default("3306"),
    DB_USER: z.string().min(1, "DB_USER is required"),
    DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
    DB_NAME: z.string().min(1, "DB_NAME is required"),

    // Redis
    REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),
    IS_DOCKER_BUILD: z.string().optional(),

    // Auth
    AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
    OSU_CLIENT_ID: z.string().min(1, "OSU_CLIENT_ID is required"),
    OSU_CLIENT_SECRET: z.string().min(1, "OSU_CLIENT_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),

    // APIs & Integrations
    OSU_API_KEY: z.string().min(1, "OSU_API_KEY is required"),
    OSUCK_API_KEY: z.string().optional(),
    OSUCK_API_BASE: z.string().optional(),
    DISCORD_WEBHOOK: z.string().url().optional(),

    // Public
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
    NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),
    NEXT_PUBLIC_ADSENSE_SLOT: z.string().optional(),
});

// Use this for server-side environments
const processEnv = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    REDIS_URL: process.env.REDIS_URL,
    IS_DOCKER_BUILD: process.env.IS_DOCKER_BUILD,
    AUTH_SECRET: process.env.AUTH_SECRET,
    OSU_CLIENT_ID: process.env.OSU_CLIENT_ID,
    OSU_CLIENT_SECRET: process.env.OSU_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    OSU_API_KEY: process.env.OSU_API_KEY,
    OSUCK_API_KEY: process.env.OSUCK_API_KEY,
    OSUCK_API_BASE: process.env.OSUCK_API_BASE,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    NEXT_PUBLIC_ADSENSE_SLOT: process.env.NEXT_PUBLIC_ADSENSE_SLOT,
};

const parsed = envSchema.safeParse(processEnv);

const isDockerBuild = process.env.IS_DOCKER_BUILD === "true";

if (!parsed.success && !isDockerBuild) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

export const env = parsed.success ? parsed.data : (processEnv as any);
