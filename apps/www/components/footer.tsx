'use client';

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-gray-700 text-center">
      <p className="text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} FloodSAR Project · Built with Next.js, Tailwind, and CSS
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
        Open-source on{' '}
        <a
          href="https://github.com/floodsar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
