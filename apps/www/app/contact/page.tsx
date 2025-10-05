export default function ContactPage() {
  return (
    <main className="min-h-screen pt-24 p-10 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg mb-6 max-w-3xl">
        Get in touch to collaborate, contribute, or learn more about FloodSAR.
      </p>

      <form className="max-w-lg space-y-4">
        <input
          type="text"
          placeholder="Your name"
          className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700"
        />
        <input
          type="email"
          placeholder="Your email"
          className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700"
        />
        <textarea
          placeholder="Your message"
          rows={5}
          className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-gray-700"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </main>
  );
}
