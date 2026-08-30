import type { Project } from "@/lib/types";

const INVENTED =
  /^(atlas|atlas reasoner|hermes nds|hermes neural core|iris perception stack|mnemosyne vault|hephaestus forge|argus watchnet)$/i;

export const HOUSE_PROJECTS: Project[] = [
  {
    id: "purr",
    name: "PURR therapy",
    category: "Therapy",
    description: "The PURR therapy programme — sessions, notes, and follow-through.",
    progress: 68,
    icon: "◈",
    updated: "live",
  },
  {
    id: "pipeline",
    name: "Content pipeline",
    category: "Media",
    description: "The content line: ideas through edit and publish.",
    progress: 54,
    icon: "◈",
    updated: "live",
  },
  {
    id: "hermes",
    name: "Hermes",
    category: "Agent",
    description: "Hermes herself — the agent that runs this house.",
    progress: 81,
    icon: "◈",
    updated: "live",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Command",
    description: "This command glass. The neural HUD for the live work.",
    progress: 73,
    icon: "◈",
    updated: "live",
  },
  {
    id: "sams",
    name: "Sam's window washing",
    category: "Business",
    description: "Sam's window washing — jobs, clients, and the site.",
    progress: 47,
    icon: "◈",
    updated: "live",
  },
];

function keyName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isInventedProject(name: string) {
  return INVENTED.test(keyName(name));
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

  return house;
}
