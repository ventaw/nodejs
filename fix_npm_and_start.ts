
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        console.log('--- Fixing NPM DNS ---');
        // Add registry.npmjs.org to hosts
        // Also add registry.yarnpkg.com just in case
        const hostsAppendix = `
104.16.6.34     registry.npmjs.org
104.16.27.34    registry.yarnpkg.com
`;
        await s.execute(`echo "${hostsAppendix}" >> /etc/hosts`);

        console.log('--- Cleaning previous install attempt ---');
        await s.execute('rm -rf /sandbox/workspace/node_modules /sandbox/workspace/package-lock.json');

        console.log('--- Running NPM Install ---');
        // Now it should work fast
        const install = await s.execute('cd /sandbox/workspace && npm install --verbose', 'bash', { timeout: 300000 }); // 5 mins
        console.log('Install Exit:', install.exit_code);
        if (install.exit_code !== 0) {
            console.log('Install Output (Tail):', install.stdout.slice(-1000));
            console.log('Install Error (Tail):', install.stderr.slice(-1000));
            return;
        }

        console.log('--- Starting Next.js ---');
        await s.execute('cd /sandbox/workspace && nohup node_modules/.bin/next dev -p 3000 -H 0.0.0.0 > app.log 2>&1 &');

        console.log('Waiting for startup (15s)...');
        await new Promise(r => setTimeout(r, 15000));

        console.log('--- App Logs ---');
        const logs = await s.execute('cat /sandbox/workspace/app.log');
        console.log(logs.stdout);

        console.log('--- Curl Test ---');
        const curl = await s.execute('curl -v http://127.0.0.1:3000');
        console.log(curl.stdout.slice(0, 500));

    } catch (e: any) { console.log('Error:', e.message); }
}
main();
