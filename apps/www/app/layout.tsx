import { RootProvider } from 'fumadocs-ui/provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Outfit } from 'next/font/google';
import { Header } from '@/components/header';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import './globals.css';
import 'leaflet/dist/leaflet.css';
import { cn } from '@workspace/ui/lib/utils';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s - FloodSAR',
    default: 'FloodSAR - Satellite Imaging for Flood Prediction',
  },
  description:
    'FloodSAR is an open-source project using satellite imaging and AI to predict and monitor flooding events.',
  keywords: [
    'FloodSAR',
    'Satellite Imaging',
    'SAR',
    'Flood Prediction',
    'AI',
    'Open-source',
    'Hydrology',
    'Climate Resilience',
  ],
  authors: [
    {
      name: 'FloodSAR Team',
      url: 'https://github.com/floodsat',
    },
  ],
  publisher: 'FloodSAR',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <head />
      <body className={cn('flex flex-col min-h-screen')}>
        <RootProvider theme={{ defaultTheme: 'dark' }}>
          {/* Header visible on all pages */}
          <Header transition={true} />
          <NuqsAdapter>
            {/* Add top padding equal to header height (96px / 6rem) so fixed header doesn't overlap content */}
            <div className="min-h-[calc(100vh-6rem)]">
              {children}
            </div>
          </NuqsAdapter>
        </RootProvider>
      </body>
    </html>
  );
}
