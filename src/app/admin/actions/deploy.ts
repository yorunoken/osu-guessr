"use server";

import { exec } from "child_process";
import { promisify } from "util";

export async function deploy() {
    const execAsync = promisify(exec);

    await execAsync("git pull");

    await execAsync("bun run build");

    await execAsync("pm2 restart 12");
}
