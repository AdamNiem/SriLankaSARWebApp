'use client';

import Link from 'next/link';

export function Header({ transition }: { transition: boolean }) {
  return (
    <header className="fixed w-full top-0 left-0 z-50 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        FloodSAR
      </Link>
      <nav className="flex space-x-6 text-gray-700 dark:text-gray-200">
        <Link href="/about">About</Link>
  <Link href="/technology">Flood Prediction</Link>
        <Link href="/case-studies">Sri Lanka</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
