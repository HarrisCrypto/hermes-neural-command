"use client";

import { FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { useHermes } from "@/lib/store";
import { cn } from "@/lib/utils";

export function JarvisConsole({ dock = false }: { dock?: boolean }) {
  const {
    sendCommand,
    transcript,
    thinking,
    listening,
    startListen,
    stopListen,
    heardDraft,
  } = useHermes();
  const [text, setText] = useState("");
  const held = useRef(false);

  useEffect(() => {
    if (dock) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        if (!held.current) {
          held.current = true;
          void startListen();
        }
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && held.current) {
        held.current = false;
        stopListen();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [startListen, stopListen]);

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.current = true;
    void startListen();
    navigator.vibrate?.(12);
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!held.current) return;
    held.current = false;
    stopListen();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendCommand(text);
    setText("");
  };

  const last = transcript[transcript.length - 1];
  const line = listening
    ? heardDraft || "Listening…"
    : thinking
      ? "Compiling a reply…"
      : last?.role === "jarvis"
        ? last.text
        : last?.text || "";

  return (
    <div className={cn("flex w-full flex-col items-center", dock ? "max-w-[420px] gap-1.5" : "max-w-[440px] gap-2.5")}>
      {line ? (
        <p className={cn("font-serif px-4 text-center text-[#d4af7a] italic", dock ? "min-h-[22px] text-[15px] line-clamp-2" : "min-h-[26px] text-[18px]")}>
          {line}
        </p>
      ) : null}
      <button
        type="button"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={cn(
          "flex w-full items-center justify-center gap-3.5 rounded-full border select-none",
          dock ? "h-12" : "h-[72px]",
          "bg-linear-to-b from-white/10 to-black/50 shadow-[0_18px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "transition-[transform,box-shadow,border-color] duration-150",
          listening
            ? "scale-[0.985] border-[#3ee0c8] shadow-[0_0_0_8px_rgba(62,224,200,0.08),0_22px_70px_rgba(62,224,200,0.18)]"
            : "border-[#d4af7a]/35",
        )}
      >
        <span
          className={cn(
            "size-[18px] rounded-full",
            listening
              ? "animate-pulse bg-[radial-gradient(circle_at_35%_30%,#fff,#3ee0c8_50%,#14685c)] shadow-[0_0_22px_#3ee0c8]"
              : "bg-[radial-gradient(circle_at_35%_30%,#fff,#d4af7a_45%,#8a6a3a)] shadow-[0_0_16px_#d4af7a]",
          )}
        />
        <strong className="text-[13px] font-medium tracking-[0.28em]">
          {listening ? "LISTENING" : "HOLD TO SPEAK"}
        </strong>
      </button>
      {!dock && (
      <p className="text-[11px] tracking-[0.16em] text-[#9aa3b5] uppercase">
        Press and hold · release to send
      </p>
      )}
      {!dock && (
      <div className="flex flex-wrap justify-center gap-2">
        {["status", "what are we working on", "play music", "usage", "last activity"].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => sendCommand(cmd)}
            className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-[11px] tracking-[0.08em] text-[#e8eef8]"
          >
            {cmd === "what are we working on" ? "Projects" : cmd === "last activity" ? "Activity" : cmd === "play music" ? "Music" : cmd === "usage" ? "Usage" : "Status"}
          </button>
        ))}
      </div>
      )}
      {!dock && (
      <form onSubmit={onSubmit} className="w-full">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or type a command…"
          className="w-full border-0 border-b border-white/10 bg-transparent py-2 text-center text-[13px] text-[#e8eef8] outline-none placeholder:text-white/25"
        />
      </form>
      )}
    </div>
  );
}
