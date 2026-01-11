
import { config, Sandbox } from "./src/index";

// Configure your API key
config.apiKey = "vnt_yIUFMz6VaJhwuvfL5qCHhrGQZH3CZP6_2qAmyi2PggI";
config.apiBase = "http://localhost:8000/v1";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log("Creating a new sandbox...");

    // Create a new sandbox
    try {
        const sandbox = await Sandbox.create(
            "nextjs",       // Template ID
            "my-awesome-app"   // Name
        );

        console.log(`Created sandbox: ${sandbox.id}`);
        console.log(`State: ${sandbox.state}`);
        console.log(`Access URL: ${sandbox.access_url}`);

        // Wait for it to be ready
        console.log("Waiting for sandbox...");
        while (sandbox.state !== "running") {
            process.stdout.write(`Current state: ${sandbox.state}\r`);
            await delay(2000);
            await sandbox.refresh();
        }

        console.log("\nSandbox is ready!");
        console.log(`State: ${sandbox.state}`);
        console.log(`Access URL: ${sandbox.access_url}`);

    } catch (e: any) {
        console.error("Error creating sandbox:", e.response?.data || e.message);
        process.exit(1);
    }
}

main();
