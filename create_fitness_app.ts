import { config, Sandbox } from "./src/index";

// Configuration
const API_KEY = "vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4";
const API_BASE = "https://api.ventaw.com/v1";

config.apiKey = API_KEY;
config.apiBase = API_BASE;
// @ts-ignore
config.timeout = 60000;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("🚀 Starting Fitness App Creation (Local SDK)...");

  let sandbox: Sandbox | null = null;

  try {
    // 1. Create Sandbox
    const templateCode = "nextjs";
    const sandboxName = `fitness-tracker-${Date.now()}`;
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

    // Wait briefly for agent to be fully responsive
    await delay(5000);

    try {
      await sandbox.files.createDir("components");
      console.log("   Created 'components' directory");
    } catch (e: any) {
      console.log(`   Note: 'components' dir creation result: ${e.message || 'ok'}`);
    }

    // 4. Create ActivityCard Component
    console.log("\n📝 Writing ActivityCard.tsx...");
    const activityCardCode = `
import React from 'react';

interface ActivityCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={\`p-3 rounded-full \${color} text-white text-xl\`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
`;
    await sandbox.files.write("components/ActivityCard.tsx", activityCardCode.trim());
    console.log("   ✅ ActivityCard.tsx written.");

    // 5. Create Dashboard Page (app/page.tsx)
    console.log("\n📝 Writing app/page.tsx...");
    const pageCode = `
import React from 'react';
import ActivityCard from '../components/ActivityCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fitness Tracker</h1>
        <p className="text-gray-600 mt-2">Welcome back, Runner! Here is your daily summary.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ActivityCard 
          title="Steps" 
          value="8,432" 
          icon="👣" 
          color="bg-blue-500" 
        />
        <ActivityCard 
          title="Calories" 
          value="420 kcal" 
          icon="🔥" 
          color="bg-orange-500" 
        />
        <ActivityCard 
          title="Distance" 
          value="5.2 km" 
          icon="🏃" 
          color="bg-green-500" 
        />
        <ActivityCard 
          title="Heart Rate" 
          value="112 bpm" 
          icon="❤️" 
          color="bg-red-500" 
        />
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Progress</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
           {[65, 40, 75, 50, 85, 90, 60].map((h, i) => (
             <div key={i} className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-200 transition-colors relative group">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                  style={{ height: \`\${h}%\` }}
                ></div>
             </div>
           ))}
        </div>
        <div className="flex justify-between mt-4 text-gray-400 text-sm font-medium">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </section>
    </main>
  );
}
`;
    await sandbox.files.write("app/page.tsx", pageCode.trim());
    console.log("   ✅ app/page.tsx written.");

    // 6. Verify Files
    console.log("\n🔍 Verifying file creation...");
    const files = await sandbox.files.list("components");
    const fileNames = files.map((f: any) => f.name || f); // Handle potential object or string
    console.log(`   Files in /components: ${fileNames.join(', ')}`);

    if (!fileNames.includes("ActivityCard.tsx")) {
      throw new Error("ActivityCard.tsx not found!");
    }

    console.log("\n🎉 Fitness App Created Successfully!");
    console.log(`🔗 Sandbox ID: ${sandbox.id}`);
    console.log(`🔗 IP: ${sandbox.ip_address}`);
    console.log("⚠️  Note: Sandbox left running for inspection.");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.response) console.error("   Response:", error.response.data);
  }
}

main();
