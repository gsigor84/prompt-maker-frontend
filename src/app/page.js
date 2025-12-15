"use client";

import { useState } from "react";
import Image from "next/image";
import LoadingBar from "@/components/LoadingBar";

export default function Home() {
  const [task, setTask] = useState("");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);

  const makePrompt = async () => {
    if (!task.trim() || loading) return;

    setLoading(true);
    setPromptText("");

    try {
      const res = await fetch(
        "https://prompt-maker-backend.fly.dev/api/prompt/full",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task }),
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Backend error");
      }

      const data = await res.json();

      // ✅ ONLY show the final prompt string
      setPromptText(data?.prompt ?? "No prompt returned.");
    } catch (err) {
      setPromptText(
        "Error generating prompt. Check your backend logs / endpoint."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-neutral-950 px-4 py-12 md:py-16">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute right-[-140px] top-10 h-[560px] w-[560px] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute left-1/2 top-[55%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Image
            src="/logo_prompt.jpg"
            alt="PromptForge logo"
            width={44}
            height={44}
            priority
          />

          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              PromptForge
            </h1>
            <p className="mt-2 max-w-2xl text-base md:text-lg text-white/70">
              Type a task → click Make Prompt → get a ready-to-use AI prompt.
            </p>
          </div>
        </div>

        {/* White canvas */}
        <section className="mt-8 md:mt-10 bg-neutral-50 p-5 md:p-10">
          <div className="mx-auto max-w-3xl">
            {/* pill bar + wrap-friendly textarea (same look) */}
            <div className="flex items-center rounded-full border border-neutral-300 bg-white px-2 py-2 transition hover:border-neutral-400">
              <button
                onClick={makePrompt}
                disabled={loading}
                className="ml-1 inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-semibold tracking-widest text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "WORKING…" : "MAKE PROMPT"}
              </button>

              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Type what you want the AI to do…"
                className="
                  w-full bg-transparent px-4
                  text-sm text-neutral-900 placeholder:text-neutral-400
                  outline-none resize-none

                  /* Mobile: taller so long text is visible */
                  h-20 leading-snug py-3

                  /* Desktop: looks like a normal search bar */
                  md:h-10 md:py-2 md:leading-[1.25rem]
                "
              />
            </div>

            {/* Loading bar + % */}
            {loading && <LoadingBar />}

            {/* ONLY THE PROMPT OUTPUT */}
            {promptText && !loading && (
              <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-widest text-neutral-500">
                    GENERATED PROMPT
                  </p>

                  <button
                    onClick={() => navigator.clipboard.writeText(promptText)}
                    className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-80"
                  >
                    Copy
                  </button>
                </div>

                <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-900">
                  {promptText}
                </pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
