'use client';

import dynamic from "next/dynamic";
import { Features } from '@/components/features';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
// Chatbot moved to the Technology page
import { cn } from '@workspace/ui/lib/utils';
import { motion } from 'motion/react';
import { i } from 'motion/react-client';
import { useEffect, useState } from 'react';

const SriLankaFloodMap = dynamic(() => import("@/components/SriLankaFloodMap"), { ssr: false });

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 30 } },
} as const;

export default function HomePage() {
  const [transition, setTransition] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTransition(true), 800);
    const timer2 = setTimeout(() => setIsLoaded(true), 1600);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <main className={cn('relative', !isLoaded && 'overflow-y-hidden')}>
      <div className="flex flex-col">
        {transition && (
          <>
            <motion.div
              variants={CONTENT_VARIANTS}
              initial="hidden"
              animate={transition ? 'visible' : 'hidden'}
              className="w-full"
            >
              {/* Hero Section */}
                <Hero />
            </motion.div>
            <Features />

            {/* Chatbot moved to Flood Prediction page */}

            <Footer />
          </>
        )}
      </div>
    </main>
  );
}
