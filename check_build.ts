
import { config, Client } from './src/client';
import { Sandbox } from './src/resources/sandbox';

const API_KEY = process.env.API_KEY || "vnt_c8hQGl-CkOV-O_kQU1TxVYRYe-m5t3CF32heji8iwT0";
const API_URL = "https://api.ventaw.com/v1";
const SANDBOX_ID = "cda95685-3f90-47d8-ad08-7f28af0adb18";

async function checkBuild() {
    config.apiKey = API_KEY;
    config.apiBase = API_URL;
    const client = new Client({ apiKey: API_KEY, baseUrl: API_URL, timeout: 60000 }); // Short timeout for API calls is fine

    try {
        const sandboxData = await client.request("GET", `/sandboxes/${SANDBOX_ID}`);
        const sandbox = new Sandbox(sandboxData);
        (sandbox as any)._client = client;

        console.log("Killing node processes...");
        await sandbox.execute("pkill -f node");
        await sandbox.execute("rm -f /app/.next/lock");

        console.log("Starting build session...");
        const session = await sandbox.createSession("cd /app && npm run build", "/app");
        console.log(`Build session started: ${session.id}`);

        // Wait for completion
        let done = false;
        while (!done) {
            await new Promise(r => setTimeout(r, 5000));
            const sessions = await sandbox.listSessions();
            const myself = sessions.find((s: any) => s.id === session.id);
            if (!myself) {
                console.log("Session lost?");
                break;
            }
            console.log(`Build status: ${myself.state}`);
            if (myself.state === 'completed' || myself.state === 'error') {
                done = true;

                // Get logs
                try {
                    const logs = await sandbox.getSessionLogs(session.id);
                    console.log("--- Build Logs ---");
                    const logContent = JSON.stringify(logs, null, 2);
                    console.log(logContent.substring(0, 2000));
                } catch (e) {
                    console.log("Could not retrieve logs:", e);
                }

                if (myself.exit_code === 0) {
                    console.log("Build Success! Starting server...");
                    await sandbox.createSession("cd /app && npm start", "/app");

                    console.log("Waiting for server...");
                    await new Promise(r => setTimeout(r, 5000));
                    const verify = await sandbox.execute("wget -qO- http://127.0.0.1:3000");
                    console.log("Verification:", verify.stdout.substring(0, 200));
                } else {
                    console.log("Build Failed!");
                }
            }
        }

    } catch (error) {
        console.error("Build check failed:", error);
    }
}

checkBuild();
