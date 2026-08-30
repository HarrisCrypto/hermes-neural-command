"use client";

import { Panel } from "@/components/dashboard/Panel";
import { useHermes } from "@/lib/store";

export function ProjectsView() {
  const { data } = useHermes();

  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[8px] text-cyan-400/60">{data.projects.length} programmes on the board</div>
      {data.projects.length === 0 ? (
        <Panel title="Projects">
          <div className="py-10 text-center font-mono text-[9px] text-white/30">No programmes in the vault.</div>
        </Panel>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {data.projects.map((p) => (
            <article key={p.id} className="hud-panel transition hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)]">
              <div className="flex items-start gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-sm">
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-bold">{p.name}</h3>
                  <div className="font-mono mt-0.5 text-[8px] text-white/35">
                    {p.category} · {p.updated}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-white/55">{p.description}</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between font-mono text-[7px] text-white/40">
                  <span>PROGRESS</span>
                  <span className="text-cyan-300">{p.progress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded bg-white/6">
                  <div className="h-full bg-linear-to-r from-cyan-400 to-fuchsia-500" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
