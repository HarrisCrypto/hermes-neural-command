"use client";

import { useEffect, useState } from "react";
import { HermesProvider, useHermes } from "@/lib/store";
import { fmtUptime } from "@/lib/format";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BrainView } from "@/components/dashboard/BrainView";
import { ProjectsView } from "@/components/dashboard/ProjectsView";
import { SessionsView } from "@/components/dashboard/SessionsView";
import { LogsView } from "@/components/dashboard/LogsView";
import { JarvisConsole } from "@/components/dashboard/JarvisConsole";
import { BootSequence } from "@/components/dashboard/BootSequence";

function Shell() {
  const { booted, view, fps, startedAt, data } = useHermes();
  const [uptime, setUptime] = useState("0h 0m 0s");

  useEffect(() => {
    const id = window.setInterval(() => setUptime(fmtUptime(Date.now() - startedAt)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  if (!booted) return <BootSequence />;

  return (
    <div className="app-shell relative z-2 grid min-h-screen grid-cols-1 gap-2 p-2 md:grid-cols-[200px_1fr]">
      <div className="md:col-span-2">
        <Header />
      </div>
      <Sidebar />
      <main className="flex min-h-0 flex-col gap-2">
        {view === "brain" && <BrainView />}
        {view === "projects" && <ProjectsView />}
        {view === "sessions" && <SessionsView />}
        {view === "logs" && <LogsView />}
        <JarvisConsole />
      </main>
      <footer className="md:col-span-2 flex items-center justify-between rounded-lg border border-cyan-400/10 bg-[#060c1c]/60 px-3 py-1.5 font-mono text-[8px] text-white/30">
        <div>
          HERMES · NDS v15 · Uptime {uptime} · {data.agents.filter((a) => a.status !== "standby").length} agents live
        </div>
        <div>
          <span className="text-cyan-300">{fps}</span> FPS · Data: <span className="text-cyan-300">Live mesh</span>
        </div>
      </footer>
    </div>
  );
}

export function CommandCenter() {
  return (
    <HermesProvider>
      <div className="scanlines" />
      <Shell />
    </HermesProvider>
  );
}
