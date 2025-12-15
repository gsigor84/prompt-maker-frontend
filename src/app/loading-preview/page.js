"use client";

import { motion } from "framer-motion";

export default function LoadingPreview() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white">
          Loading animation preview
        </h1>

        <div className="bg-neutral-50 p-8">
          <div className="flex items-center rounded-full border border-neutral-300 bg-white px-2 py-2">
            <button className="ml-1 inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-semibold tracking-widest text-white">
              MAKE PROMPT
            </button>

            <input
              disabled
              placeholder="Type what you want the AI to do…"
              className="h-10 w-full bg-transparent px-4 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="mt-5 h-[2px] w-full overflow-hidden bg-neutral-200">
            <motion.div
              className="h-full w-1/3 bg-neutral-900"
              initial={{ x: "-120%" }}
              animate={{ x: ["-120%", "320%"] }}
              transition={{
                repeat: Infinity,
                duration: 1.1,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
