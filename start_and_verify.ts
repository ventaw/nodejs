
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        console.log('Updating hosts for Alpine...');
        const hostEntry = '151.101.66.132 dl-cdn.alpinelinux.org';
        const currentHosts = await s.execute('cat /etc/hosts');
        if (!currentHosts.stdout.includes('dl-cdn.alpinelinux.org')) {
            await s.execute(`echo "${hostEntry}" >> /etc/hosts`);
            console.log('Added Alpine host.');
        } else {
            console.log('Alpine host already present.');
        }

        console.log('Checking if npm exists...');
        const npmCheck = await s.execute('which npm');
        if (npmCheck.exit_code !== 0) {
            console.log('Installing dependencies...');
            const apk = await s.execute('apk update && apk add nodejs npm curl');
            console.log('APK:', apk.stdout, apk.stderr);
        } else {
            console.log('npm already installed.');
        }

        console.log('Starting Next.js...');
        // Force fully qualified path to avoid nohup path issues
        await s.execute('nohup /usr/bin/npm run dev -- -p 3000 -H 0.0.0.0 > app.log 2>&1 &', 'bash', { timeout: 2000 });

        console.log('Waiting for startup (15s)...');
        await new Promise(r => setTimeout(r, 15000));

        console.log('--- Logs ---');
        const logs = await s.execute('tail -n 20 app.log');
        console.log(logs.stdout);

        console.log('--- Netstat (Verify Port 3000) ---');
        const net = await s.execute('netstat -tulpn | grep 3000');
        console.log(net.stdout);

        console.log('--- Local Curl Test ---');
        const curl = await s.execute('curl -v http://127.0.0.1:3000');
        // Log head of output
        console.log(curl.stdout.slice(0, 500));
        console.log('Exit Code:', curl.exit_code);

    } catch (e: any) { console.log('Error:', e.message); }
}
main();
