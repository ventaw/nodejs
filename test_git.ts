import { config, Sandbox } from "./src/index";

config.apiKey = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
config.apiBase = "https://api.ventaw.com/v1";

async function main() {
    const s = await Sandbox.get("f8b687be-36be-4ba7-a07e-7d69e7190025");
    await s.refresh();

    console.log("Checking Git Status...");
    try {
        const status = await s.gitStatus();
        console.log("GIT STATUS:", JSON.stringify(status, null, 2));
    } catch (e: any) {
        console.error("GIT ERROR:", e.message);
    }
}

main().catch(console.error);
