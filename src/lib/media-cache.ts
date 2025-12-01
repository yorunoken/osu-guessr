import fs from "fs/promises";
import path from "path";
import redisClient from "./redis";

const CACHE_TTL = 3600; // 1 hour cache for media files
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - only cache files under this size

/**
 * Reads a media file and caches it in Redis for faster subsequent access.
 * Falls back to direct file read if Redis is unavailable.
 * 
 * @param directory - Directory name (e.g., "backgrounds", "audio", "skins")
 * @param filename - File name
 * @returns Base64 encoded data URI
 */
export async function getCachedMediaFile(directory: string, filename: string): Promise<string> {
    const cacheKey = `media:${directory}:${filename}`;

    try {
        // Try to get from Redis cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return cached;
        }
    } catch (error) {
        console.warn("Redis cache read failed, falling back to file system:", error);
    }

    // Read from file system
    const filePath = path.join(process.cwd(), "mapsets", directory, filename);
    const fileBuffer = await fs.readFile(filePath);

    // Determine MIME type
    const ext = path.extname(filename).toLowerCase();
    let mimeType: string;
    if (ext === ".ogg") {
        mimeType = "audio/ogg";
    } else if (ext === ".mp3") {
        mimeType = "audio/mp3";
    } else if (ext === ".jpg" || ext === ".jpeg") {
        mimeType = "image/jpeg";
    } else if (ext === ".png") {
        mimeType = "image/png";
    } else {
        mimeType = "application/octet-stream";
    }

    const base64Data = fileBuffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Cache in Redis if file is under size limit
    if (fileBuffer.length <= MAX_FILE_SIZE) {
        try {
            await redisClient.set(cacheKey, dataUri, { EX: CACHE_TTL });
        } catch (error) {
            console.warn("Redis cache write failed:", error);
        }
    }

    return dataUri;
}

/**
 * Invalidates cached media file
 * @param directory - Directory name
 * @param filename - File name
 */
export async function invalidateMediaCache(directory: string, filename: string): Promise<void> {
    const cacheKey = `media:${directory}:${filename}`;
    try {
        await redisClient.del(cacheKey);
    } catch (error) {
        console.warn("Failed to invalidate cache:", error);
    }
}

/**
 * Clears all cached media files
 */
export async function clearMediaCache(): Promise<void> {
    try {
        const keys = await redisClient.keys("media:*");
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    } catch (error) {
        console.warn("Failed to clear media cache:", error);
    }
}
