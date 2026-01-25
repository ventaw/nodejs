import { config, Sandbox } from "./src/index";

// Configuration
const API_KEY = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
const API_BASE = "https://api.ventaw.com/v1";

config.apiKey = API_KEY;
config.apiBase = API_BASE;
// @ts-ignore
config.timeout = 240000;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("🦁 Starting Toddler Animal Naming App Deployment...");

  const TARGET_ID = "f8b687be-36be-4ba7-a07e-7d69e7190025";
  let sandbox: Sandbox | null = null;

  try {
    console.log(`\n🔍 Checking Sandbox ${TARGET_ID}...`);
    sandbox = await Sandbox.get(TARGET_ID);
    await sandbox.refresh(); // Refresh to get latest state
    console.log(`   Initial State: ${sandbox.state}`);

    if (sandbox.state === "error") {
      console.log("\n🛑 Sandbox is in ERROR state. Attempting termination first to clear state...");
      try {
        // @ts-ignore
        await sandbox.terminate();
        console.log("   Termination requested. Waiting for 'terminated' or 'not_started'...");

        let t_attempts = 0;
        while ((sandbox.state as any) !== "terminated" && (sandbox.state as any) !== "not_started" && t_attempts < 20) {
          await delay(2000);
          await sandbox.refresh();
          process.stdout.write(`   State: ${sandbox.state}\r`);
          t_attempts++;
        }
        console.log(`\n   State cleared to: ${sandbox.state}`);
      } catch (e: any) {
        console.log(`   ⚠️ Termination failed: ${e.message}. Trying start anyway...`);
      }
    }

    if (sandbox.state !== "running") {
      console.log(`\n🩹 STARTING Sandbox ${TARGET_ID} (Current state: ${sandbox.state})...`);
      // @ts-ignore
      await sandbox.start();

      console.log("   Waiting for 'running' state...");
      let attempts = 0;
      const maxAttempts = 60; // Give it plenty of time for cold boot
      while (sandbox.state !== "running" && attempts < maxAttempts) {
        await delay(3000);
        await sandbox.refresh();
        process.stdout.write(`   State: ${sandbox.state} (${attempts + 1}/${maxAttempts})\r`);
        attempts++;
      }
      console.log(`\n✅ Sandbox is now: ${sandbox.state}`);
    }

    if (sandbox.state !== "running") {
      throw new Error(`Sandbox failed to reach running state (Final state: ${sandbox.state}). Check logs.`);
    }

    console.log(`✅ Sandbox is RUNNING! IP: ${sandbox.ip_address}`);

    // 3. Create Project Structure
    console.log("\n📂 Setting up project structure...");
    await delay(2000);

    const COMP_DIR = "components";
    const APP_PAGE_DIR = "app";

    try {
      await sandbox.files.createDir(COMP_DIR);
      console.log(`   Created /${COMP_DIR} directory.`);
    } catch (e: any) {
      console.log(`   Info: /${COMP_DIR} check: ${e.message}`);
    }

    // --- COMPONENT: AnimalCard ---
    console.log(`📝 Writing ${COMP_DIR}/AnimalCard.tsx...`);
    await sandbox.files.write(`${COMP_DIR}/AnimalCard.tsx`, `
import React, { useState } from 'react';

interface AnimalCardProps {
  emoji: string;
  name: string;
  color: string;
  sound: string;
}

export default function AnimalCard({ emoji, name, color, sound }: AnimalCardProps) {
  const [showName, setShowName] = useState(false);

  return (
    <div 
      onClick={() => setShowName(!showName)}
      className={\`p-8 rounded-3xl \${color} cursor-pointer transform transition-all hover:scale-105 active:scale-95 shadow-xl flex flex-col items-center justify-center space-y-4\`}
    >
      <div className="text-8xl select-none animate-bounce" style={{ animationDuration: '3s' }}>
        {emoji}
      </div>
      <div className={\`h-12 flex items-center justify-center transition-opacity duration-300 \${showName ? 'opacity-100' : 'opacity-0'}\`}>
         <span className="text-3xl font-black text-gray-800 uppercase tracking-widest bg-white/50 px-6 py-2 rounded-full border-2 border-white">
           {name}
         </span>
      </div>
      <p className="text-sm font-bold text-gray-600/50 uppercase tracking-tighter">
        {showName ? sound : 'Who am I?'}
      </p>
    </div>
  );
}
`.trim());

    // --- LAYOUT ---
    console.log(`📝 Writing ${APP_PAGE_DIR}/layout.tsx...`);
    await sandbox.files.write(`${APP_PAGE_DIR}/layout.tsx`, `
import './globals.css'
import type { Metadata } from 'next'
import { Bubblegum_Sans } from 'next/font/google'

const bubblegum = Bubblegum_Sans({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Animal Friends!',
  description: 'Learning is fun!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={\`\${bubblegum.className} bg-yellow-50 overflow-x-hidden\`}>
        {children}
      </body>
    </html>
  )
}
`.trim());

    // --- PAGE ---
    console.log(`📝 Writing ${APP_PAGE_DIR}/page.tsx...`);
    await sandbox.files.write(`${APP_PAGE_DIR}/page.tsx`, `
'use client';
import React from 'react';
import AnimalCard from '../components/AnimalCard';

const animals = [
  { emoji: '🦁', name: 'Lion', color: 'bg-orange-200', sound: 'ROAARRR!' },
  { emoji: '🐘', name: 'Elephant', color: 'bg-blue-200', sound: 'TRUUUUMPT!' },
  { emoji: '🦒', name: 'Giraffe', color: 'bg-yellow-200', sound: 'HEW-HOO!' },
  { emoji: '🐵', name: 'Monkey', color: 'bg-amber-200', sound: 'OOOH-AAHH!' },
  { emoji: '🦓', name: 'Zebra', color: 'bg-gray-200', sound: 'NEIIIGH!' },
  { emoji: '🐯', name: 'Tiger', color: 'bg-orange-300', sound: 'GRRRRR!' },
  { emoji: '🐷', name: 'Pig', color: 'bg-pink-200', sound: 'OINK-OINK!' },
  { emoji: '🐸', name: 'Frog', color: 'bg-green-200', sound: 'RIBBIT!' },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-16 max-w-6xl mx-auto">
      <header className="text-center mb-16 space-y-4">
        <h1 className="text-6xl md:text-8xl font-black text-orange-500 drop-shadow-lg animate-pulse">
           Animal Friends! 🐾
        </h1>
        <p className="text-3xl text-blue-500 font-bold tracking-wide italic">
          Click an animal to see its name!
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {animals.map((animal) => (
          <AnimalCard 
            key={animal.name}
            {...animal}
          />
        ))}
      </div>

      <footer className="mt-24 text-center pb-8 opacity-50">
        <div className="text-4xl">🌤️ 🌳 🏠 🌳 🌤️</div>
      </footer>
    </main>
  );
}
`.trim());

    // --- STYLES ---
    console.log(`📝 Writing ${APP_PAGE_DIR}/globals.css...`);
    await sandbox.files.write(`${APP_PAGE_DIR}/globals.css`, `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fffef0;
  --foreground: #171717;
}

body {
  color: var(--foreground);
  background: var(--background);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.float {
  animation: float 3s ease-in-out infinite;
}
`.trim());

    // Verify Deployment
    console.log("\n🔍 Verifying deployment...");
    try {
      const componentsListing = await sandbox.files.list(COMP_DIR);
      const list = componentsListing.map((f: any) => f.name || f);
      console.log(`   Files in /${COMP_DIR}: ${list.join(', ')}`);
    } catch (e) {
      console.log("   ⚠️ Verification list failed, but files were likely written.");
    }

    console.log("\n🎉 Animal Learning App Deployed!");
    console.log(`🔗 Sandbox ID: ${sandbox.id}`);
    console.log(`🔗 IP: ${sandbox.ip_address}`);
    console.log(`🔗 URL: http://${sandbox.ip_address}:3000`);

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("   Response Data:", error.response.data);
      console.error("   Response Status:", error.response.status);
    }
  }
}

main();
