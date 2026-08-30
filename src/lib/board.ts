import type { Project } from "@/lib/types";

const INVENTED =
  /^(atlas|atlas reasoner|hermes nds|hermes neural core|iris perception stack|mnemosyne vault|hephaestus forge|argus watchnet)$/i;
const HIDDEN = /slime/i;
export const DEST_KEY = "hermes.destinations";

export const HOUSE_PROJECTS: Project[] = [
  {
    id: "purr",
    name: "PURR therapy",
    category: "Therapy",
    description: "The PURR therapy programme — sessions, notes, and the channel.",
    progress: 68,
    icon: "◈",
    href: "",
    updated: "live",
  },
  {
    id: "pipeline",
    name: "Content pipeline",
    category: "Media",
    description: "The content line: ideas through edit and publish.",
    progress: 54,
    icon: "◈",
    href: "",
    updated: "live",
  },
  {
    id: "hermes",
    name: "Hermes",
    category: "Agent",
    description: "Hermes herself — the agent that runs this house.",
    progress: 81,
    icon: "◈",
    href: "",
    updated: "live",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Command",
    description: "This command glass. The neural HUD for the live work.",
    progress: 73,
    icon: "◈",
    href: "https://harriscrypto.github.io/hermes-neural-command/",
    updated: "live",
  },
  {
    id: "sams",
    name: "Sam's window washing",
    category: "Business",
    description: "Sam's window washing — jobs, clients, and the site.",
    progress: 47,
    icon: "◈",
    href: "",
    updated: "live",
  },
];

function keyName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isInventedProject(name: string) {
  return INVENTED.test(keyName(name)) || HIDDEN.test(name);
}

export function isHiddenCopy(value: string) {
  return HIDDEN.test(value || "");
}

export function readDestinations(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEST_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function writeDestination(id: string, url: string) {
  const next = { ...readDestinations() };
  const cleaned = url.trim();
  if (cleaned) next[id] = cleaned;
  else delete next[id];
  localStorage.setItem(DEST_KEY, JSON.stringify(next));
}

export function withDestinations(projects: Project[]): Project[] {
  const dest = readDestinations();
  return projects.map((p) => ({
    ...p,
    href: dest[p.id] || p.href,
  }));
}

export function mergeBoard(live: Project[] = []): Project[] {
  const house = HOUSE_PROJECTS.map((p) => ({ ...p }));
  const byName = new Map(house.map((p) => [keyName(p.name), p]));

  for (const incoming of live) {
    const name = incoming.name;
    if (!name || isInventedProject(name)) continue;
    const key = keyName(name);
    const hit = byName.get(key);
    if (hit) {
      hit.progress = incoming.progress ?? hit.progress;
      hit.description = incoming.description || hit.description;
      hit.category = incoming.category || hit.category;
      hit.updated = incoming.updated || hit.updated;
      hit.href = incoming.href || hit.href;
    } else {
      house.push({ ...incoming });
      byName.set(key, incoming);
    }
  }

  return withDestinations(house);
}

export function openHref(url?: string) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function linkLabel(url?: string) {
  if (!url) return "Open";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Open";
  }
}
