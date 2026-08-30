const KEY = "hermes.score";
const NOTES = [146.83, 174.61, 220, 261.63, 293.66, 220, 174.61, 146.83];

type Pack = {
  ctx: AudioContext;
  master: GainNode;
  duck: GainNode;
  nodes: Array<AudioNode & { stop?: (when?: number) => void }>;
  timer: number;
};

let pack: Pack | null = null;
let listeners = new Set<(on: boolean) => void>();

function emit(on: boolean) {
  listeners.forEach((fn) => fn(on));
}

function readWanted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

function drone(ctx: AudioContext, dest: AudioNode, freq: number, type: OscillatorType, gain: number) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gain;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 520;
  o.connect(f);
  f.connect(g);
  g.connect(dest);
  o.start();
  return o;
}

function startPack(): Pack {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  const duck = ctx.createGain();
  duck.gain.value = 1;
  master.connect(duck);
  duck.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.6);

  const nodes: Pack["nodes"] = [
    drone(ctx, master, 73.42, "triangle", 0.1),
    drone(ctx, master, 110, "sine", 0.055),
    drone(ctx, master, 146.83, "sine", 0.04),
  ];

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.16;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const nf = ctx.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.value = 340;
  const ng = ctx.createGain();
  ng.gain.value = 0.045;
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(master);
  noise.start();
  nodes.push(noise);

  let step = 0;
  const pluck = () => {
    if (!pack) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = NOTES[step % NOTES.length];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1400;
    o.connect(f);
    f.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 1.6);
    step += 1;
    pack.timer = window.setTimeout(pluck, step % 8 === 0 ? 1320 : 660);
  };
  const timer = window.setTimeout(pluck, 400);

  return { ctx, master, duck, nodes, timer };
}

export function isScoreOn() {
  return !!pack;
}

export function getScoreBeat() {
  if (!pack) return 0;
  const t = pack.ctx.currentTime;
  return 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.2);
}

export function duckScore(amount: number) {
  if (!pack) return;
  pack.duck.gain.setTargetAtTime(Math.max(0.08, 1 - amount), pack.ctx.currentTime, 0.08);
}

export async function setScore(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, on ? "1" : "0");
  if (on && !pack) {
    pack = startPack();
    if (pack.ctx.state === "suspended") await pack.ctx.resume();
  }
  if (!on && pack) {
    const dying = pack;
    pack = null;
    window.clearTimeout(dying.timer);
    dying.master.gain.exponentialRampToValueAtTime(0.0001, dying.ctx.currentTime + 0.45);
    window.setTimeout(() => {
      dying.nodes.forEach((n) => {
        try {
          n.stop?.();
        } catch {
          /* already stopped */
        }
      });
      void dying.ctx.close();
    }, 520);
  }
  emit(!!pack);
}

export async function toggleScore() {
  await setScore(!pack);
  return !!pack;
}

export function subscribeScore(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function wantedScore() {
  return readWanted();
}
