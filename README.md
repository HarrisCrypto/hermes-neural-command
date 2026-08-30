# HERMES — Neural Command Center

A fully working Jarvis-class command dashboard. The original Netlify mock sat empty because its live tunnel was down. This version runs a complete neural mesh on the client: live telemetry, a holographic 3D core, orbiting agents, and a command layer you can type or speak to.

## What you get

- **Jarvis cognitive layer** — Ask for status, vitals, sessions, projects, or `focus athena`. Optional voice in and out (browser speech APIs).
- **Holographic neural core** — React Three Fiber scene with custom shaders, bloom, HUD rings, synaptic pulses, and clickable agent nodes.
- **Live command surface** — Sessions, tokens, calls, cost, cognitive load, system gauges, radar, throughput, and a streaming activity feed that keep moving.
- **Projects, sessions, activity** — Working views with real sample programmes and session detail popovers.

No API keys. When your Hermes agent is offline the core stays alive on a local mesh. When slime arrives, the mesh yields to the live feed.

## Sync your Hermes agent

The original Netlify HUD expected the NDS agent here:

- `GET /api/dashboard.json` — totals, sessions, tools, system, cognitive load, activity
- `GET /api/deliverables` — projects
- `GET /api/session/:id` — session detail
- `WS /ws` — the same JSON as a live slime frame

This dashboard speaks that contract in both directions.

**Pull (same as before).** Point the uplink at your agent tunnel or localhost:

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_HERMES_ORIGIN=https://your-tunnel.trycloudflare.com
npm run dev
```

Or paste the URL in **Hermes agent uplink** and hit Connect. Jarvis also accepts `connect https://…` and `slime`.

**Push.** Have the agent POST snapshots here (CORS is open):

```bash
curl -X POST http://127.0.0.1:43177/api/ingest \
  -H 'Content-Type: application/json' \
  -d '{"slime":{"totals":{"sessions":12,"tool_calls":880},"cognitive_load":61}}'
```

Raw `dashboard.json` bodies work too, or `{ "type": "slime", "payload": { … } }`.

The footer shows `WebSocket slime`, `Polling slime`, `Ingest slime`, or `Local mesh`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43177](http://127.0.0.1:43177).

## Talk to Jarvis

- Press `/` and type a command
- Try `status`, `slime`, `connect https://…`, `system`, `projects`, `focus athena`
- Use the mic to speak a command (Chrome / Edge)
- Toggle the speaker to hear replies

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, React Three Fiber, Drei, and postprocessing bloom.
