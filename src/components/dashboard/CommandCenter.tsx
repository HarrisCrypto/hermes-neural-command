"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { HermesProvider, useHermes } from "@/lib/store";
import { BootSequence } from "@/components/dashboard/BootSequence";
import { JarvisConsole } from "@/components/dashboard/JarvisConsole";
import { fmt, fmtCost } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  const focus = data.agents.find((a) => a.id === focusAgentId);

  if (!booted) return <BootSequence />;

  return (
    <div className="min-h-dvh bg-[#07060a] pb-10">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/6 bg-[#07060a]/80 px-4 py-3 backdrop-blur-xl">
        <div className="font-serif text-[20px] tracking-[0.28em]">
          HERMES <span className="text-[#d4af7a]">NDS</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setUplinkOpen((v) => !v)} className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase">
            Uplink
          </button>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#9aa3b5] uppercase">
            <i className={cn("size-1.5 rounded-full", feedLive ? "bg-[#3ee0c8] shadow-[0_0_12px_#3ee0c8]" : "bg-[#c45a4a] shadow-[0_0_10px_#c45a4a]")} />
            {LABELS[feedKind]}
          </div>
        </div>
      </header>

      {uplinkOpen && (
        <div className="glass mx-4 mt-3 p-4">
          <div className="text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase">Agent origin</div>
          <input
            defaultValue={feedOrigin}
            onBlur={(e) => setFeedOrigin(e.target.value)}
            placeholder="https://your-tunnel.trycloudflare.com"
            className="mt-2 w-full border-0 border-b border-white/10 bg-transparent py-2 text-[13px] outline-none"
          />
          {feedError && <p className="mt-2 text-[12px] text-rose-300">{feedError}</p>}
        </div>
      )}

      <section className="grid grid-cols-2 gap-2 px-4 py-3 md:grid-cols-5">
        <Stat k="Sessions" v={fmt(data.totals.sessions)} />
        <Stat k="Tool calls" v={fmt(data.totals.calls)} />
        <Stat k="Tokens" v={fmt(data.totals.tokens)} />
        <Stat k="Spend" v={fmtCost(data.totals.cost)} />
        <Stat k="Load" v={`${Math.round(data.cognitiveLoad)}%`} />
      </section>

      <section id="jarvis" className="mx-4 overflow-hidden rounded-[22px] border border-white/8 bg-black/40">
        <div className="relative h-[min(62vh,560px)] min-h-[320px]">
          <BrainCanvas />
          <div className="vignette pointer-events-none absolute inset-0" />
          {focus && (
            <div className="pointer-events-none absolute top-8 right-0 left-0 text-center">
              <h2 className="font-serif text-[clamp(26px,5vw,44px)] italic">{focus.name}</h2>
              <p className="mt-1 text-[11px] tracking-[0.2em] text-[#9aa3b5] uppercase">
                {focus.role} · {Math.round(focus.load)}% load
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-center px-3 pt-2 pb-5">
          <JarvisConsole />
        </div>
      </section>

      <div className="mt-6 grid gap-3 px-4 lg:grid-cols-2">
        <article className="glass p-4">
          <div className="k">Programmes</div>
          {data.projects.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#9aa3b5]">
              No deliverables on the wire. Sessions below still name the live work — ask Jarvis about any of them.
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {data.projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => sendCommand(`tell me about ${p.name}`)}
                  className="w-full border-b border-white/6 pb-3 text-left last:border-0 last:pb-0"
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-[#d4af7a]">{p.progress}%</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#9aa3b5]">{p.description}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded bg-white/8">
                    <div className="h-full bg-[#d4af7a]" style={{ width: `${p.progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="glass p-4">
          <div className="k">Sessions</div>
          {data.sessions.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#9aa3b5]">Waiting for Hermes sessions.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {data.sessions.slice(0, 10).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    selectSession(s.id);
                    setFocusAgentId(s.agentId);
                    sendCommand(`tell me about ${s.title}`);
                  }}
                  className="flex w-full flex-col gap-1 border-b border-white/6 py-2 text-left last:border-0"
                >
                  <div className="flex justify-between gap-3">
                    <span className="truncate">{s.title}</span>
                    <span className={s.active ? "text-[#3ee0c8]" : "text-[#9aa3b5]"}>{s.active ? "live" : "idle"}</span>
                  </div>
                  <div className="text-[11px] text-[#9aa3b5]">
                    {s.model} · {fmt(s.toolCalls)} tools · {fmtCost(s.cost)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="glass p-4">
          <div className="k">Tools & usage</div>
          {data.tools.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#9aa3b5]">No tool histogram yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.tools.slice(0, 8).map((t) => {
                const max = Math.max(...data.tools.map((x) => x.count), 1);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => sendCommand(`how much do we use ${t.name}`)}
                    className="flex w-full items-center gap-2 text-left text-[12px]"
                  >
                    <span className="w-24 truncate text-[#c9d0dc]">{t.name}</span>
                    <span className="h-1 flex-1 overflow-hidden rounded bg-white/8">
                      <span className="block h-full bg-[#3ee0c8]" style={{ width: `${(t.count / max) * 100}%` }} />
                    </span>
                    <span className="w-10 text-right text-[#d4af7a]">{fmt(t.count)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="glass p-4">
          <div className="k">System</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Sys k="CPU" v={`${Math.round(data.system.cpu)}%`} p={data.system.cpu} />
            <Sys k="Memory" v={`${data.system.memoryUsed.toFixed(1)}/${data.system.memoryTotal}GB`} p={(data.system.memoryUsed / Math.max(data.system.memoryTotal, 1)) * 100} />
            <Sys k="Disk" v={`${Math.round(data.system.disk)}%`} p={data.system.disk} />
            <Sys k="Network" v={`${Math.round(data.system.networkMb)} MB`} p={Math.min(100, data.system.networkMb / 4)} />
          </div>
        </article>
      </div>

      <article className="glass mx-4 mt-3 p-4">
        <div className="k">Live activity</div>
        <div className="mt-2 max-h-[280px] space-y-2 overflow-auto">
          {data.activity.length === 0 ? (
            <p className="text-[13px] text-[#9aa3b5]">Waiting for Hermes…</p>
          ) : (
            data.activity.slice(0, 24).map((e) => (
              <div key={e.id} className="text-[12px] leading-snug text-[#b8c0ce]">
                <span className="mr-2 text-[10px] text-[#9aa3b5]">{e.time}</span>
                <b className="font-medium text-[#d4af7a]">{e.tool}</b> {e.message}
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="glass px-3 py-2">
      <div className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase">{k}</div>
      <div className="font-serif mt-0.5 text-[22px]">{v}</div>
    </div>
  );
}

function Sys({ k, v, p }: { k: string; v: string; p: number }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase">{k}</div>
      <div className="mt-0.5 text-[16px]">{v}</div>
      <div className="mt-1.5 h-1 overflow-hidden rounded bg-white/8">
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
