"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { interpretCommand, speak, stopSpeaking } from "@/lib/jarvis";
import { createInitialData, nextActivity, tickData } from "@/lib/simulation";
import { uid } from "@/lib/format";
import type { HermesData, TranscriptLine, ViewId } from "@/lib/types";

type Store = {
  data: HermesData;
  view: ViewId;
  setView: (v: ViewId) => void;
  selectedSessionId: string | null;
  selectSession: (id: string | null) => void;
  focusAgentId: string | null;
  setFocusAgentId: (id: string | null) => void;
  hoverAgentId: string | null;
  setHoverAgentId: (id: string | null) => void;
  thinking: boolean;
  boosted: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  listening: boolean;
  toggleListen: () => void;
  transcript: TranscriptLine[];
  sendCommand: (text: string) => void;
  fps: number;
  setFps: (n: number) => void;
  booted: boolean;
  setBooted: (v: boolean) => void;
  startedAt: number;
  pulse: number;
};

const HermesContext = createContext<Store | null>(null);

export function HermesProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HermesData>(() => createInitialData());
  const [view, setView] = useState<ViewId>("brain");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [focusAgentId, setFocusAgentId] = useState<string | null>(null);
  const [hoverAgentId, setHoverAgentId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [fps, setFps] = useState(60);
  const [booted, setBooted] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const recRef = useRef<SpeechRecognitionLite | null>(null);
  const voiceRef = useRef(voiceEnabled);
  const thinkingRef = useRef(thinking);
  const boostedRef = useRef(boosted);

  useEffect(() => {
    voiceRef.current = voiceEnabled;
  }, [voiceEnabled]);
  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);
  useEffect(() => {
    boostedRef.current = boosted;
  }, [boosted]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setData((prev) => tickData(prev, thinkingRef.current, boostedRef.current));
    }, 900);
    const act = window.setInterval(() => {
      setData((prev) => ({
        ...prev,
        activity: [nextActivity(), ...prev.activity].slice(0, 80),
      }));
    }, 2200);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(act);
    };
  }, []);

  const sendCommand = useCallback((text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setTranscript((prev) => [
      ...prev.slice(-24),
      { id: uid("u"), role: "user", text: cleaned, at: Date.now() },
    ]);
    setThinking(true);
    setPulse((n) => n + 1);
    window.setTimeout(() => {
      setData((current) => {
        const action = interpretCommand(cleaned, current);
        if (action.view) setView(action.view);
        if (action.selectSessionId) setSelectedSessionId(action.selectSessionId);
        if (action.focusAgentId !== undefined) setFocusAgentId(action.focusAgentId);
        if (action.boost !== undefined) setBoosted(action.boost);
        if (action.voice !== undefined) setVoiceEnabled(action.voice);
        setTranscript((prev) => [
          ...prev,
          { id: uid("j"), role: "jarvis", text: action.reply, at: Date.now() },
        ]);
        if (voiceRef.current && action.voice !== false) speak(action.reply);
        if (action.voice === false) stopSpeaking();
        return current;
      });
      setThinking(false);
    }, 420 + Math.random() * 380);
  }, []);

  const toggleListen = useCallback(() => {
    const Ctor =
      typeof window !== "undefined"
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;
    if (!Ctor) {
      sendCommand("voice recognition is unavailable on this browser");
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event: SpeechRecognitionEventLite) => {
      const said = event.results[0]?.[0]?.transcript;
      if (said) sendCommand(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
    setVoiceEnabled(true);
  }, [listening, sendCommand]);

  const value = useMemo<Store>(
    () => ({
      data,
      view,
      setView,
      selectedSessionId,
      selectSession: setSelectedSessionId,
      focusAgentId,
      setFocusAgentId,
      hoverAgentId,
      setHoverAgentId,
      thinking,
      boosted,
      voiceEnabled,
      setVoiceEnabled,
      listening,
      toggleListen,
      transcript,
      sendCommand,
      fps,
      setFps,
      booted,
      setBooted,
      startedAt,
      pulse,
    }),
    [
      data,
      view,
      selectedSessionId,
      focusAgentId,
      hoverAgentId,
      thinking,
      boosted,
      voiceEnabled,
      listening,
      toggleListen,
      transcript,
      sendCommand,
      fps,
      booted,
      startedAt,
      pulse,
    ],
  );

  return <HermesContext.Provider value={value}>{children}</HermesContext.Provider>;
}

export function useHermes() {
  const ctx = useContext(HermesContext);
  if (!ctx) throw new Error("useHermes must be used within HermesProvider");
  return ctx;
}

type SpeechRecognitionLite = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLite) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEventLite = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLite;
    webkitSpeechRecognition?: new () => SpeechRecognitionLite;
  }
}
