
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        // 1. Create SWRegister.tsx
        const swComp = `
'use client';
import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('SW registered: ', registration))
        .catch((err) => console.log('SW registration failed: ', err));
    }
  }, []);
  return null;
}
`;
        console.log('Creating component...');
        await s.writeFile('components/SWRegister.tsx', swComp);

        // 2. Update layout.tsx to import and use it
        // We'll replace the existing file content with the new one including the import
        const newLayout = `
import './globals.css'
import type { Metadata } from 'next'
import { Bubblegum_Sans } from 'next/font/google'
import SWRegister from '@/components/SWRegister'

const bubblegum = Bubblegum_Sans({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EduPlay: Toddler Games',
  description: 'Fun educational games for toddlers!',
  manifest: '/manifest.json',
  themeColor: '#FF6B6B',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={\`\${bubblegum.className} bg-yellow-50 overflow-x-hidden\`}>
        <SWRegister />
        {children}
      </body>
    </html>
  )
}
`;
        console.log('Updating layout.tsx...');
        await s.writeFile('app/layout.tsx', newLayout);

        console.log('Done.');

    } catch (e: any) { console.error('ERROR:', e.message); }
}
main();
