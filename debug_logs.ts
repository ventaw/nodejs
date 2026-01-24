
import { config, Client } from './src/client';
import { Sandbox } from './src/resources/sandbox';

const API_KEY = process.env.API_KEY || "vnt_c8hQGl-CkOV-O_kQU1TxVYRYe-m5t3CF32heji8iwT0";
const API_URL = "https://api.ventaw.com/v1";
const SANDBOX_ID = "cda95685-3f90-47d8-ad08-7f28af0adb18";

async function debugLogs() {
    config.apiKey = API_KEY;
    config.apiBase = API_URL;
    const client = new Client({ apiKey: API_KEY, baseUrl: API_URL });

    try {
        const sandboxData = await client.request("GET", `/sandboxes/${SANDBOX_ID}`);
        const sandbox = new Sandbox(sandboxData);
        (sandbox as any)._client = client;

        console.log("Listing sessions...");
        const sessions = await sandbox.listSessions();
        console.log("Sessions:", sessions);

        if (Array.isArray(sessions)) {
            for (const sess of sessions) {
                console.log(`--- Logs for session ${sess.id} (${sess.command}) ---`);
                const logs = await sandbox.getSessionLogs(sess.id);
                // logs might be { logs: [...] } or array?
                // SDK implementation: return await request(...)
                // The API usually returns list of log lines or a struct.
                console.log(JSON.stringify(logs, null, 2));
            }
        }

    } catch (error) {
        console.error("Debug logs failed:", error);
    }
}

debugLogs();
