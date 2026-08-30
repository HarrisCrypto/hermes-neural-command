"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHermes } from "@/lib/store";
import { cn } from "@/lib/utils";

export function JarvisConsole() {
  const { sendCommand, transcript, thinking, voiceEnabled, setVoiceEnabled, listening, toggleListen } =
    useHermes();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.key === "j" || e.key === "J") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [transcript, thinking]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendCommand(text);
    setText("");
  };

  const recent = transcript.slice(-6);

  return (
    <section className="hud-panel">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="font-display text-[8px] font-bold tracking-[0.16em] text-cyan-300/70 uppercase">
          Jarvis · Cognitive Layer
        </h3>
        <div className="h-px flex-1 bg-linear-to-r from-cyan-400/25 to-transparent" />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          aria-label={voiceEnabled ? "Mute Jarvis" : "Enable voice"}
          className="text-cyan-300/80 hover:text-cyan-200"
        >
          {voiceEnabled ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>

      <div ref={logRef} className="mb-2 max-h-[88px] space-y-1 overflow-y-auto">
        {recent.length === 0 && (
          <p className="font-mono text-[8px] text-white/35">
            Address the core — try “status”, “connect https://…”, or “focus athena”. Press / to speak in text.
          </p>
        )}
        {recent.map((line) => (
          <p
            key={line.id}
            className={cn(
              "font-mono text-[8px] leading-relaxed",
              line.role === "jarvis" ? "text-cyan-200/90" : "text-white/55",
            )}
          >
            <span className={line.role === "jarvis" ? "text-cyan-400" : "text-fuchsia-300"}>
              {line.role === "jarvis" ? "JARVIS" : "YOU"}
            </span>
            {" · "}
            {line.text}
          </p>
        ))}
        {thinking && <p className="font-mono animate-pulse text-[8px] text-cyan-300/70">JARVIS · compiling a reply…</p>}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Command the neural core…"
          className="font-mono h-8 border-cyan-400/20 bg-[#04070e]/80 text-[11px] text-cyan-50 placeholder:text-white/30"
        />
        <Button
          type="button"
          variant={listening ? "default" : "outline"}
          size="icon-sm"
          onClick={toggleListen}
          aria-label="Voice command"
          className={cn(
            listening && "bg-cyan-400 text-black shadow-[0_0_16px_rgba(0,240,255,0.45)]",
          )}
        >
          <Mic />
        </Button>
        <Button type="submit" size="icon-sm" aria-label="Send command" disabled={!text.trim() || thinking}>
          <Send />
        </Button>
      </form>
    </section>
  );
}
