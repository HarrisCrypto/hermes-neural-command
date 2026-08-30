"use client";

import { Activity, Brain, FolderKanban, List } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { useHermes } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/types";

const NAV: Array<{ id: ViewId; label: string; icon: typeof Brain }> = [
  { id: "brain", label: "Brain", icon: Brain },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "sessions", label: "Sessions", icon: List },
  { id: "logs", label: "Activity", icon: Activity },
];

export function Sidebar() {
  const { view, setView, data, selectSession, setFocusAgentId } = useHermes();
  const maxTool = Math.max(...data.tools.map((t) => t.count), 1);

  return (
    <aside className="flex flex-col gap-1.5 md:min-h-0">
      <Panel title="Nav">
        <nav className="grid grid-cols-4 gap-1 md:grid-cols-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] transition",
                  active
                    ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.12)]"
                    : "border-transparent text-white/60 hover:border-cyan-400/20 hover:bg-cyan-400/6 hover:text-cyan-300",
                )}
              >
                <span className="flex size-3.5 items-center justify-center rounded-[3px] bg-cyan-400/10">
                  <Icon className="size-2.5 stroke-cyan-300" />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </Panel>

      <Panel title="Projects" className="hidden md:block">
        <div className="space-y-1">
          {data.projects.slice(0, 6).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setView("projects")}
              className="w-full rounded border border-white/5 bg-white/2 px-1.5 py-1 text-left hover:border-cyan-400/20 hover:bg-cyan-400/5"
            >
              <div className="truncate text-[10px] font-semibold text-white/80">
                {p.icon} {p.name}
              </div>
              <div className="font-mono mt-0.5 text-[7px] text-white/30">
                {p.category} · {p.progress}%
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Sessions" className="hidden min-h-0 md:block" bodyClassName="max-h-[240px] overflow-y-auto">
        <div className="space-y-1">
          {data.sessions.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                selectSession(s.id);
                setFocusAgentId(s.agentId);
                setView("brain");
              }}
              className="w-full rounded border border-white/5 bg-white/2 px-1.5 py-1 text-left hover:border-cyan-400/20 hover:bg-cyan-400/5"
            >
              <div className="truncate text-[10px] font-semibold text-white/80">{s.title}</div>
              <div className="font-mono mt-0.5 text-[7px] text-white/30">
                {s.model} · {s.source}
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Tools" className="hidden md:block">
        <div className="space-y-1">
          {data.tools.slice(0, 8).map((t) => (
            <div key={t.name} className="flex items-center gap-1.5 text-[8px]">
              <div className="font-mono w-[68px] truncate text-white/55">{t.name}</div>
              <div className="h-[3px] flex-1 overflow-hidden rounded bg-white/5">
                <div
                  className="h-full rounded bg-linear-to-r from-cyan-400 to-fuchsia-500"
                  style={{ width: `${(t.count / maxTool) * 100}%` }}
                />
              </div>
              <div className="font-mono w-6 text-right text-cyan-300">{t.count}</div>
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}
