"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { HermesProvider, useHermes } from "@/lib/store";
import { BootSequence } from "@/components/dashboard/BootSequence";
import { JarvisConsole } from "@/components/dashboard/JarvisConsole";
import { ProjectsView } from "@/components/dashboard/ProjectsView";
import { SessionsView } from "@/components/dashboard/SessionsView";
import { LogsView } from "@/components/dashboard/LogsView";
import { cn } from "@/lib/utils";

const BrainCanvas = dynamic(
  () => import("@/components/brain/BrainCanvas").then((m) => m.BrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-serif text-[#d4af7a]/70 italic">
        Opening the room…
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
    view,
    setView,
    feedKind,
    feedLive,
    feedOrigin,
    setFeedOrigin,
    feedError,
    focusAgentId,
    setFocusAgentId,
  } = useHermes();
  const [uplinkOpen, setUplinkOpen] = useState(false);
  const focus = data.agents.find((a) => a.id === focusAgentId);

  if (!booted) return <BootSequence />;

  return (
    <div className="relative h-dvh overflow-hidden bg-[#07060a]">
      <div className="absolute inset-0">
        <BrainCanvas />
      </div>
      <div className="vignette pointer-events-none absolute inset-0 z-2" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-8 flex items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="font-serif text-[22px] tracking-[0.28em]">
          HERMES <span className="text-[#d4af7a]">NDS</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setUplinkOpen((v) => !v)}
            className="text-[10px] tracking-[0.16em] text-[#9aa3b5] uppercase"
          >
            Uplink
          </button>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#9aa3b5] uppercase">
            <i className={cn("size-1.5 rounded-full", feedLive ? "bg-[#3ee0c8] shadow-[0_0_12px_#3ee0c8]" : "bg-[#c45a4a] shadow-[0_0_10px_#c45a4a]")} />
            {LABELS[feedKind]}
          </div>
        </div>
      </header>

      {uplinkOpen && (
        <div className="glass absolute top-14 left-4 z-8 w-[min(360px,calc(100vw-36px))] p-4">
          <div className="text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase">Agent origin</div>
          <input
            defaultValue={feedOrigin}
            onBlur={(e) => setFeedOrigin(e.target.value)}
            placeholder="https://your-tunnel.trycloudflare.com"
            className="mt-2 w-full border-0 border-b border-white/10 bg-transparent py-2 text-[13px] outline-none"
          />
          <p className="mt-2 text-[11px] tracking-[0.16em] text-[#9aa3b5] uppercase">
            Save once. This device will keep using it.
          </p>
          {feedError && <p className="mt-2 text-[12px] text-rose-300">{feedError}</p>}
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute top-[18%] left-1/2 z-6 -translate-x-1/2 text-center transition-opacity",
          focus ? "opacity-100" : "opacity-0",
        )}
      >
        <h2 className="font-serif text-[clamp(28px,6vw,54px)] font-medium tracking-[0.04em] italic">
          {focus?.name ?? "Neural core"}
        </h2>
        <p className="mt-1.5 text-[12px] tracking-[0.2em] text-[#9aa3b5] uppercase">
          {focus?.role} · {Math.round(focus?.load ?? 0)}% load
        </p>
      </div>

      <aside className="pointer-events-none absolute top-[72px] right-[18px] bottom-[168px] z-7 hidden w-[min(300px,32vw)] flex-col gap-2.5 md:flex">
        <div className="glass pointer-events-auto p-4">
          <div className="text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase">Cognitive load</div>
          <div className="font-serif mt-0.5 text-[28px]">{Math.round(data.cognitiveLoad)}%</div>
          <div className="mt-1 text-[12px] text-[#9aa3b5]">
            {data.cognitiveLoad > 72 ? "Saturated" : data.cognitiveLoad > 40 ? "In motion" : "Quiet"}
          </div>
        </div>
        <div className="glass pointer-events-auto p-4">
          <div className="text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase">Active work</div>
          {data.sessions.slice(0, 4).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setFocusAgentId(s.agentId);
                setView("brain");
              }}
              className="flex w-full justify-between gap-3 border-b border-white/8 py-1.5 text-left text-[12px] last:border-0"
            >
              <span className="truncate">{s.title}</span>
              <span className="text-[#9aa3b5]">{s.active ? "live" : ""}</span>
            </button>
          ))}
        </div>
        <div className="glass pointer-events-auto min-h-0 flex-1 overflow-auto p-4">
          <div className="mb-2 text-[10px] tracking-[0.2em] text-[#9aa3b5] uppercase">Live log</div>
          {data.activity.slice(0, 8).map((e) => (
            <div key={e.id} className="mb-1.5 text-[11px] leading-snug text-[#b8c0ce]">
              <b className="font-medium text-[#d4af7a]">{e.tool}</b> {e.message}
            </div>
          ))}
        </div>
      </aside>

      {view !== "brain" && (
        <div className="absolute inset-x-3 top-16 bottom-44 z-6 overflow-auto md:right-[340px]">
          <div className="glass p-4">
            {view === "projects" && <ProjectsView />}
            {view === "sessions" && <SessionsView />}
            {view === "logs" && <LogsView />}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-9 flex flex-col items-center px-[18px] pb-[max(18px,env(safe-area-inset-bottom))]">
        <JarvisConsole />
        <div className="mt-1 flex gap-2">
          {(["brain", "projects", "sessions", "logs"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "text-[10px] tracking-[0.16em] uppercase",
                view === id ? "text-[#d4af7a]" : "text-[#9aa3b5]",
              )}
            >
              {id}
            </button>
          ))}
        </div>
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
