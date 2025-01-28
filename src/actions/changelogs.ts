"use server";

import fs from "fs/promises";
import path from "path";

const CHANGELOG_PATH = path.join(process.cwd(), "src/changelogs.json");

export async function readChangelogs() {
    const content = await fs.readFile(CHANGELOG_PATH, "utf-8");
    return JSON.parse(content);
}
