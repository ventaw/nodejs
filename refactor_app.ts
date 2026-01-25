
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        // 1. Create directory for animals route
        await s.execute('mkdir -p app/animals');

        // 2. Create the new Animals Page (moved from Home)
        // We update the import path to use alias '@/' or relative '../../'
        // Let's use relative '../../' to contain it, or even better, let's switch to alias if possible.
        // Given layout.tsx worked with alias, let's try that.
        const animalsPage = `
'use client';
import React from 'react';
import AnimalCard from '@/components/AnimalCard';
import Link from 'next/link';

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

export default function AnimalsPage() {
  return (
    <main className="min-h-screen p-8 md:p-16 max-w-6xl mx-auto">
      <header className="mb-8">
        <Link href="/" className="text-2xl mb-4 inline-block bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
          🏠 Home
        </Link>
        <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-orange-500 drop-shadow-lg animate-bounce">
            Jungle Party! 🌴
            </h1>
            <p className="text-2xl text-blue-500 font-bold tracking-wide italic">
            Tap an animal to say hello!
            </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {animals.map((animal) => (
          <AnimalCard 
            key={animal.name}
            {...animal}
          />
        ))}
      </div>
    </main>
  );
}
`;
        console.log('Writing app/animals/page.tsx...');
        await s.writeFile('app/animals/page.tsx', animalsPage);


        // 3. Overwrite app/page.tsx with the Lobby
        const lobbyPage = `
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-300 to-sky-100">
      
      <header className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] tracking-tight mb-4">
           EduPlay
        </h1>
        <p className="text-2xl md:text-3xl text-sky-800 font-bold bg-white/50 py-2 px-6 rounded-full inline-block backdrop-blur-sm">
          Select a Game to Play!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        
        {/* Animals Module */}
        <Link href="/animals" className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1">
          <div className="absolute -top-6 -right-6 text-7xl group-hover:scale-125 transition-transform duration-300 filter drop-shadow-lg">
            🦁
          </div>
          <div className="h-48 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 overflow-hidden group-hover:bg-orange-200 transition-colors">
             <span className="text-8xl">🐾</span>
          </div>
          <h2 className="text-4xl font-black text-orange-500 text-center uppercase tracking-wider group-hover:text-orange-600">
            Animals
          </h2>
        </Link>

        {/* Coming Soon: Alphabet */}
        <div className="group relative bg-white/60 rounded-3xl p-6 shadow-lg opacity-80 cursor-not-allowed">
            <div className="absolute -top-6 -right-6 text-7xl filter grayscale opacity-50">
            🅰️
            </div>
            <div className="h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-8xl grayscale opacity-30">🔤</span>
            </div>
            <h2 className="text-4xl font-black text-gray-400 text-center uppercase tracking-wider">
            Alphabet
            </h2>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full -rotate-12 shadow-lg border-2 border-white">Coming Soon!</span>
            </div>
        </div>

      </div>

      <footer className="mt-16 text-sky-700/60 font-medium">
        Parent Mode • Settings • About
      </footer>

    </main>
  );
}
`;

        console.log('Writing app/page.tsx (Lobby)...');
        await s.writeFile('app/page.tsx', lobbyPage);

        console.log('Done.');

    } catch (e: any) { console.error('ERROR:', e.message); }
}
main();
