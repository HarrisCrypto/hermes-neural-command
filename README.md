# HERMES — Neural Command Center

A fully working Jarvis-class command dashboard. The original Netlify mock sat empty because its live tunnel was down. This version runs a complete neural mesh on the client: live telemetry, a holographic 3D core, orbiting agents, and a command layer you can type or speak to.

## What you get

- **Jarvis cognitive layer** — Ask for status, vitals, sessions, projects, or `focus athena`. Optional voice in and out (browser speech APIs).
- **Holographic neural core** — React Three Fiber scene with custom shaders, bloom, HUD rings, synaptic pulses, and clickable agent nodes.
- **Live command surface** — Sessions, tokens, calls, cost, cognitive load, system gauges, radar, throughput, and a streaming activity feed that keep moving.
- **Projects, sessions, activity** — Working views with real sample programmes and session detail popovers.

No API keys. The mesh is simulated so the dashboard is always alive.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43177](http://127.0.0.1:43177).

## Talk to Jarvis

- Press `/` and type a command
- Try `status`, `system`, `projects`, `sessions`, `boost`, `standby`, `focus athena`
- Use the mic to speak a command (Chrome / Edge)
- Toggle the speaker to hear replies

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, React Three Fiber, Drei, and postprocessing bloom.
