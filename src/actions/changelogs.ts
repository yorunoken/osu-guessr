import "server-only";

import fs from "fs/promises";
import path from "path";

const CHANGELOG_PATH = path.join(process.cwd(), "changelog.json");

interface ChangelogChange {
    description: string;
    commit?: string;
    pr?: string;
}

interface Changelog {
    version: string;
    date: string;
    changes: ChangelogChange[];
}

export async function readChangelogs(): Promise<Changelog[]> {
    try {
        const content = await fs.readFile(CHANGELOG_PATH, "utf-8");
        return JSON.parse(content) as Changelog[];
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}
