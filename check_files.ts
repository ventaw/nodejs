import { config, Sandbox } from "./src/index";

config.apiKey = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
config.apiBase = "https://api.ventaw.com/v1";

async function main() {
    const s = await Sandbox.get("f8b687be-36be-4ba7-a07e-7d69e7190025");
    await s.refresh();

    try {
        console.log("Applying workspace files to /app...");

        const commands = [
            "mkdir -p /app/components",
            "cp /sandbox/workspace/components/AnimalCard.tsx /app/components/",
            "cp /sandbox/workspace/app/page.tsx /app/app/",
            "cp /sandbox/workspace/app/layout.tsx /app/app/",
            "cp /sandbox/workspace/app/globals.css /app/app/",
            "ls -R /app/app",
            "ls -R /app/components"
        ];

        for (const cmd of commands) {
            console.log(`Running: ${cmd}`);
            // @ts-ignore
            const result = await s.execute(cmd);
            if (result.stdout) console.log("STDOUT:", result.stdout);
            if (result.stderr) console.log("STDERR:", result.stderr);
        }

        console.log("\nDeployment Sync Complete.");

    } catch (e: any) {
        console.error("DEPLOY ERROR:", e.message);
    }
}

main().catch(console.error);
