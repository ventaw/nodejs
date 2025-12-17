import { config, getDefaultClient } from "./src/client";
import { Sandbox } from "./src/resources/sandbox";
import { Template } from "./src/resources/template";
// FileIO is used internally by Sandbox.files property

async function main() {
    console.log("Starting writeTree test...");

    // 1. Configure Global Client
    config.apiKey = process.env.VENTAW_API_KEY || "vnt_E8sl7MrIpBV_v1V1XQBqwre_CD-gXEszXhi259DzWRs";
    config.apiBase = "http://localhost:8000/v1";

    try {
        console.log("Listing sandboxes...");
        const sandboxes = await Sandbox.list();
        let sandbox: Sandbox;

        if (sandboxes.length > 0) {
            sandbox = sandboxes[0];
            console.log(`Using existing sandbox: ${sandbox.id}`);
        } else {
            console.log("Creating new sandbox...");
            const templates = await Template.list();
            if (templates.length === 0) {
                throw new Error("No templates available to create sandbox");
            }
            // templates[0] is likely the 'basic' template
            const templateId = templates[0].code || "basic";
            sandbox = await Sandbox.create(templateId, "WriteTree Test");
            console.log(`Created new sandbox: ${sandbox.id}`);

            let attempts = 0;
            while (!sandbox.ip_address && attempts < 10) {
                await new Promise(r => setTimeout(r, 2000));
                await sandbox.refresh();
                attempts++;
            }
            if (!sandbox.ip_address) console.log("Warning: Sandbox might not be ready.");
        }

        // 3. Test writeTree via sandbox.files helper
        const fileIO = sandbox.files;

        const files = [
            { path: "test_dir/file1.txt", content: "Hello from file 1" },
            { path: "test_dir/nested/file2.txt", content: "Hello from file 2" }
        ];

        console.log("Calling writeTree...");

        await fileIO.createDir("test_dir");
        await fileIO.createDir("test_dir/nested");

        await fileIO.writeTree(files);
        console.log("writeTree completed.");

        // 4. Verify content
        const content1 = await fileIO.read("test_dir/file1.txt");
        const content2 = await fileIO.read("test_dir/nested/file2.txt");

        console.log(`File 1 content: ${content1}`);
        console.log(`File 2 content: ${content2}`);

        if (content1 === "Hello from file 1" && content2 === "Hello from file 2") {
            console.log("SUCCESS: writeTree works correctly.");
        } else {
            console.error("FAILURE: Content verification failed.");
        }

    } catch (error) {
        console.error("Error during test:", error);
    }
}

main();
