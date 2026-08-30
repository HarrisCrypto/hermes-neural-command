"use client";

import type { ActivityItem } from "@/lib/types";

export function ActivityStream({ items, limit }: { items: ActivityItem[]; limit?: number }) {
  const rows = limit ? items.slice(0, limit) : items;

  if (!rows.length) {
    return <div className="px-1 py-2 font-mono text-[8px] text-white/30">No pulses on the lattice yet.</div>;
  }

  return (
    <div className="act-log max-h-[140px] space-y-0 overflow-y-auto">
      {rows.map((a) => (
        <div key={a.id} className="flex gap-1.5 border-b border-white/3 py-0.5 font-mono text-[7px]">
          <span className="shrink-0 text-white/25">{a.time}</span>
          <span className="shrink-0 font-bold text-cyan-300">{a.tool}</span>
          <span className="truncate text-white/50">{a.message}</span>
        </div>
      ))}
    </div>
  );
}
