"use client";

import { useEffect } from "react";
import { useHermes } from "@/lib/store";

export function BootSequence() {
  const { setBooted } = useHermes();

  useEffect(() => {
    const done = window.setTimeout(() => setBooted(true), 1100);
    return () => window.clearTimeout(done);
  }, [setBooted]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3.5 bg-[#07060a]">
      <h1 className="font-serif text-[28px] font-medium tracking-[0.4em]">HERMES</h1>
      <p className="text-[11px] tracking-[0.28em] text-[#9aa3b5] uppercase">Opening the room</p>
    </div>
  );
}
