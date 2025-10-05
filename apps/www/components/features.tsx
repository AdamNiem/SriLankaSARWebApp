'use client';

import { Droplet, Satellite, BarChart3, Globe } from 'lucide-react';

const features = [
  {
    icon: <Satellite className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'Satellite Imaging',
    description: 'High-resolution SAR observation data for flood analysis.',
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'AI Predictions',
    description: 'Machine learning models forecast flood risks.',
  },
  {
    icon: <Droplet className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'Weather Insights',
    description: 'Integration with water flow and rainfall data for improved predictions.',
  },
  {
    icon: <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    title: 'Global Coverage',
    description: 'Applicable across regions to help communities worldwide prepare.',
  },
];

export function Features() {
  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-slate-900"> 
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
          Why FloodSAR?
        </h2>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Using SAR analysis to predict flooding and analyse impacts.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-xl shadow-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
            >
              {f.icon}
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
