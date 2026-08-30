"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHermes } from "@/lib/store";

const LABELS = {
  websocket: "WebSocket",
  polling: "Polling agent",
  ingest: "Pushed feed",
  mesh: "Local mesh",
} as const;

export function FeedBar() {
  const { feedOrigin, setFeedOrigin, feedKind, feedLive, feedError } = useHermes();

  return (
    <FeedForm
      key={feedOrigin}
      initial={feedOrigin}
      setFeedOrigin={setFeedOrigin}
      feedKind={feedKind}
      feedLive={feedLive}
      feedError={feedError}
    />
  );
}

function FeedForm({
  initial,
  setFeedOrigin,
  feedKind,
  feedLive,
  feedError,
}: {
  initial: string;
  setFeedOrigin: (origin: string) => void;
  feedKind: keyof typeof LABELS;
  feedLive: boolean;
  feedError: string | null;
}) {
  const [draft, setDraft] = useState(initial);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFeedOrigin(draft);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="hud-panel flex flex-col gap-2 md:flex-row md:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="font-display mb-1 text-[8px] font-bold tracking-[0.16em] text-cyan-300/70 uppercase">
          Hermes agent uplink
        </div>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://your-agent.trycloudflare.com"
          className="font-mono h-8 border-cyan-400/20 bg-[#04070e]/80 text-[11px] text-cyan-50 placeholder:text-white/30"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          Connect
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setFeedOrigin("")}>
          Mesh
        </Button>
        <div className="font-mono text-[8px] text-white/45">
          <span className={feedLive ? "text-cyan-300" : "text-white/40"}>{LABELS[feedKind]}</span>
          {feedError ? <span className="ml-2 text-rose-300">{feedError}</span> : null}
        </div>
      </div>
    </form>
  );
}
