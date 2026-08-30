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

  const maxTool = Math.max(...data.tools.map((t) => t.count), 1);

  return (
    <div className="room min-h-dvh pb-12">
      <header className="sticky top-0 z-20 border-b border-white/6 bg-[#07060a]/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2.5">
          <div className="font-serif text-[20px] tracking-[0.28em]">
            HERMES <span className="text-[#d4af7a]">NDS</span>
          </div>
          <div className="flex items-center gap-3.5">
            <button type="button" onClick={() => setUplinkOpen((v) => !v)} className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase">
              Uplink
            </button>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#9aa3b5] uppercase">
              <i className={cn("size-1.5 rounded-full", feedLive ? "bg-[#3ee0c8] shadow-[0_0_12px_#3ee0c8]" : "bg-[#c45a4a] shadow-[0_0_10px_#c45a4a]")} />
              {LABELS[feedKind]}
            </div>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-[1180px] gap-5 overflow-x-auto px-4 pb-2.5">
          {[
            ["#jarvis", "Core"],
            ["#board", "Board"],
            ["#sessions", "Sessions"],
            ["#vitals", "Vitals"],
            ["#stream", "Stream"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase hover:text-[#d4af7a]">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-4 pt-5">
        {uplinkOpen && (
          <div className="glass mb-4 p-4">
            <div className="k">Agent origin</div>
            <input
              defaultValue={feedOrigin}
              onBlur={(e) => setFeedOrigin(e.target.value)}
              placeholder="https://your-tunnel.trycloudflare.com"
              className="mt-2 w-full border-0 border-b border-white/10 bg-transparent py-2 text-[13px] outline-none"
            />
            {feedError && <p className="mt-2 text-[12px] text-rose-300">{feedError}</p>}
          </div>
        )}

        <div className="instrument mb-4">
          <Stat k="Sessions" v={fmt(data.totals.sessions)} />
          <Stat k="Tool calls" v={fmt(data.totals.calls)} />
          <Stat k="Tokens" v={fmt(data.totals.tokens)} />
          <Stat k="Spend" v={fmtCost(data.totals.cost)} />
          <Stat k="Load" v={`${Math.round(data.cognitiveLoad)}%`} last />
        </div>

        <section id="jarvis" className="overflow-hidden rounded-[26px] border border-[#d4af7a]/16 bg-[#050408] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="relative h-[min(56vh,500px)] min-h-[270px]">
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
          <div className="flex justify-center bg-linear-to-b from-transparent to-[#07060a]/55 px-3 pt-2 pb-5">
            <JarvisConsole />
          </div>
        </section>

        <div className="mt-4 grid gap-3.5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="glass p-5" id="board">
            <Head title="The board" idx={String(data.projects.length).padStart(2, "0")} />
            {data.projects.length === 0 ? (
              <p className="font-serif py-4 text-[15px] text-[#9aa3b5] italic">
                No deliverables on the wire. Named sessions still hold the live work — ask Jarvis about any of them.
              </p>
            ) : (
              data.projects.map((p) => (
                <button key={p.id} type="button" onClick={() => sendCommand(`tell me about ${p.name}`)} className="w-full border-b border-white/8 py-3 text-left last:border-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px]">{p.name}</span>
                    <span className="font-serif text-[28px] leading-none text-[#d4af7a]">{p.progress}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#9aa3b5]">{p.description}</p>
                  <div className="mt-2.5 h-0.5 overflow-hidden rounded bg-white/8">
                    <div className="h-full bg-linear-to-r from-[#8a6a3a] to-[#d4af7a]" style={{ width: `${p.progress}%` }} />
                  </div>
                </button>
              ))
            )}
          </article>

          <article className="glass p-5" id="sessions">
            <Head title="Sessions" idx={String(data.sessions.length).padStart(2, "0")} />
            {data.sessions.length === 0 ? (
              <p className="font-serif py-4 text-[15px] text-[#9aa3b5] italic">Waiting for Hermes sessions.</p>
            ) : (
              data.sessions.slice(0, 10).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    selectSession(s.id);
                    setFocusAgentId(s.agentId);
                    sendCommand(`tell me about ${s.title}`);
                  }}
                  className="flex w-full flex-col gap-1 border-b border-white/8 py-3 text-left last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[15px]">{s.title}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] tracking-[0.16em] uppercase", s.active ? "border-[#3ee0c8]/35 bg-[#3ee0c8]/8 text-[#3ee0c8]" : "border-white/10 text-[#9aa3b5]")}>
                      {s.active ? "live" : "idle"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#9aa3b5]">
                    {s.model} · {fmt(s.toolCalls)} tools · {fmtCost(s.cost)}
                  </p>
                </button>
              ))
            )}
          </article>
        </div>

        <div className="mt-3.5 grid gap-3.5 lg:grid-cols-2" id="vitals">
          <article className="glass p-5">
            <Head title="Tools" idx="03" />
            {data.tools.length === 0 ? (
              <p className="font-serif py-4 text-[15px] text-[#9aa3b5] italic">No tool histogram yet.</p>
            ) : (
              data.tools.slice(0, 8).map((t) => (
                <button key={t.name} type="button" onClick={() => sendCommand(`how much do we use ${t.name}`)} className="w-full border-b border-white/8 py-2.5 text-left last:border-0">
                  <div className="flex justify-between text-[14px]">
                    <span>{t.name}</span>
                    <span className="text-[#9aa3b5]">{fmt(t.count)}</span>
                  </div>
                  <div className="mt-2 h-0.5 overflow-hidden rounded bg-white/8">
                    <div className="h-full bg-linear-to-r from-[#14685c] to-[#3ee0c8]" style={{ width: `${(t.count / maxTool) * 100}%` }} />
                  </div>
                </button>
              ))
            )}
          </article>

          <article className="glass p-5">
            <Head title="Vitals" idx="04" />
            <div className="grid grid-cols-2 gap-2.5">
              <Gauge k="CPU" v={`${Math.round(data.system.cpu)}%`} p={data.system.cpu} />
              <Gauge
                k="Memory"
                v={`${data.system.memoryUsed.toFixed(1)} / ${data.system.memoryTotal}`}
                p={(data.system.memoryUsed / Math.max(data.system.memoryTotal, 1)) * 100}
              />
              <Gauge k="Disk" v={`${Math.round(data.system.disk)}%`} p={data.system.disk} />
              <Gauge k="Network" v={`${Math.round(data.system.networkMb)} MB`} p={Math.min(100, data.system.networkMb / 4)} />
            </div>
          </article>
        </div>

        <article className="glass mt-3.5 p-5" id="stream">
          <Head title="The stream" idx="05" />
          <div className="max-h-[320px] space-y-0 overflow-auto border-l border-[#d4af7a]/28 pl-4">
            {data.activity.length === 0 ? (
              <p className="font-serif text-[15px] text-[#9aa3b5] italic">The stream is quiet. When Hermes moves, it writes here.</p>
            ) : (
              data.activity.slice(0, 24).map((e) => (
                <div key={e.id} className="relative pb-3.5 text-[13px] leading-snug text-[#c5ccd8]">
                  <i className="absolute top-1.5 -left-[21px] size-1.5 rounded-full bg-[#d4af7a] shadow-[0_0_8px_#d4af7a]" />
                  <span className="mr-2 text-[10px] text-[#9aa3b5]">{e.time}</span>
                  <b className="font-medium text-[#d4af7a]">{e.tool}</b> {e.message}
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function Head({ title, idx }: { title: string; idx: string }) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/8 pb-2.5">
      <h3 className="font-serif text-[26px] font-medium tracking-[0.02em]">{title}</h3>
      <span className="text-[11px] tracking-[0.22em] text-[#d4af7a]">{idx}</span>
    </div>
  );
}

function Stat({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={cn("border-white/8 px-4 py-3.5", !last && "border-r", "border-b md:border-b-0")}>
      <div className="text-[10px] tracking-[0.22em] text-[#9aa3b5] uppercase">{k}</div>
      <div className="font-serif mt-1.5 text-[28px] leading-none">{v}</div>
    </div>
  );
}

function Gauge({ k, v, p }: { k: string; v: string; p: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-3">
      <div className="text-[10px] tracking-[0.22em] text-[#9aa3b5] uppercase">{k}</div>
      <div className="font-serif mt-1 text-[22px] leading-none">{v}</div>
      <div className="mt-2.5 h-0.5 overflow-hidden rounded bg-white/8">
        <div className="h-full bg-linear-to-r from-[#14685c] to-[#3ee0c8]" style={{ width: `${Math.min(100, p)}%` }} />
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
