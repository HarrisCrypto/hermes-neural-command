export function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.round(n).toString();
}

export function fmtCost(n: number) {
  if (!Number.isFinite(n)) return "--";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export function fmtClock(d = new Date()) {
  return d.toLocaleTimeString("en-US", { hour12: false });
}

export function fmtUptime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
