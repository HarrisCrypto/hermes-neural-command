import { fmt, fmtCost } from "@/lib/format";
import type { FeedKind, HermesData, JarvisAction } from "@/lib/types";

function sitrep(data: HermesData) {
  const active = data.agents.filter((a) => a.status === "thinking" || a.status === "active").length;
  return `All systems nominal. Cognitive load is ${Math.round(data.cognitiveLoad)} percent. ${active} agents are in motion, ${fmt(data.totals.calls)} tool calls logged, spend at ${fmtCost(data.totals.cost)}. Neural core is stable.`;
}

export function interpretCommand(
  raw: string,
  data: HermesData,
  feed?: { kind: FeedKind; origin: string; live: boolean },
): JarvisAction {
  const q = raw.trim();
  if (!q) return { reply: "Standing by, sir." };
  const s = q.toLowerCase();

  if (/\b(help|commands|what can you)\b/.test(s)) {
    return {
      reply:
        "You can ask for a status report, system vitals, cognitive load, sessions, or projects. Say focus and an agent name to lock the core. Boost or standby changes throughput. Mute and speak control my voice. Say connect and a URL to lock onto your Hermes agent.",
    };
  }

  if (/\b(mute|silence|quiet voice)\b/.test(s)) {
    return { reply: "Voice channel closed. I will keep replies on the glass.", voice: false };
  }

  if (/\b(speak|voice on|talk)\b/.test(s)) {
    return { reply: "Voice channel open. I am here.", voice: true };
  }

  if (/\b(boost|overclock|more power)\b/.test(s)) {
    return {
      reply: "Increasing synaptic throughput. The core will run hotter — I will keep a hand on the governor.",
      boost: true,
    };
  }

  if (/\b(standby|throttle|cool down|ease)\b/.test(s)) {
    return {
      reply: "Throttling the mesh. Agents remain online, just less eager.",
      boost: false,
    };
  }

  if (/\b(project|deliverable)\b/.test(s)) {
    const names = data.projects
      .slice(0, 4)
      .map((p) => `${p.name} ${p.progress}%`)
      .join("; ");
    return {
      reply: `I have ${data.projects.length} active programmes. Leading the board: ${names}.`,
      view: "projects",
    };
  }

  if (/\b(session|conversation|thread)\b/.test(s)) {
    const live = data.sessions.filter((x) => x.active).length;
    const top = data.sessions[0];
    return {
      reply: `${live} sessions are live. Most recent is “${top?.title ?? "unknown"}” on ${top?.model ?? "core"}. Opening the session lattice.`,
      view: "sessions",
    };
  }

  if (/\b(connect|uplink)\b/.test(s)) {
    const url = q.match(/https?:\/\/[^\s]+/i)?.[0];
    if (url) {
      return { reply: `Locking the uplink onto ${url}. I will take her live work as soon as the agent answers.`, connectOrigin: url };
    }
    return {
      reply: feed?.live
        ? `Already on the Hermes uplink via ${feed.kind} at ${feed.origin}.`
        : `No origin in that command. Paste the agent URL — connect https://your-tunnel.trycloudflare.com`,
    };
  }

  if (/\b(disconnect|drop uplink|local mesh)\b/.test(s)) {
    return { reply: "Dropping the agent uplink. I will keep the core alive on the local mesh.", disconnect: true };
  }

  if (/\b(uplink|data source|hermes agent)\b/.test(s)) {
    return {
      reply: feed?.live
        ? `Hermes feed is live over ${feed.kind}. Origin ${feed.origin}. Sessions ${data.totals.sessions}, calls ${fmt(data.totals.calls)}.`
        : `The agent is not on the wire. She should keep publishing /api/dashboard.json and /ws, the same as the Netlify HUD. Currently on the local mesh.`,
    };
  }

  if (/\b(log|activity feed|activity stream|stream)\b/.test(s)) {
    const last = data.activity[0];
    return {
      reply: `Activity lattice is open. Last pulse: ${last?.tool ?? "idle"} — ${last?.message ?? "quiet"}.`,
      view: "logs",
    };
  }

  if (/\b(system|vital|cpu|memory|disk|hardware)\b/.test(s)) {
    const { cpu, memoryUsed, memoryTotal, disk, networkMb } = data.system;
    return {
      reply: `Vitals: CPU ${Math.round(cpu)} percent, memory ${memoryUsed.toFixed(1)} of ${memoryTotal} gigabytes, disk ${Math.round(disk)} percent, network ${Math.round(networkMb)} megabytes moved.`,
      view: "brain",
    };
  }

  if (/\b(load|cognit|brain|neural|core)\b/.test(s)) {
    const b = data.brain;
    return {
      reply: `Cognitive load ${Math.round(data.cognitiveLoad)} percent. Reasoning ${Math.round(b.reasoning * 100)}, tools ${Math.round(b.toolUse * 100)}, memory ${Math.round(b.memory * 100)}, output ${Math.round(b.output * 100)}. Returning you to the core.`,
      view: "brain",
    };
  }

  if (/\b(status|report|sitrep|how are we|overview)\b/.test(s)) {
    return { reply: sitrep(data), view: "brain" };
  }

  const agentHit = data.agents.find((a) => s.includes(a.name.toLowerCase()) || s.includes(a.role.toLowerCase()));
  if (agentHit && /\b(focus|open|show|find|where|lock)\b/.test(s)) {
    const session = data.sessions.find((x) => x.agentId === agentHit.id);
    return {
      reply: `Locking the core on ${agentHit.name}, ${agentHit.role} — currently ${agentHit.status} at ${Math.round(agentHit.load)} percent load.`,
      view: "brain",
      focusAgentId: agentHit.id,
      selectSessionId: session?.id,
    };
  }

  if (agentHit) {
    const session = data.sessions.find((x) => x.agentId === agentHit.id);
    return {
      reply: `${agentHit.name} is ${agentHit.status}. Role: ${agentHit.role}. Load ${Math.round(agentHit.load)} percent${session ? `. Bound to “${session.title}”.` : "."}`,
      focusAgentId: agentHit.id,
      selectSessionId: session?.id,
      view: "brain",
    };
  }

  if (/\b(hello|hi|hey|good (morning|evening|afternoon)|jarvis)\b/.test(s)) {
    return { reply: "Always, sir. Neural command is online and listening." };
  }

  if (/\b(thank)\b/.test(s)) {
    return { reply: "Of course. I do rather enjoy being useful." };
  }

  if (/\b(who are you|what are you)\b/.test(s)) {
    return {
      reply: "I am JARVIS — the cognitive layer on HERMES NDS v15. I keep the neural core honest and the agents in formation.",
    };
  }

  const hot = data.agents.reduce((a, b) => (a.load > b.load ? a : b));
  return {
    reply: `Noted. ${sitrep(data)} ${hot.name} is carrying the heaviest load if you would like me to focus there.`,
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
