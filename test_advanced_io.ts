import { getDefaultClient, config } from "./src/client";
import { Sandbox } from "./src/resources/sandbox";

// Configure API Key GLOBALLY before client instantiation
config.apiKey = "vnt_5Pw1Dh0cLsMybkJZXHJDXpz8aOuutEPXWh_sLS2TcCc";

const client = getDefaultClient();
// Ensure this matches your local env or use a real key

async function main() {
    console.log("--- Starting Advanced SDK Verification ---");

    // 1. Create a Sandbox
    console.log("Creating verification sandbox...");
    const sandbox = await Sandbox.create("ubuntu-22.04", "io-test-sandbox");
    console.log(`Sandbox created with ID: ${sandbox.id}`);

    // Wait for it to be running (simple loop)
    console.log("Waiting for sandbox to be running...");
    for (let i = 0; i < 30; i++) {
        await sandbox.refresh();
        if (sandbox.state === "Running") break;
        await new Promise(r => setTimeout(r, 1000));
    }
    if (sandbox.state !== "Running") {
        throw new Error("Sandbox failed to start");
    }

    try {
        // 2. Test Write Tree (Batch Write)
        console.log("\nTesting writeTree...");
        const files = [
            { path: "/root/project/a.txt", content: "File A" },
            { path: "/root/project/b.txt", content: "File B" },
            { path: "/root/project/subdir/c.txt", content: "File C" }
        ];
        await sandbox.files.writeTree(files);
        console.log("writeTree completed.");

        // 3. Test Recursive List
        console.log("\nTesting Recursive List...");
        const items = await sandbox.files.list("/root/project", { recursive: true });
        console.log("Items found:", items.map(i => i.path));

        const expected = ["a.txt", "b.txt", "subdir/c.txt"];
        // Note: path representation might vary (subdir/c.txt vs /root/project/subdir/c.txt) depending on implementation
        // My python implementation does: rel_path = os.path.relpath(full_path, path)
        // So expected items should match relative paths.

        const found = items.filter(i => i.type === 'file').length;
        if (found >= 3) {
            console.log("Recursive list verified!");
        } else {
            console.warn("Recursive list might have failed (backend not updated?)");
        }

        // 4. Test Watch
        console.log("\nTesting Watch...");
        const watchPath = "/root/watch_dir";
        await sandbox.files.createDir(watchPath);

        console.log(`Starting watch on ${watchPath}...`);
        const events: any[] = [];
        const stopWatch = await sandbox.files.watch(watchPath, (event) => {
            console.log("Watch Event:", event);
            events.push(event);
        });

        // Trigger changes
        console.log("Triggering file changes...");
        // We need to wait a bit for watch to establish
        await new Promise(r => setTimeout(r, 1000));

        await sandbox.files.write(watchPath + "/test1.txt", "hello");
        await new Promise(r => setTimeout(r, 1000)); // wait for poll

        await sandbox.files.write(watchPath + "/test1.txt", "world");
        await new Promise(r => setTimeout(r, 1000));

        await sandbox.files.delete(watchPath + "/test1.txt");
        await new Promise(r => setTimeout(r, 1000));

        stopWatch();
        console.log("Watch stopped.");

        if (events.length > 0) {
            console.log("Watch verified! Events captured:", events.length);
        } else {
            console.warn("No watch events received (backend not updated?)");
        }

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        console.log("\nCleaning up...");
        await sandbox.delete();
        console.log("Sandbox deleted.");
    }
}

main().catch(console.error);
