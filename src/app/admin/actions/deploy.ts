import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function deploy() {
    try {
        const { stdout: pullOutput, stderr: pullError } = await execAsync("git pull");
        if (pullError) {
            throw new Error(`Git pull error: ${pullError}`);
        }
        console.log("Git pull output:", pullOutput);

        const { stdout: buildOutput, stderr: buildError } = await execAsync("bun run build");
        if (buildError) {
            throw new Error(`Build error: ${buildError}`);
        }
        console.log("Build output:", buildOutput);

        const { stdout: pmOutput, stderr: pmError } = await execAsync("pm2 restart 12");
        if (pmError) {
            throw new Error(`PM2 restart error: ${pmError}`);
        }
        console.log("PM2 restart output:", pmOutput);

        return { success: true, message: "Deployment completed successfully" };
    } catch (error) {
        console.error("Deployment error:", error);
        return {
            success: false,
            message: `Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
