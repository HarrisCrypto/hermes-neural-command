"use client";

import { Panel } from "@/components/dashboard/Panel";
import { useHermes } from "@/lib/store";

export function LogsView() {
  const { data } = useHermes();

  return (
    <Panel title="Activity Feed">
      {data.activity.length === 0 ? (
        <div className="py-10 text-center font-mono text-[9px] text-white/30">Waiting for the first pulse.</div>
      ) : (
        <div className="act-log max-h-[420px] overflow-y-auto">
          {data.activity.map((a) => (
            <div key={a.id} className="flex gap-2 border-b border-white/4 py-1 font-mono text-[8px]">
              <span className="w-16 shrink-0 text-white/25">{a.time}</span>
              <span className="w-24 shrink-0 font-bold text-cyan-300">{a.tool}</span>
              <span className="text-white/60">{a.message}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
