
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        // 1. Fetch Key from Vault
        console.log('Fetching Gemini Key...');
        const apiKey = await Sandbox.secrets.get('GEMINI_API_KEY');
        if (!apiKey) throw new Error('GEMINI_API_KEY not found in secrets!');
        console.log('Got Key:', apiKey.slice(0, 5) + '...');

        // 2. Write .env.local
        console.log('Writing .env.local...');
        await s.writeFile('.env.local', `GEMINI_API_KEY=${apiKey}\n`);

        // 3. Update hosts for Google API
        console.log('Updating /etc/hosts...');
        // We need to keep existing github entries too!
        const hostsContent = `
127.0.0.1       localhost
140.82.121.4    github.com
140.82.121.6    api.github.com
192.178.54.170  generativelanguage.googleapis.com
`;
        await s.execute(`echo "${hostsContent}" > /etc/hosts`);

        // 4. Create API Route: app/api/gemini/route.ts
        console.log('Creating API Route...');
        // Ensure api dir exists
        await s.execute('mkdir -p app/api/gemini');

        const apiRoute = `
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${apiKey}\`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: 'Gemini Error', details: errText }, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;
        await s.writeFile('app/api/gemini/route.ts', apiRoute);

        console.log('Done.');

    } catch (e: any) { console.error('ERROR:', e.message); }
}
main();
