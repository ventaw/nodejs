import { Client, config, Template, Sandbox } from "./src/index";

// Configure default client
config.apiKey = "vnt_5Pw1Dh0cLsMybkJZXHJDXpz8aOuutEPXWh_sLS2TcCc";
config.apiBase = "https://ventaw.mmogomedia.com/v1";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log("Starting SDK verification...");

    let sandbox: Sandbox | undefined;

    try {
        // 1. List Templates
        console.log("Listing templates...");
        const templates = await Template.list();
        console.log(`Found ${templates.length} templates.`);
        if (templates.length === 0) {
            console.log("No templates found. Cannot proceed with creation.");
            return;
        }
        const templateId = "nextjs"; // Use specific template as in python test
        console.log(`Using template: ${templateId}`);

        // 2. Create Sandbox
        console.log("Creating sandbox...");
        const sbName = `js-sdk-test-${Math.floor(Date.now() / 1000)}`;
        sandbox = await Sandbox.create(templateId, sbName);
        console.log(`Created Sandbox: ${sandbox.id} (${sandbox.state})`);

        // 3. Wait for Startup
        console.log("Waiting for sandbox to be running...");
        let retries = 30;
        while (sandbox.state !== "running" && retries > 0) {
            await delay(1000);
            await sandbox.refresh();
            process.stdout.write(`State: ${sandbox.state}\r`);
            retries--;
        }
        console.log(`\nFinal State: ${sandbox.state}`);

        if (sandbox.state !== "running") {
            throw new Error("Sandbox failed to start.");
        }

        // 4. File I/O
        console.log("Testing File I/O...");

        // Create Dir (Retry to allow agent boot)
        console.log("Creating dir /tmp/sdk_test");
        let agentRetries = 10;
        while (agentRetries > 0) {
            try {
                await sandbox.files.createDir("/tmp/sdk_test");
                break;
            } catch (e) {
                console.log(`Waiting for agent... (${(e as any).message})`);
                await delay(2000);
                agentRetries--;
            }
        }

        if (agentRetries === 0) {
            throw new Error("Agent timed out");
        }

        const testFile = "/tmp/sdk_test/hello_js.txt";
        const content = "Hello from JS SDK";

        console.log(`Writing file: ${testFile}`);
        await sandbox.files.write(testFile, content);

        console.log(`Reading file: ${testFile}`);
        const readContent = await sandbox.files.read(testFile);
        console.log(`Content read: "${readContent}"`);

        if (readContent !== content) {
            throw new Error(`Content mismatch! Expected '${content}', got '${readContent}'`);
        } else {
            console.log("Content verification passed.");
        }

        // List files
        const files = await sandbox.files.list("/tmp/sdk_test");
        console.log(`Files found: ${files.length}`);

        // Cleanup files
        await sandbox.files.delete(testFile);
        await sandbox.files.deleteDir("/tmp/sdk_test");
        console.log("File cleanup done.");

        // 5. Cleanup Sandbox
        console.log("Deleting sandbox...");
        await sandbox.delete();
        console.log("Sandbox deleted.");

        console.log("Verification finished successfully.");

    } catch (error) {
        console.error("Verification failed:", error);
        if (sandbox) {
            try {
                await sandbox.delete();
                console.log("Sandbox deleted during cleanup.");
            } catch (cleanupError) {
                console.error("Failed to cleanup sandbox:", cleanupError);
            }
        }
        process.exit(1);
    }
}

main();
