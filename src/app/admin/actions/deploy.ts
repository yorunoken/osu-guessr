"use server";

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function deploy() {
    try {
        const scriptPath = path.join(process.cwd(), "src/app/admin/actions/deploy.sh");
        const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

        if (stderr) {
            console.error(stderr);
        }

        console.log(stdout);
        return { success: true, message: "Deployment completed successfully" };
    } catch (error) {
        console.error("Deployment error:", error);
        return {
            success: false,
            message: `Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
