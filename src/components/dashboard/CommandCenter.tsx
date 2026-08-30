"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { HermesProvider, useHermes } from "@/lib/store";
import { BootSequence } from "@/components/dashboard/BootSequence";
import { JarvisConsole } from "@/components/dashboard/JarvisConsole";
import { Gauges, LineChart } from "@/components/dashboard/Charts";
import { fmt, fmtCost } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workNodes } from "@/lib/work";

const BrainCanvas = dynamic(
  () => import("@/components/brain/BrainCanvas").then((m) => m.BrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-serif text-[#d4af7a]/70 italic">
        Opening the core…
      </div>
    ),
  },
);

const LABELS = {
  websocket: "Live stream",
  polling: "Live agent",
  ingest: "Pushed feed",
  mesh: "Local mesh",
} as const;

function Shell() {
  const {
    booted,
    data,
    fps,
    feedKind,
    feedLive,
    feedOrigin,
    setFeedOrigin,
    feedError,
    focusAgentId,
    setFocusAgentId,
    selectSession,
    sendCommand,
  } = useHermes();
  const [uplinkOpen, setUplinkOpen] = useState(false);
  const nodules = workNodes(data);
  const focusProject = nodules.find((p) => p.id === focusAgentId);
  const focusAgent = data.agents.find((a) => a.id === focusAgentId);
  const maxTool = Math.max(...data.tools.map((t) => t.count), 1);

  if (!booted) return <BootSequence />;

  return (
    <div className="room grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] gap-2 p-2 md:grid-cols-[230px_1fr]">
      <header className="glass md:col-span-2 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-serif text-[18px] tracking-[0.26em]">
              HERMES <span className="text-[#d4af7a]">NDS</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] tracking-[0.18em] text-[#9aa3b5] uppercase">
              <i className={cn("size-1.5 rounded-full", feedLive ? "bg-[#3ee0c8] shadow-[0_0_12px_#3ee0c8]" : "bg-[#c45a4a]")} />
              {LABELS[feedKind]}
              <button type="button" onClick={() => setUplinkOpen((v) => !v)} className="tracking-[0.14em]">
                Uplink
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip v={fmt(data.totals.sessions)} l="Sessions" />
            <Chip v={fmt(data.totals.calls)} l="Calls" />
            <Chip v={fmt(data.totals.tokens)} l="Tokens" />
            <Chip v={fmtCost(data.totals.cost)} l="Spend" />
            <Chip v={fmt(data.totals.messages)} l="Messages" />
            <Chip v={`${Math.round(data.cognitiveLoad)}%`} l="Load" />
          </div>
        </div>
        {uplinkOpen && (
          <input
            defaultValue={feedOrigin}
            onBlur={(e) => setFeedOrigin(e.target.value)}
            placeholder="https://your-tunnel.trycloudflare.com"
            className="mt-2 w-full border-0 border-b border-white/10 bg-transparent py-2 text-[13px] outline-none"
          />
        )}
        {feedError && <p className="mt-1 text-[12px] text-rose-300">{feedError}</p>}
      </header>

      <aside className="grid grid-cols-2 gap-2 md:flex md:min-h-0 md:flex-col">
        <Side title="Programmes">
          {data.projects.length === 0 ? (
            <p className="font-serif text-[12px] text-[#9aa3b5] italic">No programmes yet.</p>
          ) : (
            data.projects.slice(0, 6).map((p) => (
              <button key={p.id} type="button" onClick={() => sendCommand(`tell me about ${p.name}`)} className="w-full border-b border-white/6 py-1.5 text-left last:border-0">
                <div className="flex justify-between gap-2 text-[12px]">
                  <span className="truncate">{p.name}</span>
                  <span className="font-serif text-[#d4af7a]">{p.progress}</span>
                </div>
                <div className="mt-1 h-0.5 overflow-hidden rounded bg-white/8">
                  <div className="h-full bg-[#d4af7a]" style={{ width: `${p.progress}%` }} />
                </div>
              </button>
            ))
          )}
        </Side>
        <Side title="Sessions" grow>
          {data.sessions.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                selectSession(s.id);
                setFocusAgentId(s.agentId);
                sendCommand(`tell me about ${s.title}`);
              }}
              className="w-full border-b border-white/6 py-1.5 text-left last:border-0"
            >
              <div className="flex justify-between gap-2 text-[12px]">
                <span className="truncate">{s.title}</span>
                <span className={s.active ? "text-[#3ee0c8]" : "text-[#9aa3b5]"}>{s.active ? "live" : "idle"}</span>
              </div>
              <p className="text-[10px] text-[#9aa3b5]">
                {s.model} · {fmt(s.toolCalls)} · {fmtCost(s.cost)}
              </p>
            </button>
          ))}
        </Side>
        <Side title="Tools" wide>
          {data.tools.slice(0, 8).map((t) => (
            <button key={t.name} type="button" onClick={() => sendCommand(`how much do we use ${t.name}`)} className="flex w-full items-center gap-2 py-1 text-left text-[11px]">
              <span className="w-16 truncate">{t.name}</span>
              <span className="h-0.5 flex-1 overflow-hidden rounded bg-white/8">
                <span className="block h-full bg-[#3ee0c8]" style={{ width: `${(t.count / maxTool) * 100}%` }} />
              </span>
              <span className="w-8 text-right text-[#9aa3b5]">{fmt(t.count)}</span>
            </button>
          ))}
        </Side>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-col gap-2">
        <section className="relative min-h-[300px] flex-1 overflow-hidden rounded-[14px] border border-white/8 bg-[#050408]">
          <BrainCanvas />
          <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex justify-between">
            <Badge>Neural core · v15</Badge>
            <Badge>{`${fps} FPS`}</Badge>
          </div>
          <div className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#d4af7a]/35 bg-[#07060a]/80 px-3 py-1 text-[9px] tracking-[0.14em] text-[#d4af7a] uppercase">
            Cognitive load {Math.round(data.cognitiveLoad)}%
          </div>
          {(focusProject || focusAgent) && (
            <div className="pointer-events-none absolute top-[18%] right-0 left-0 z-10 text-center">
              <h2 className="font-serif text-[clamp(22px,4vw,40px)] italic [text-shadow:0_0_28px_rgba(212,175,122,.45)]">
                {focusProject?.name ?? focusAgent?.name}
              </h2>
              <p className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase">
                {focusProject
                  ? `Project · ${focusProject.progress}%`
                  : `${focusAgent?.role} · ${Math.round(focusAgent?.load ?? 0)}% load`}
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-2 bottom-[86px] z-10 flex flex-wrap gap-1.5">
            <Mini l="Nodes" v={String(nodules.length)} />
            <Mini l="Projects" v={String(data.projects.length || nodules.length)} />
            <Mini l="Synapses" v={String(Math.max(0, nodules.length * 3))} />
            <Mini l="CPU" v={`${Math.round(data.system.cpu)}%`} />
            <Mini l="Mem" v={`${data.system.memoryUsed.toFixed(0)}/${data.system.memoryTotal}`} />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-linear-to-b from-transparent to-[#07060a]/80 px-2 pt-2 pb-2">
            <JarvisConsole />
          </div>
        </section>

        <div className="grid gap-2 md:grid-cols-3">
          <Side title="Cortical activity">
            <Gauges brain={data.brain} />
          </Side>
          <Side title="Throughput">
            <LineChart series={data.throughput} />
          </Side>
          <Side title="System">
            <Sys k="CPU" v={`${Math.round(data.system.cpu)}%`} p={data.system.cpu} />
            <Sys k="Memory" v={`${data.system.memoryUsed.toFixed(1)} / ${data.system.memoryTotal}`} p={(data.system.memoryUsed / Math.max(data.system.memoryTotal, 1)) * 100} />
            <Sys k="Disk" v={`${Math.round(data.system.disk)}%`} p={data.system.disk} />
            <Sys k="Network" v={`${Math.round(data.system.networkMb)} MB`} p={Math.min(100, data.system.networkMb / 4)} />
          </Side>
        </div>

        <Side title="Activity stream">
          <div className="max-h-[120px] overflow-auto">
            {data.activity.slice(0, 16).map((e) => (
              <div key={e.id} className="py-0.5 text-[11px] text-[#c5ccd8]">
                <span className="mr-2 text-[10px] text-[#9aa3b5]">{e.time}</span>
                <b className="font-medium text-[#d4af7a]">{e.tool}</b> {e.message}
              </div>
            ))}
          </div>
        </Side>
      </main>
    </div>
  );
}

function Chip({ v, l }: { v: string; l: string }) {
  return (
    <div className="min-w-[58px] rounded-lg border border-[#d4af7a]/14 bg-[#d4af7a]/5 px-2 py-1 text-center">
      <div className="font-serif text-[16px] leading-none text-[#d4af7a]">{v}</div>
      <div className="mt-0.5 text-[8px] tracking-[0.12em] text-[#9aa3b5] uppercase">{l}</div>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-white/8 bg-[#07060a]/75 px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#d4af7a] uppercase">
      {children}
    </span>
  );
}

function Mini({ l, v }: { l: string; v: string }) {
  return (
    <span className="rounded-md border border-white/8 bg-[#07060a]/75 px-1.5 py-0.5 text-[10px] text-[#c9d0dc]">
      {l} <b className="font-medium text-[#3ee0c8]">{v}</b>
    </span>
  );
}

function Side({ title, children, grow, wide }: { title: string; children: ReactNode; grow?: boolean; wide?: boolean }) {
  return (
    <section className={cn("glass min-h-0 overflow-auto p-2.5", grow && "md:flex-1", wide && "col-span-2 md:col-span-1")}>
      <div className="mb-2 text-[9px] tracking-[0.2em] text-[#d4af7a] uppercase">{title}</div>
      {children}
    </section>
  );
}

function Sys({ k, v, p }: { k: string; v: string; p: number }) {
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-[9px] tracking-[0.16em] text-[#9aa3b5] uppercase">{k}</span>
        <span>{v}</span>
      </div>
      <div className="mt-1 h-0.5 overflow-hidden rounded bg-white/8">
        <div className="h-full bg-[#3ee0c8]" style={{ width: `${Math.min(100, p)}%` }} />
      </div>
    </div>
  );
}

export function CommandCenter() {
  return (
    <HermesProvider>
      <Shell />
    </HermesProvider>
  );
}
