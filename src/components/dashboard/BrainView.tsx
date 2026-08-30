"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useHermes } from "@/lib/store";
import { fmt, fmtCost } from "@/lib/format";
import { Gauges, LineChart, RadarChart } from "@/components/dashboard/Charts";
import { Panel } from "@/components/dashboard/Panel";
import { ActivityStream } from "@/components/dashboard/ActivityStream";

const BrainCanvas = dynamic(
  () => import("@/components/brain/BrainCanvas").then((m) => m.BrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-mono text-[10px] tracking-[0.2em] text-cyan-300/60">
        SPINNING UP NEURAL CORE…
      </div>
    ),
  },
);

export function BrainView() {
  const { data, fps, hoverAgentId, focusAgentId, selectedSessionId, selectSession, setFocusAgentId } = useHermes();
  const hover = data.agents.find((a) => a.id === hoverAgentId);
  const selectedAgent = data.agents.find((a) => a.id === (focusAgentId ?? undefined));
  const selected =
    data.sessions.find((s) => s.id === selectedSessionId) ??
    data.sessions.find((s) => s.agentId === focusAgentId);
  const showPopup = Boolean(selectedAgent || selected);

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="hero-frame relative min-h-[280px] flex-1 overflow-hidden md:min-h-[420px]">
        <BrainCanvas />
        <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex justify-between">
          <Badge>NEURAL CORE · v15</Badge>
          <Badge>{fps} FPS</Badge>
        </div>
        <div className="cog-pill pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2">
          COGNITIVE LOAD: {Math.round(data.cognitiveLoad)}%
        </div>
        <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex flex-wrap gap-1.5">
          <Mini label="Nodes" value={String(data.sessions.length)} />
          <Mini label="Agents" value={String(data.agents.length)} />
          <Mini label="Synapses" value={fmt(data.totals.calls)} />
          <Mini label="CPU" value={`${Math.round(data.system.cpu)}%`} />
          <Mini
            label="MEM"
            value={`${data.system.memoryUsed.toFixed(0)}/${data.system.memoryTotal}GB`}
          />
        </div>
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 font-mono text-[7px] whitespace-nowrap text-cyan-400/30">
          Drag to rotate · Scroll to zoom · Click nodes for details
        </div>
        {hover && (
          <div className="pointer-events-none absolute top-14 right-3 z-20 rounded border border-cyan-400/30 bg-[#04070e]/90 px-2 py-1 font-mono text-[8px] text-cyan-300">
            {hover.name} · {hover.role} · {hover.status}
          </div>
        )}
        {showPopup && (
          <div className="absolute right-3 bottom-14 z-20 w-[220px] rounded-[10px] border border-cyan-400/25 bg-[#04070e]/95 p-3 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-md">
            <button
              type="button"
              className="absolute top-1.5 right-1.5 flex size-[18px] items-center justify-center rounded border border-white/10 text-[10px] text-white/40 hover:border-rose-400/40 hover:text-rose-300"
              onClick={() => {
                selectSession(null);
                setFocusAgentId(null);
              }}
            >
              ×
            </button>
            <div className="pr-4 text-[11px] font-bold">{selected?.title ?? selectedAgent?.name ?? "Agent"}</div>
            <div className="font-mono mb-2 text-[7px] font-semibold tracking-[0.12em] text-fuchsia-400 uppercase">
              {selected?.model ?? selectedAgent?.role ?? "CORE"}
              {selected?.source ? ` · ${selected.source}` : ""}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <PopStat v={fmt(selected?.toolCalls ?? 0)} l="Tools" />
              <PopStat v={fmt(selected?.messages ?? Math.round(selectedAgent?.load ?? 0))} l={selected ? "Msgs" : "Load"} />
              <PopStat v={selected ? fmtCost(selected.cost) : `${Math.round(selectedAgent?.load ?? 0)}%`} l={selected ? "Cost" : "Load"} />
              <PopStat v={selected ? (selected.active ? "LIVE" : "—") : (selectedAgent?.status ?? "—").toUpperCase()} l="Status" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-1 py-0.5 font-mono text-[6px] text-fuchsia-300">
                {selectedAgent?.name ?? "AGENT"}
              </span>
              <span className="rounded border border-fuchsia-400/25 bg-fuchsia-500/10 px-1 py-0.5 font-mono text-[6px] text-fuchsia-300">
                {selected?.model ?? selectedAgent?.role ?? "core"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Panel title="Activity" collapsible icon={<span className="text-cyan-400">◎</span>}>
          <Gauges brain={data.brain} />
          <RadarChart brain={data.brain} />
        </Panel>
        <Panel title="Performance" collapsible icon={<span className="text-cyan-400">▦</span>}>
          <LineChart series={data.throughput} />
        </Panel>
        <Panel title="System" collapsible icon={<span className="text-cyan-400">▣</span>}>
          <div className="grid grid-cols-2 gap-1">
            <Sys label="CPU" value={`${Math.round(data.system.cpu)}%`} pct={data.system.cpu} />
            <Sys
              label="Memory"
              value={`${data.system.memoryUsed.toFixed(1)}/${data.system.memoryTotal}GB`}
              pct={(data.system.memoryUsed / data.system.memoryTotal) * 100}
            />
            <Sys label="Disk" value={`${Math.round(data.system.disk)}%`} pct={data.system.disk} />
            <Sys label="Network" value={`${Math.round(data.system.networkMb)} MB`} pct={Math.min(100, data.system.networkMb / 4)} accent />
          </div>
        </Panel>
      </div>

      <Panel title="Stream" icon={<span className="text-cyan-400">≡</span>}>
        <ActivityStream items={data.activity} limit={12} />
      </Panel>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className="rounded border border-cyan-400/20 bg-[#060c1c]/80 px-2 py-0.5 font-mono text-[8px] text-cyan-300 backdrop-blur">
      {children}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 rounded border border-cyan-400/15 bg-[#060c1c]/80 px-1.5 py-0.5 font-mono text-[8px] text-white/70 backdrop-blur">
      {label}: <span className="font-bold text-cyan-300">{value}</span>
    </div>
  );
}

function PopStat({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded border border-cyan-400/10 bg-cyan-400/5 px-1.5 py-1">
      <div className="font-mono text-[12px] font-bold text-cyan-300">{v}</div>
      <div className="font-display mt-0.5 text-[5px] tracking-[0.1em] text-white/30 uppercase">{l}</div>
    </div>
  );
}

function Sys({
  label,
  value,
  pct,
  accent,
}: {
  label: string;
  value: string;
  pct: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-cyan-400/8 bg-cyan-400/4 p-1.5">
      <div className="font-display text-[6px] tracking-[0.1em] text-white/35 uppercase">{label}</div>
      <div className="font-mono mt-0.5 text-[14px] font-bold text-cyan-300">{value}</div>
      <div className="mt-1 h-0.5 overflow-hidden rounded bg-white/6">
        <div
          className={accent ? "h-full bg-linear-to-r from-fuchsia-500 to-pink-400" : "h-full bg-linear-to-r from-cyan-400 to-fuchsia-500"}
          style={{ width: `${Math.min(100, pct)}%`, transition: "width 1s ease" }}
        />
      </div>
    </div>
  );
}
