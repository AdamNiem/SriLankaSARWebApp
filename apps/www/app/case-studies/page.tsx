export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="https://storymaps.arcgis.com/stories/e13536d81252430a9fa5752879b85f7f"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        allow="geolocation"
      ></iframe>
    </div>
    </main>
  );
}
