'use client';

import dynamic from "next/dynamic";

// Dynamically import the Leaflet map (client-side only)
const SriLankaFloodMap = dynamic(() => import("@/components/SriLankaFloodMap"), { ssr: false });

//Dynamic model loading (client side only too)
const TopographyModel = dynamic(() => import("@/components/topography"), {ssr: false });


export function Hero() {
  return (
    <section className="flex flex-col items-center text-center justify-center w-full px-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-20 lg:py-32 relative z-10">

      {/* --- Heading --- */}
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white max-w-4xl">
        Flood Synthetic Aperture Radar (SAR)
      </h1>

      {/* --- Subheading --- */}
      <p className="mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl">
        FloodSAR leverages NASA’s advanced Synthetic Aperture Radar (SAR) technology 
        to detect and analyze flooding events with remarkable precision. 
        It transforms this data into an interactive map, allowing users 
        to explore flood patterns and impacts.
      </p>

      {/* --- Clickable StoryMap Card --- */}
      <div className="pt-16 w-full max-w-6xl mx-auto">
        <div className="relative w-full h-[500px] overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg">
          {/* Iframe */}
          <iframe
            src="https://storymaps.arcgis.com/stories/e13536d81252430a9fa5752879b85f7f?header=false"
            className="w-full h-full border-0 pointer-events-none"
            allowFullScreen
            allow="geolocation"
          />
          {/* Transparent overlay link */}
          <a href="/case-studies" className="absolute inset-0 bg-black opacity-10 hover:opacity-0 transition duration-300">
            <span className="sr-only">Go to case studies</span>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Our Full Analysis - click to view full case study.
        </p>
      </div>


      {/* --- Interactive Flood Map --- */}
      <div className="pt-16 w-full max-w-6xl">
        <div className="relative w-full h-[600px] overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg">
          <SriLankaFloodMap />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Interactive NASA SAR flood map.
        </p>
      </div>

  <div className="pt-16 w-full max-w-6xl">
    <div className="pt-16 w-full max-w-6xl h-[400px] md:h-[500px] lg:h-[600px] flex justify-center">
      <TopographyModel />
    </div>
    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Interactive Visual of the topography of the West Province of Sri Lanka. Height Exaggerated for clarity
    </p>
  </div>


    
    </section>
  );
}
