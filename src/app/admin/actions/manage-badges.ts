"use server";

import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const badgeSchema = z.object({
    name: z.string().min(1),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
});

const BADGES_PATH = path.join(process.cwd(), "src/app/admin/actions/badges.json");

function capitalizeWords(str: string): string {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

export async function getBadgesFile() {
    try {
        const content = await fs.readFile(BADGES_PATH, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to read badges file: ${error}`);
    }
}

export async function addBadgeToFile(name: string, color: string) {
    try {
        const validated = badgeSchema.parse({ name, color });
        const badges = await getBadgesFile();

        const formattedName = capitalizeWords(validated.name);

        badges[formattedName] = validated.color;

        await fs.writeFile(BADGES_PATH, JSON.stringify(badges, null, 4));
        return `Successfully added badge "${formattedName}" with color ${validated.color}`;
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
        }
        throw new Error(`Failed to add badge: ${error}`);
    }
}

export async function removeBadgeFromFile(name: string) {
    try {
        const badges = await getBadgesFile();
        const formattedName = capitalizeWords(name);

        if (!(formattedName in badges)) {
            throw new Error(`Badge "${name}" not found`);
        }

        delete badges[formattedName];
        await fs.writeFile(BADGES_PATH, JSON.stringify(badges, null, 4));
        return `Successfully removed badge "${name}"`;
    } catch (error) {
        throw new Error(`Failed to remove badge: ${error}`);
    }
}
