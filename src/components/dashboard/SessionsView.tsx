"use client";

import { Brain } from "lucide-react";
import { fmt, fmtCost } from "@/lib/format";
import { useHermes } from "@/lib/store";

export function SessionsView() {
  const { data, selectSession, setFocusAgentId, setView } = useHermes();

  if (!data.sessions.length) {
    return <div className="py-16 text-center font-mono text-[9px] text-white/30">No sessions in the neural buffer.</div>;
  }

  return (
    <div className="grid gap-2">
      {data.sessions.map((s) => {
        const agent = data.agents.find((a) => a.id === s.agentId);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              selectSession(s.id);
              setFocusAgentId(s.agentId);
              setView("brain");
            }}
            className="hud-panel w-full text-left transition hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)]"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                <Brain className="size-4 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[13px] font-bold">{s.title}</h3>
                  <span className={`font-mono text-[7px] ${s.active ? "text-emerald-300" : "text-white/30"}`}>
                    {s.active ? "LIVE" : "IDLE"}
                  </span>
                </div>
                <div className="font-mono mt-0.5 text-[8px] text-white/35">
                  {s.model} · {s.source} · {agent?.name ?? "unbound"}
                </div>
                <div className="font-mono mt-2 flex flex-wrap gap-3 text-[8px] text-cyan-300/80">
                  <span>{fmt(s.toolCalls)} tools</span>
                  <span>{fmt(s.messages)} msgs</span>
                  <span>{fmt(s.inputTokens + s.outputTokens)} tok</span>
                  <span>{fmtCost(s.cost)}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
