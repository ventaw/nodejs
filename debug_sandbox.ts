
import { config, Client } from './src/client';
import { Sandbox } from './src/resources/sandbox';

const API_KEY = process.env.API_KEY || "vnt_c8hQGl-CkOV-O_kQU1TxVYRYe-m5t3CF32heji8iwT0";
const API_URL = "https://api.ventaw.com/v1";
const SANDBOX_ID = "cda95685-3f90-47d8-ad08-7f28af0adb18";

async function debug() {
    config.apiKey = API_KEY;
    config.apiBase = API_URL;
    const client = new Client({ apiKey: API_KEY, baseUrl: API_URL });

    try {
        const sandboxData = await client.request("GET", `/sandboxes/${SANDBOX_ID}`);
        const sandbox = new Sandbox(sandboxData);
        (sandbox as any)._client = client;

        console.log("--- Local Connectivity ---");
        const curl = await sandbox.execute("wget -qO- http://127.0.0.1:3000");
        console.log("Response:", curl.stdout.substring(0, 200));

        console.log("--- /app/package.json ---");
        const pkg = await sandbox.execute("cat /app/package.json");
        console.log(pkg.stdout);

        console.log("--- Process List ---");
        const ps = await sandbox.execute("ps aux");
        console.log(ps.stdout);

    } catch (error) {
        console.error("Debug failed:", error);
    }
}

debug();
