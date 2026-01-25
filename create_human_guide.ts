
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        // 1. Create HumanGuide.tsx
        const guideComp = `
'use client';
import { useState } from 'react';

export default function HumanGuide({ context }: { context: string }) {
  const [guideText, setGuideText] = useState("Hi! I'm your guide.");
  const [loading, setLoading] = useState(false);

  const askGemini = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: \`You are a friendly teacher for toddlers. Write a VERY short (1 sentence), fun fact or greeting about: \${context}. use simple words.\` 
        })
      });
      const data = await res.json();
      if (data.text) {
        setGuideText(data.text);
        speak(data.text);
      }
    } catch (e) {
      console.error(e);
      setGuideText("Oops! I lost my voice.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a friendly voice?
      // window.speechSynthesis.getVoices() might be empty initially, simpler to just use default for MVP
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
        <div className="bg-white p-4 rounded-2xl shadow-xl mb-2 max-w-xs border-2 border-pink-200 animate-fade-in-up">
            <p className="text-pink-600 font-bold text-lg leading-tight">
                {loading ? 'Thinking...' : guideText}
            </p>
        </div>
        <button 
            onClick={askGemini}
            className="text-6xl hover:scale-110 transition-transform cursor-pointer filter drop-shadow-lg"
            title="Ask the Guide!"
        >
            👩‍🏫
        </button>
    </div>
  );
}
`;
        console.log('Writing components/HumanGuide.tsx...');
        await s.writeFile('components/HumanGuide.tsx', guideComp);

        // 2. Update app/animals/page.tsx to include it
        const animalsPage = `
'use client';
import React from 'react';
import AnimalCard from '@/components/AnimalCard';
import Link from 'next/link';
import HumanGuide from '@/components/HumanGuide';

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
    <main className="min-h-screen p-8 md:p-16 max-w-6xl mx-auto pb-32">
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

      <HumanGuide context="Jungle Animals" />
    </main>
  );
}
`;
        console.log('Updating app/animals/page.tsx...');
        await s.writeFile('app/animals/page.tsx', animalsPage);

        console.log('Done.');

    } catch (e: any) { console.error('ERROR:', e.message); }
}
main();
