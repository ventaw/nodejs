import { config, Sandbox } from "./src/index";

config.apiKey = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
config.apiBase = "https://api.ventaw.com/v1";

async function main() {
    console.log("🚀 Creating fresh Next.js sandbox to test automatic alignment...");
    const s = await Sandbox.create("nextjs", "alignment-test-" + Date.now());

    console.log(`✅ Sandbox created: ${s.id}. Waiting for it to be ready...`);

    // Test 1: Check if list_files works during starting/running
    try {
        const files = await s.files.list(".");
        console.log("📁 Initial file listing success!");
    } catch (e: any) {
        console.log("❌ Initial file listing failed (expected if too early): " + e.message);
    }

    await s.refresh();
    while (s.state !== "running") {
        await new Promise(r => setTimeout(r, 2000));
        await s.refresh();
        console.log(`... State: ${s.state}`);
    }

    console.log("📝 Writing custom page.tsx to workspace (root of SDK)...");
    await s.files.write("app/page.tsx", `
        export default function Test() {
            return (
                <div style={{ padding: "50px", textAlign: "center", fontSize: "2rem", color: "green" }}>
                    <h1>✅ Automatic Alignment Success!</h1>
                    <p>This was written to the workspace and synced to /app automatically.</p>
                </div>
            );
        }
    `);

    console.log("🔗 Access URL: " + s.access_url);
    console.log("\nVerify manually or with browser tool.");
}

main().catch(console.error);
