"use client";

import { useEffect, useState } from "react";
import { useHermes } from "@/lib/store";

const LINES = [
  "HERMES NDS v15 — neural command",
  "Establishing holographic uplink…",
  "Calibrating Jarvis cognitive layer…",
  "Spinning agent constellation…",
  "Synaptic mesh online",
  "Core lock acquired — READY",
];

export function BootSequence() {
  const { setBooted } = useHermes();
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineTimer = window.setInterval(() => {
      setShown((n) => Math.min(LINES.length, n + 1));
    }, 380);
    const prog = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 3.4));
    }, 70);
    const done = window.setTimeout(() => setBooted(true), 3200);
    return () => {
      window.clearInterval(lineTimer);
      window.clearInterval(prog);
      window.clearTimeout(done);
    };
  }, [setBooted]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="logo-mark mb-6 size-16 text-2xl">
        <span>H</span>
      </div>
      <div className="font-display mb-1 bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-2xl font-extrabold tracking-[0.28em] text-transparent">
        HERMES
      </div>
      <div className="font-mono mb-8 text-[10px] tracking-[0.22em] text-cyan-300/60">NEURAL COMMAND CENTER</div>
      <div className="mb-6 w-full max-w-md space-y-1.5">
        {LINES.slice(0, shown).map((line) => (
          <div key={line} className="font-mono text-[10px] text-cyan-200/80">
            ▸ {line}
          </div>
        ))}
      </div>
      <div className="h-1 w-full max-w-md overflow-hidden rounded bg-white/8">
        <div className="h-full bg-linear-to-r from-cyan-400 via-fuchsia-500 to-pink-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="font-mono mt-3 text-[9px] text-white/35">{Math.round(progress)}%</div>
    </div>
  );
}
