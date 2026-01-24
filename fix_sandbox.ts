
import { config, Client } from './src/client';
import { Sandbox } from './src/resources/sandbox';

const API_KEY = process.env.API_KEY || "vnt_c8hQGl-CkOV-O_kQU1TxVYRYe-m5t3CF32heji8iwT0";
const API_URL = "https://api.ventaw.com/v1";
const SANDBOX_ID = "cda95685-3f90-47d8-ad08-7f28af0adb18";

const PACKAGE_JSON = `
{
  "name": "sdk-test-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "latest",
    "lucide-react": "^0.368.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3",
    "eslint": "^8",
    "eslint-config-next": "latest"
  }
}
`;

async function fix() {
    config.apiKey = API_KEY;
    config.apiBase = API_URL;
    const client = new Client({ apiKey: API_KEY, baseUrl: API_URL });

    try {
        const sandboxData = await client.request("GET", `/sandboxes/${SANDBOX_ID}`);
        const sandbox = new Sandbox(sandboxData);
        (sandbox as any)._client = client;

        console.log("Restoring package.json...");
        // Use SDK writeFile (via agent to /app/package.json if agent is rooted at /app? No agent usually rooted at / or /app depending on config)
        // Earlier debug showed agent might overwrite relative to its root.
        // But debug Step 817 showed ls /app/package.json.
        // Let's us absolute path to be safe.
        // But SDK writeFile doesn't easily support absolute paths unless agent handles it.
        // Agent often joins path with root.
        // If I write "package.json", it likely goes to /app/package.json (based on page.tsx going to /app/app/page.tsx with "app/page.tsx")
        // Wait, "app/page.tsx" -> "/app/app/page.tsx".
        // So "package.json" -> "/app/package.json".

        await sandbox.writeFile("package.json", PACKAGE_JSON);

        console.log("Killing existing node processes...");
        await sandbox.execute("pkill -f node");
        await sandbox.execute("pkill -f npm");

        console.log("Starting next dev...");
        // Start in background. execute waits for output, so we need to detach or use session.
        // But execution of '&' might return immediately.
        // Or we use createSession.
        await sandbox.createSession("cd /app && npm run dev", "/app");

        console.log("Waiting for server to come up...");
        await new Promise(r => setTimeout(r, 5000));

        console.log("Checking connectivity...");
        const check = await sandbox.execute("wget -qO- http://127.0.0.1:3000");
        console.log("Response len:", check.stdout.length);

    } catch (error) {
        console.error("Fix failed:", error);
    }
}

fix();
