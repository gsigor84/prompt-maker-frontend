"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingBar({ done = false }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p; // never hit 100% until done
        return p + Math.random() * 4;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [done]);

  return (
    <div className="mt-5">
      {/* bar */}
      <div className="h-[2px] w-full overflow-hidden bg-neutral-200">
        <motion.div
          className="h-full bg-neutral-900"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      {/* percentage */}
      <div className="mt-2 text-right text-xs text-neutral-500 tabular-nums">
        {Math.floor(progress)}%
      </div>
    </div>
  );
}
