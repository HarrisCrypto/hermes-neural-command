"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { fmtClock, fmtCost } from "@/lib/format";
import { useHermes } from "@/lib/store";

function subscribeClock(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

export function Header() {
  const { data, thinking, boosted } = useHermes();
  const clock = useSyncExternalStore(subscribeClock, fmtClock, () => "--:--:--");

  return (
    <header className="hud-panel relative overflow-hidden px-4 py-2 shadow-[0_0_20px_rgba(0,240,255,0.28)]">
      <div className="scan-bar" />
      <div className="relative z-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="logo-mark">
            <span>H</span>
          </div>
          <div>
            <div className="font-display bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-[16px] font-extrabold tracking-[0.14em] text-transparent">
              HERMES
            </div>
            <div className="font-mono mt-0.5 flex items-center gap-2 text-[8px] text-white/50">
              <span className={`status-dot ${thinking ? "hot" : boosted ? "boost" : ""}`} />
              NDS v15 · {clock}
              {thinking && <span className="text-cyan-300"> · THINKING</span>}
              {boosted && !thinking && <span className="text-fuchsia-300"> · BOOST</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Stat value={<AnimatedNumber value={data.totals.sessions} />} label="Sessions" />
          <Stat value={<AnimatedNumber value={data.totals.tokens} />} label="Tokens" />
          <Stat value={<AnimatedNumber value={data.totals.calls} />} label="Calls" />
          <Stat value={<AnimatedNumber value={data.totals.cost} format={fmtCost} />} label="Cost" />
          <Stat value={<AnimatedNumber value={data.totals.messages} />} label="Messages" />
          <Stat value={`${Math.round(data.cognitiveLoad)}%`} label="Load" />
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="min-w-[58px] rounded-md border border-cyan-400/10 bg-cyan-400/4 px-2 py-1 text-center">
      <div className="font-mono text-[13px] font-bold text-cyan-300">{value}</div>
      <div className="text-[7px] tracking-[0.08em] text-white/40 uppercase">{label}</div>
    </div>
  );
}
