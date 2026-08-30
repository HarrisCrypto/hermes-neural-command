import { fmt, fmtCost } from "@/lib/format";
import type { FeedKind, HermesData, JarvisAction, Project, Session } from "@/lib/types";

function sitrep(data: HermesData) {
  const live = data.sessions.filter((s) => s.active).length;
  const names = programmes(data)
    .slice(0, 3)
    .map((p) => p.name)
    .join(", ");
  return `Live. Cognitive load ${Math.round(data.cognitiveLoad)} percent. ${live} session${live === 1 ? "" : "s"} open, ${fmt(data.totals.calls)} tool calls, spend ${fmtCost(data.totals.cost)}. ${names ? `On the board: ${names}.` : "No named programmes in this feed yet."}`;
}

function programmes(data: HermesData): Array<{ id: string; name: string; detail: string; progress?: number }> {
  if (data.projects.length) {
    return data.projects.map((p) => ({
      id: p.id,
      name: p.name,
      detail: `${p.category}. ${p.description} Progress ${p.progress} percent.`,
      progress: p.progress,
    }));
  }
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string; detail: string }> = [];
  for (const s of data.sessions) {
    const name = s.title;
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: s.id,
      name,
      detail: `${s.active ? "Live" : "Idle"} session on ${s.model}. ${fmt(s.toolCalls)} tools, ${fmt(s.messages)} messages, ${fmtCost(s.cost)}.`,
    });
  }
  return out;
}

function includesName(q: string, name: string) {
  const n = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (n.length < 3) return false;
  return q.includes(n) || n.split(" ").filter((w) => w.length > 3).some((w) => q.includes(w));
}

function projectHit(q: string, data: HermesData): Project | undefined {
  return data.projects.find((p) => includesName(q, p.name));
}

function sessionHit(q: string, data: HermesData): Session | undefined {
  return data.sessions.find((s) => includesName(q, s.title) || includesName(q, s.source) || includesName(q, s.model));
}

