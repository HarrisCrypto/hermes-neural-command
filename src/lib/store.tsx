"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { interpretCommand, speak, stopSpeaking } from "@/lib/jarvis";
import {
  openAgentSocket,
  pullSnapshot,
  readOriginSnapshot,
  subscribeOrigin,
  writeStoredOrigin,
} from "@/lib/client-feed";
import { defaultHermesOrigin, isHttpOrigin } from "@/lib/protocol";
import { createInitialData, nextActivity, tickData } from "@/lib/simulation";
import { uid } from "@/lib/format";
import type { FeedKind, HermesData, TranscriptLine, ViewId } from "@/lib/types";

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
  voiceLevel: number;
  startListen: () => void;
  stopListen: () => void;
  toggleListen: () => void;
  heardDraft: string;
  transcript: TranscriptLine[];
  sendCommand: (text: string) => void;
  fps: number;
  setFps: (n: number) => void;
  booted: boolean;
  setBooted: (v: boolean) => void;
  startedAt: number;
  pulse: number;
  feedKind: FeedKind;
  feedOrigin: string;
  setFeedOrigin: (origin: string) => void;
  feedLive: boolean;
  feedError: string | null;
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
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [heardDraft, setHeardDraft] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [fps, setFps] = useState(60);
  const [booted, setBooted] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [feedKind, setFeedKind] = useState<FeedKind>("mesh");
  const feedOrigin = useSyncExternalStore(subscribeOrigin, readOriginSnapshot, defaultHermesOrigin);
  const [feedError, setFeedError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLite | null>(null);
  const draftRef = useRef("");
  const listenRef = useRef(false);
  const audioRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    stream: MediaStream;
    raf: number;
  } | null>(null);
  const voiceRef = useRef(voiceEnabled);
  const thinkingRef = useRef(thinking);
  const boostedRef = useRef(boosted);
  const dataRef = useRef(data);
  const liveRef = useRef(false);
  const originRef = useRef(feedOrigin);
  const feedKindRef = useRef(feedKind);
  const feedLive = feedKind !== "mesh";

  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    originRef.current = feedOrigin;
  }, [feedOrigin]);
  useEffect(() => {
    feedKindRef.current = feedKind;
    liveRef.current = feedKind !== "mesh";
  }, [feedKind]);

  useEffect(() => {
    voiceRef.current = voiceEnabled;
  }, [voiceEnabled]);
  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);
  useEffect(() => {
    boostedRef.current = boosted;
  }, [boosted]);

  const applyLive = useCallback((next: HermesData, kind: FeedKind) => {
    setData(next);
    setFeedKind(kind);
    setFeedError(null);
    setPulse((n) => n + 1);
  }, []);

  const setFeedOrigin = useCallback((origin: string) => {
    const cleaned = origin.trim().replace(/\/$/, "");
    if (cleaned && !isHttpOrigin(cleaned)) {
      setFeedError("Origin must be http(s)");
      return;
    }
    writeStoredOrigin(cleaned);
    setFeedKind("mesh");
    setFeedError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const snap = await pullSnapshot(originRef.current, dataRef.current);
        if (cancelled || !snap) return;
        applyLive(snap.data, snap.kind);
      } catch (err) {
        if (!cancelled) setFeedError(err instanceof Error ? err.message : "uplink failed");
      }
    };
    void poll();
    const id = window.setInterval(poll, 4000);
    const stopWs = openAgentSocket(feedOrigin, (next, kind) => applyLive(next, kind), () => dataRef.current);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      stopWs();
    };
  }, [applyLive, feedOrigin]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (liveRef.current) return;
      setData((prev) => tickData(prev, thinkingRef.current, boostedRef.current));
    }, 900);
    const act = window.setInterval(() => {
      if (liveRef.current) return;
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
        const action = interpretCommand(cleaned, current, {
          kind: feedKindRef.current,
          origin: originRef.current,
          live: liveRef.current,
        });
        if (action.connectOrigin) setFeedOrigin(action.connectOrigin);
        if (action.disconnect) setFeedOrigin("");
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
  }, [setFeedOrigin]);

  const stopMic = useCallback(() => {
    const pack = audioRef.current;
    if (!pack) return;
    cancelAnimationFrame(pack.raf);
    pack.stream.getTracks().forEach((t) => t.stop());
    void pack.ctx.close();
    audioRef.current = null;
    setVoiceLevel(0);
  }, []);

  const sampleMic = useCallback(() => {
    const pack = audioRef.current;
    if (!pack || !listenRef.current) {
      setVoiceLevel((n) => n * 0.85);
      return;
    }
    const buf = new Uint8Array(pack.analyser.frequencyBinCount);
    pack.analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const n = (buf[i] - 128) / 128;
      sum += n * n;
    }
    const rms = Math.sqrt(sum / buf.length);
    setVoiceLevel((prev) => Math.min(1, prev * 0.5 + rms * 4.4));
    pack.raf = requestAnimationFrame(sampleMic);
  }, []);

  const startListen = useCallback(async () => {
    if (listenRef.current) return;
    listenRef.current = true;
    draftRef.current = "";
    setHeardDraft("");
    setListening(true);
    setVoiceEnabled(true);
    setVoiceLevel(0.4);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioRef.current = { ctx, analyser, stream, raf: 0 };
      if (ctx.state === "suspended") await ctx.resume();
      sampleMic();
    } catch {
      setVoiceLevel(0.45);
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event: SpeechRecognitionEventLite) => {
      let said = "";
      for (let i = 0; i < event.results.length; i++) {
        said += event.results[i]?.[0]?.transcript ?? "";
      }
      draftRef.current = said.trim();
      setHeardDraft(draftRef.current);
    };
    rec.onerror = () => {};
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }, [sampleMic]);

  const stopListen = useCallback(() => {
    if (!listenRef.current) return;
    listenRef.current = false;
    setListening(false);
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    stopMic();
    const said = draftRef.current.trim();
    draftRef.current = "";
    setHeardDraft("");
    if (said) sendCommand(said);
  }, [sendCommand, stopMic]);

  const toggleListen = useCallback(() => {
    if (listenRef.current) stopListen();
    else void startListen();
  }, [startListen, stopListen]);

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
      voiceLevel,
      startListen,
      stopListen,
      toggleListen,
      heardDraft,
      transcript,
      sendCommand,
      fps,
      setFps,
      booted,
      setBooted,
      startedAt,
      pulse,
      feedKind,
      feedOrigin,
      setFeedOrigin,
      feedLive,
      feedError,
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
      voiceLevel,
      startListen,
      stopListen,
      toggleListen,
      heardDraft,
      transcript,
      sendCommand,
      fps,
      booted,
      startedAt,
      pulse,
      feedKind,
      feedOrigin,
      setFeedOrigin,
      feedLive,
      feedError,
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
