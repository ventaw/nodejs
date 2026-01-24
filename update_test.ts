
import { config, Client } from './src/client';
import { Sandbox } from './src/resources/sandbox';

const API_KEY = process.env.API_KEY || "vnt_c8hQGl-CkOV-O_kQU1TxVYRYe-m5t3CF32heji8iwT0";
const API_URL = "https://api.ventaw.com/v1";

const LANDING_PAGE_CONTENT = `
'use client';

import React, { useState } from 'react';
import { Search, MapPin, Wrench, ArrowRight, Star, Shield, Clock } from 'lucide-react';

export default function Home() {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('AI Matching feature coming soon!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-blue-600">HandyMatch</span>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-6">Find the perfect Handyman</h1>
        <p className="text-xl text-gray-600 mb-8">AI-powered matching for home projects.</p>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-lg flex gap-2">
           <input className="flex-1 p-2 border rounded" placeholder="What do you need?" value={category} onChange={e => setCategory(e.target.value)} />
           <button type="submit" className="bg-blue-600 text-white px-6 rounded font-bold">Search</button>
        </form>
      </div>
    </div>
  );
}
`;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function update() {
  config.apiKey = API_KEY;
  config.apiBase = API_URL;
  console.log(`SDK Configured for ${API_URL}`);

  if (!process.env.API_KEY) {
    console.warn("WARNING: Using default hardcoded API key. Set API_KEY env var if this fails.");
  }

  const client = new Client({ apiKey: API_KEY, baseUrl: API_URL });

  try {
    console.log("Creating new sandbox...");
    // Using 'nextjs' template which should be available in production
    const sandbox = await Sandbox.create("nextjs", "sdk-test-customer");

    console.log(`Sandbox created: ${sandbox.id} (${sandbox.state})`);

    console.log("Starting sandbox...");
    if (sandbox.state !== 'running' && sandbox.state !== 'Running') {
      await sandbox.start();
    } else {
      console.log("Sandbox is already running, skipping start.");
    }

    // Wait for running state
    let retries = 30;
    while (retries > 0) {
      await sandbox.refresh();
      if (sandbox.state === 'running' || sandbox.state === 'Running') {
        console.log("Sandbox is running!");
        break;
      }
      console.log(`Waiting for sandbox to start... (${sandbox.state})`);
      await sleep(2000);
      retries--;
    }

    if (sandbox.state !== 'running' && sandbox.state !== 'Running') {
      throw new Error("Sandbox failed to start in time.");
    }

    console.log('--- Provisioning Environment ---');
    console.log('Installing Node.js & npm...');
    const installNode = await sandbox.execute('apk add --no-cache nodejs npm');
    console.log("APK Output:", installNode.stdout || installNode.stderr);

    console.log('Checking app...');
    console.log('Checking app...');
    const checkApp = await sandbox.execute('cd /app && [ -f package.json ] && echo "exists" || echo "missing"');

    if (checkApp.stdout.trim() === 'missing') {
      console.log('Creating Next.js app (this takes time)...');
      // Adding more aggressive timeout handling or creating it manually might be needed
      // But let's try the standard way first.
      const createApp = await sandbox.execute(
        'cd /app && npx -y create-next-app@latest . --typescript --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm',
        'bash'
      );
      console.log('Create App Result:', createApp.stdout);
      if (createApp.exitCode !== 0) {
        console.error('Create Next App Failed:', createApp.stderr);
      }
    } else {
      console.log('App already exists. Skipping creation.');
    }

    console.log("Installing lucide-react...");
    const execRes = await sandbox.execute("cd /app && npm install lucide-react", "bash");
    console.log("npm install output:", execRes.stdout);

    console.log("Writing app/page.tsx...");
    await sandbox.writeFile("app/page.tsx", LANDING_PAGE_CONTENT);
    console.log("Success! File updated.");

    console.log(`\nVisit your sandbox at: ${sandbox.access_url}`);

  } catch (error) {
    console.error("Error updating sandbox:", error);
  }
}

update();