export function interpretCommand(
  raw: string,
  data: HermesData,
  feed?: { kind: FeedKind; origin: string; live: boolean },
): JarvisAction {
  const q = raw.trim();
  if (!q) return { reply: "Standing by. Ask about a project, a session, usage, or the live load." };
  const s = q.toLowerCase();
  const board = programmes(data);

  if (/\b(help|commands|what can you|what do you know)\b/.test(s)) {
    const names = board.slice(0, 5).map((p) => p.name).join(", ") || "whatever is on the live feed";
    return {
      reply: `Ask me about status, usage, spend, tools, sessions, or a programme by name. I can see ${names}.`,
    };
  }

  if (/\b(music on|play (the )?(music|score|soundtrack)|turn on (the )?(music|score)|start (the )?(music|score)|chamber score|put on music)\b/.test(s)) {
    return { reply: "Opening the chamber score.", music: true };
  }
  if (/\b(music off|stop (the )?(music|score)|turn off (the )?(music|score)|quiet the (room|score)|kill the music)\b/.test(s)) {
    return { reply: "Score closed.", music: false };
  }

  if (/\b(mute|silence|quiet voice)\b/.test(s)) {
    return { reply: "Voice closed. Replies stay on the glass.", voice: false };
  }
  if (/\b(speak|voice on|talk to me)\b/.test(s) && !/\b(hold to speak|speak to)\b/.test(s)) {
    return { reply: "Voice is open.", voice: true };
  }

  if (/\b(connect|uplink)\b/.test(s)) {
    const url = q.match(/https?:\/\/[^\s]+/i)?.[0];
    if (url) {
      return { reply: `Locking the uplink onto ${url}.`, connectOrigin: url };
    }
    return {
      reply: feed?.live
        ? `Already live over ${feed.kind} at ${feed.origin}.`
        : "Paste the agent URL — connect https://your-tunnel.trycloudflare.com",
    };
  }
  if (/\b(disconnect|drop uplink|local mesh)\b/.test(s)) {
    return { reply: "Dropping the agent uplink. Local mesh only.", disconnect: true };
  }

  if (/\b(open|launch|take me to|go to|visit|bring up the (site|channel|page))\b/.test(s)) {
    const target = projectHit(s, data) || board.find((p) => includesName(s, p.name));
    const href = data.projects.find((p) => p.id === target?.id || (target && p.name === target.name))?.href;
    if (target && href) {
      return {
        reply: `Opening ${target.name}.`,
        view: "brain",
        focusAgentId: target.id,
        openUrl: href,
      };
    }
    if (target) {
      return {
        reply: `${target.name} is on the board, but I do not have a destination yet. Open Uplink and paste the YouTube or site URL under Destinations.`,
        view: "brain",
        focusAgentId: target.id,
      };
    }
  }

  const proj = projectHit(s, data);
  if (proj) {
    const related = data.sessions.filter((x) => includesName(x.title, proj.name) || includesName(proj.name, x.title));
    const extra = related[0]
      ? ` Bound session “${related[0].title}” — ${fmt(related[0].toolCalls)} tools, ${fmtCost(related[0].cost)}.`
      : "";
    return {
      reply: `Bringing ${proj.name} to the front. ${proj.progress}% along in ${proj.category}. ${proj.description}${extra}${proj.href ? " Tap Open to go there." : ""}`,
      view: "brain",
      focusAgentId: proj.id,
      selectSessionId: related[0]?.id,
    };
  }

  const namedProgramme = board.find((p) => includesName(s, p.name));
  if (namedProgramme && !/\b(status|report|sitrep|overview|how are we)\b/.test(s)) {
    return {
      reply: `Bringing ${namedProgramme.name} to the front. ${namedProgramme.detail}`,
      view: "brain",
      focusAgentId: namedProgramme.id,
    };
  }

  const sess = sessionHit(s, data);
  if (sess && !/\b(all sessions|list sessions)\b/.test(s)) {
    const bound = data.projects.find(
      (p) => includesName(sess.title, p.name) || includesName(p.name, sess.title),
    );
    return {
      reply: `${bound ? `Bringing ${bound.name} to the front. ` : ""}“${sess.title}” is ${sess.active ? "live" : "idle"} on ${sess.model} via ${sess.source}. ${fmt(sess.toolCalls)} tool calls, ${fmt(sess.messages)} messages, ${fmt(sess.inputTokens + sess.outputTokens)} tokens, ${fmtCost(sess.cost)}.`,
      view: "brain",
      selectSessionId: sess.id,
      focusAgentId: bound?.id ?? sess.agentId,
    };
  }

  const toolHit = data.tools.find((t) => includesName(s, t.name));
  if (toolHit) {
    const max = Math.max(...data.tools.map((t) => t.count), 1);
    return {
      reply: `${toolHit.name} has been used ${fmt(toolHit.count)} times — ${Math.round((toolHit.count / max) * 100)} percent of the heaviest tool.`,
    };
  }

  const agentHit = data.agents.find(
    (a) => includesName(s, a.name) || includesName(s, a.role) || s.includes(a.id),
  );
  if (agentHit) {
    const session = data.sessions.find((x) => x.agentId === agentHit.id);
    return {
      reply: `${agentHit.name} is ${agentHit.status}, ${agentHit.role}, load ${Math.round(agentHit.load)} percent.${session ? ` Bound to “${session.title}”.` : ""}`,
      view: "brain",
      focusAgentId: agentHit.id,
      selectSessionId: session?.id,
    };
  }

  if (/\b(project|programme|program|deliverable|what are we (building|working)|on the board)\b/.test(s)) {
    if (!board.length) {
      return { reply: "No programmes in this feed yet. When Hermes publishes /api/deliverables or named sessions, they will land here.", view: "projects" };
    }
    const lines = board.slice(0, 6).map((p) => p.name + (p.progress != null ? ` ${p.progress}%` : "")).join("; ");
    return { reply: `${board.length} programmes on the board. ${lines}. Ask me about any one by name.`, view: "projects" };
  }

  if (/\b(session|conversation|thread|what are you working)\b/.test(s)) {
    const live = data.sessions.filter((x) => x.active);
    const top = live[0] || data.sessions[0];
    if (!top) return { reply: "No sessions in the buffer.", view: "sessions" };
    return {
      reply: `${live.length} live of ${data.sessions.length} sessions. Lead thread: “${top.title}” on ${top.model}, ${fmt(top.toolCalls)} tools, ${fmtCost(top.cost)}.`,
      view: "sessions",
      selectSessionId: top.id,
    };
  }

  if (/\b(cost|spend|spent|usage|tokens?|tool calls?|how much)\b/.test(s)) {
    const topTools = data.tools
      .slice(0, 4)
      .map((t) => `${t.name} ${fmt(t.count)}`)
      .join(", ");
    return {
      reply: `Usage: ${fmt(data.totals.calls)} tool calls, ${fmt(data.totals.tokens)} tokens, ${fmt(data.totals.messages)} messages, spend ${fmtCost(data.totals.cost)} across ${data.totals.sessions} sessions.${topTools ? ` Heaviest tools: ${topTools}.` : ""}`,
    };
  }

  if (/\b(tool)\b/.test(s)) {
    if (!data.tools.length) return { reply: "No tool histogram on the wire yet." };
    const list = data.tools.slice(0, 6).map((t) => `${t.name} ${fmt(t.count)}`).join(", ");
    return { reply: `Tools in play: ${list}.` };
  }

  if (/\b(system|vital|cpu|memory|disk|hardware|uptime)\b/.test(s)) {
    const { cpu, memoryUsed, memoryTotal, disk, networkMb } = data.system;
    return {
      reply: `Vitals: CPU ${Math.round(cpu)}%, memory ${memoryUsed.toFixed(1)} of ${memoryTotal} GB, disk ${Math.round(disk)}%, network ${Math.round(networkMb)} MB.`,
      view: "brain",
    };
  }

  if (/\b(log|activity|last (thing|action)|what just|recent)\b/.test(s)) {
    const last = data.activity[0];
    if (!last) return { reply: "Activity is quiet.", view: "logs" };
    return {
      reply: `Last pulse: ${last.tool} — ${last.message || "no detail"}. ${data.activity.length} events on the stream.`,
      view: "logs",
    };
  }

  if (/\b(load|cognit|brain|neural|core)\b/.test(s)) {
    const b = data.brain;
    return {
      reply: `Cognitive load ${Math.round(data.cognitiveLoad)}%. Reasoning ${Math.round(b.reasoning * 100)}, tools ${Math.round(b.toolUse * 100)}, memory ${Math.round(b.memory * 100)}, output ${Math.round(b.output * 100)}.`,
      view: "brain",
    };
  }

  if (/\b(status|report|sitrep|how are (we|you|things)|overview|what's going|whats going)\b/.test(s)) {
    return { reply: sitrep(data), view: "brain" };
  }

  if (/\b(hello|hi|hey|good (morning|evening|afternoon)|jarvis)\b/.test(s)) {
    return { reply: `Here. ${sitrep(data)}` };
  }
  if (/\b(thank)\b/.test(s)) {
    return { reply: "Of course." };
  }
  if (/\b(who are you|what are you)\b/.test(s)) {
    return {
      reply: "I am Jarvis on HERMES NDS. I read the live dashboard — projects, sessions, tools, spend, and the core — and I answer from that, not from a script.",
    };
  }

  const hint = board[0]?.name || data.sessions[0]?.title;
  return {
    reply: `${sitrep(data)}${hint ? ` Try asking about ${hint}.` : ""}`,
  };
}

export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.02;
  utter.pitch = 0.86;
  utter.lang = "en-GB";
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en-GB/i.test(v.lang) && /Daniel|Google|Male|UK/i.test(v.name)) ||
    voices.find((v) => /en-GB/i.test(v.lang)) ||
    voices.find((v) => /en-US/i.test(v.lang));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
