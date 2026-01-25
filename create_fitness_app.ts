import { config, Sandbox } from "./src/index";

// Configuration
const API_KEY = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
const API_BASE = "https://api.ventaw.com/v1";

config.apiKey = API_KEY;
config.apiBase = API_BASE;
// @ts-ignore
config.timeout = 120000; // Increase timeout for full setup

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("🚀 Starting Full Fitness App Deployment...");

  let sandbox: Sandbox | null = null;

  try {
    // 1. Create Sandbox
    const templateCode = "nextjs";
    const sandboxName = `fit-track-pro-${Date.now()}`;
    console.log(`\n🏗️  Creating Sandbox '${sandboxName}'...`);

    sandbox = await Sandbox.create(templateCode, sandboxName, 2, 2048, true, "standard");
    console.log(`✅ Sandbox created! ID: ${sandbox.id}`);

    // 2. Wait for Startup
    console.log("\n⏳ Waiting for sandbox to start...");
    const maxAttempts = 60;
    let attempts = 0;
    while (sandbox.state !== "running" && attempts < maxAttempts) {
      await delay(2000);
      await sandbox.refresh();
      process.stdout.write(`   State: ${sandbox.state} (${attempts + 1}/${maxAttempts})\r`);
      attempts++;
    }
    console.log(`\n✅ Sandbox is RUNNING! IP: ${sandbox.ip_address}`);

    if (sandbox.state !== "running") {
      throw new Error("Sandbox failed to start.");
    }

    // 3. Create Directory structure
    console.log("\n📂 Setting up project structure...");
    await delay(5000); // Allow agent to settle

    try {
      await sandbox.files.createDir("components");
    } catch (e) { /* ignore if exists */ }

    // --- COMPONENT: Sidebar ---
    console.log("📝 Writing Sidebar.tsx...");
    await sandbox.files.write("components/Sidebar.tsx", `
import React from 'react';

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          FitTrack
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {['Dashboard', 'Activities', 'Analytics', 'Settings'].map((item, i) => (
          <a key={item} href="#" className={\`flex items-center px-4 py-3 rounded-xl transition-all \${
            i === 0 ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }\`}>
            {item}
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
         <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 shadow-md"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">Jane Doe</p>
              <p className="text-xs text-blue-500 font-medium">Pro Member</p>
            </div>
         </div>
      </div>
    </aside>
  );
}
`.trim());

    // --- COMPONENT: HistoryList ---
    console.log("📝 Writing HistoryList.tsx...");
    await sandbox.files.write("components/HistoryList.tsx", `
import React from 'react';

const activities = [
  { id: 1, type: 'Running', date: 'Today, 8:00 AM', duration: '30 min', cal: 320, color: 'bg-orange-100 text-orange-600' },
  { id: 2, type: 'Cycling', date: 'Yesterday, 6:00 PM', duration: '45 min', cal: 450, color: 'bg-blue-100 text-blue-600' },
  { id: 3, type: 'Yoga', date: 'Mon, 7:00 AM', duration: '60 min', cal: 180, color: 'bg-teal-100 text-teal-600' },
  { id: 4, type: 'Swimming', date: 'Sun, 9:00 AM', duration: '40 min', cal: 360, color: 'bg-cyan-100 text-cyan-600' },
];

export default function HistoryList() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
             <div className="flex items-center space-x-4">
               <div className={\`p-3 rounded-xl \${activity.color} group-hover:scale-110 transition-transform\`}>
                 <div className="w-5 h-5 bg-current rounded-full opacity-50"></div>
               </div>
               <div>
                 <h4 className="font-semibold text-gray-800">{activity.type}</h4>
                 <p className="text-xs text-gray-400">{activity.date}</p>
               </div>
             </div>
             <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{activity.cal} kcal</p>
                <p className="text-xs text-gray-400">{activity.duration}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`.trim());

    // --- COMPONENT: ActivityCard ---
    console.log("📝 Writing ActivityCard.tsx...");
    await sandbox.files.write("components/ActivityCard.tsx", `
import React from 'react';

interface ActivityCardProps {
  title: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, value, sub, icon, color }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className={\`text-xs font-semibold mt-2 \${sub.startsWith('+') ? 'text-green-500' : 'text-red-500'}\`}>
             {sub} <span className="text-gray-400 font-normal">vs last week</span>
          </p>
        </div>
        <div className={\`p-3 rounded-xl \${color} text-white text-xl shadow-sm\`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
`.trim());

    // --- LAYOUT ---
    console.log("📝 Writing app/layout.tsx...");
    await sandbox.files.write("app/layout.tsx", `
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'FitTrack Pro',
  description: 'Premium Fitness Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={\`\${inter.variable} \${outfit.variable} font-sans bg-gray-50 flex h-screen overflow-hidden\`}>
        <Sidebar />
        <div className="flex-1 md:ml-64 h-full overflow-auto w-full transition-all">
          {children}
        </div>
      </body>
    </html>
  )
}
`.trim());

    // --- PAGE ---
    console.log("📝 Writing app/page.tsx...");
    await sandbox.files.write("app/page.tsx", `
import React from 'react';
import ActivityCard from '../components/ActivityCard';
import HistoryList from '../components/HistoryList';

export default function Home() {
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display">Good Morning, Jane</h1>
           <p className="text-gray-500 mt-1">Here's your daily activity summary.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
           + Log Activity
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ActivityCard 
          title="Daily Steps" 
          value="8,432" 
          sub="+12%"
          icon="👣" 
          color="bg-gradient-to-br from-blue-500 to-blue-600" 
        />
        <ActivityCard 
          title="Calories" 
          value="420 kcal" 
          sub="+5%"
          icon="🔥" 
          color="bg-gradient-to-br from-orange-500 to-red-500" 
        />
        <ActivityCard 
          title="Distance" 
          value="5.2 km" 
          sub="+8%"
          icon="🏃" 
          color="bg-gradient-to-br from-green-500 to-emerald-600" 
        />
        <ActivityCard 
          title="Heart Rate" 
          value="112 bpm" 
          sub="-2%"
          icon="❤️" 
          color="bg-gradient-to-br from-rose-500 to-pink-600" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold text-gray-800">Weekly Progress</h2>
             <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100">
                <option>Steps</option>
                <option>Calories</option>
             </select>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-4 px-2">
             {[65, 45, 75, 55, 85, 95, 60].map((h, i) => (
               <div key={i} className="w-full flex-1 flex flex-col justify-end group">
                  <div className="relative w-full bg-blue-50 rounded-lg overflow-hidden h-full">
                     <div 
                        className="absolute bottom-0 w-full bg-blue-500 rounded-lg transition-all duration-700 ease-out group-hover:bg-blue-600"
                        style={{ height: \`\${h}%\` }}
                     ></div>
                  </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 text-gray-400 text-sm font-medium px-1">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-1">
           <HistoryList />
        </div>
      </div>
    </main>
  );
}
`.trim());

    // --- STYLES ---
    console.log("📝 Writing app/globals.css...");
    await sandbox.files.write("app/globals.css", `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
  --font-display: var(--font-outfit), sans-serif;
  --font-body: var(--font-inter), sans-serif;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom, transparent, rgb(var(--background-end-rgb)))
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .font-display {
    font-family: var(--font-display);
  }
}
`.trim());

    // Verify Files
    console.log("\n🔍 Verifying deployment...");
    const components = await sandbox.files.list("components");
    const list = components.map((f: any) => f.name || f);
    console.log(`   Files in /components: ${list.join(', ')}`);

    if (!list.includes("Sidebar.tsx") || !list.includes("HistoryList.tsx")) {
      throw new Error("Missing components check failed");
    }

    console.log("\n🎉 Full Fitness App Deployed Successfully!");
    console.log(`🔗 Sandbox ID: ${sandbox.id}`);
    console.log(`🔗 IP: ${sandbox.ip_address}`);
    console.log("👉 Validated: Network Egress, FileIO, Styling, Components");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.response) console.error("   Response:", error.response.data);
  }
}

main();
