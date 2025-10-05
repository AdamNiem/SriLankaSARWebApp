"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

function BotAvatar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="3" fill="#60A5FA" />
      <circle cx="8" cy="9" r="1.4" fill="#1E3A8A" />
      <circle cx="16" cy="9" r="1.4" fill="#1E3A8A" />
      <path d="M7 13c1 1 3 1 5 0" stroke="#1E3A8A" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// User avatar removed per request (we only render bot profile)

export default function Chatbot() {
  const [messages, setMessages] = useState<{ sender: string; text: string; ts?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // highlight the most recent bot message briefly after loading completes
  const [highlightTs, setHighlightTs] = useState<string | null>(null);
  const prevLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      // loading went from true -> false
      const last = messages[messages.length - 1];
      if (last && last.sender === "bot" && last.ts) {
        setHighlightTs(last.ts);
        const t = setTimeout(() => setHighlightTs(null), 850);
        return () => clearTimeout(t);
      }
    }
    prevLoadingRef.current = loading;
  }, [loading, messages]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore in dev
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // capture the current input so we can clear the input state immediately
    const userText = input.trim();
    const userNow = new Date().toISOString();
    setMessages((prev) => [...prev, { sender: "user", text: userText, ts: userNow }]);
    // clear and focus immediately so typing remains responsive
    setInput("");
    inputRef.current?.focus();
    setLoading(true);

    const start = Date.now();
  let botText = "";
  try {
    // Accept flexible separators (commas or spaces). Date expected as day month year
    // examples accepted: "04 10 2025", "04-10-2025", "04/10/2025"
    const cleaned = userText.replace(/,/g, " ").trim();
    const parts = cleaned.split(/\s+/);
    const lat = parts[0];
    const lon = parts[1];
    const dateParts = parts.slice(2);
    const date = dateParts.join(" ");

    const res = await fetch(
      `/api/floodPredict?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&date=${encodeURIComponent(date)}`
    );
    const data = await res.json();

    if (data.error) {
      // Present server validation or service errors in a friendly way
      botText = `I couldn't process that request: ${data.error}. Please check the input (Latitude, Longitude, Date) and try again.`;
    } else {
      // prefer normalized ISO date if provided
      const iso = data.meta?.normalized_date || date;
      let pretty = iso;
      try {
        const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) {
          const monthName = d.toLocaleString('en-US', { month: 'long' });
          const day = d.getDate() + 1;
          const year = d.getFullYear();
          pretty = `${monthName} ${day}, ${year}`; // e.g. October 4, 2025
        }
      } catch (e) {
        // fallback to raw
      }

      // build sentence: use lon,lat order as requested
      botText = `There is a ${data.flood_probability}% chance of flooding in (${lat}, ${lon}) on ${pretty}`;
    }
  } catch (err) {
    // Network or unexpected errors
    botText = "Sorry — I couldn't reach the prediction service. Please check your connection or try again in a moment.";
  } finally {
    // ensure at least 1 second of response time for UX consistency
    const elapsed = Date.now() - start;
    const minMs = 1000;
    if (elapsed < minMs) {
      await new Promise((res) => setTimeout(res, minMs - elapsed));
    }

    const nowBot = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: botText, ts: nowBot },
    ]);
    setLoading(false);
  }
  };

  return (
  <div className="max-w-4xl mx-auto my-6 h-[70vh] p-6 border rounded-2xl shadow-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 flex flex-col">
      <h2 className="text-lg md:text-2xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-100">
        Flood Prediction Chatbot
      </h2>

      <div className="flex-1 min-h-0 flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto max-h-[60vh] p-4 mb-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700"
          aria-live="polite"
        >
          <div className="flex flex-col gap-3">
          {messages.length === 0 && !loading && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Enter a longitude, latitude, and date and I’ll estimate the flood risk.<br />
              <span className="block mt-1">(e.g. 34.05 -118.25 04-10-2025)</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-2" />

          <AnimatePresence initial={false} onExitComplete={() => {}}>
            {messages.map((msg, i) => {
              
              const isUser = msg.sender === "user";
              const align = isUser ? "justify-end" : "justify-start";
              const bubbleClass = isUser
                ? "max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-snug shadow-sm break-words bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                : "max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-snug shadow-sm break-words bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600 rounded-bl-none";

              const prev = messages[i - 1];
              const showMeta = !prev || prev.sender !== msg.sender;
              const timeLabel = msg.ts ? new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

              return (
                <motion.div
                  key={msg.ts ?? i}
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.995 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`flex ${align} items-end gap-2`}
                >
                  {/* avatar */}
                  {!isUser && showMeta && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.16 }}
                      className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-600 flex items-center justify-center text-sm text-blue-700 dark:text-blue-200"
                      aria-hidden
                    >
                      <BotAvatar />
                    </motion.div>
                  )}

                  <div className="flex flex-col items-start">
                    {showMeta && (
                      <div className={`text-[11px] uppercase tracking-wider opacity-80 mb-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {isUser ? 'You' : 'Flood Predictor'} {timeLabel ? ` • ${timeLabel}` : ''}
                      </div>
                    )}

                    <motion.div
                      className={bubbleClass + ' relative group'}
                      animate={msg.ts && msg.ts === highlightTs ? { boxShadow: ["0 0 0 rgba(59,130,246,0)", "0 0 18px rgba(59,130,246,0.18)", "0 0 0 rgba(59,130,246,0)"], scale: [1, 1.01, 1] } : undefined}
                      transition={msg.ts && msg.ts === highlightTs ? { duration: 0.85, times: [0, 0.5, 1], ease: 'easeOut' } : {}}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {/* copy/time buttons removed per request */}
                    </motion.div>

                    {/* user profile is intentionally hidden; only bot shows an avatar */}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-yellow-50 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 border border-yellow-100 dark:border-yellow-700 text-sm">
                Analyzing SAR data...
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex gap-2 items-center">
            <input
              aria-label="Chat input"
              className="flex-grow border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Enter latitude, longitude, date"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
            >
          {loading ? "Analyzing…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
