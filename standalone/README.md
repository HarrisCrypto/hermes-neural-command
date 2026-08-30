# Drop this on Netlify

`index.html` is a **single-file** HERMES command center. It is the file you can:

- upload to the same Netlify site your agent already shares
- hand to Hermes so she can see how the glass is built
- open locally in a browser

## What stays the same

Your agent does **not** need a new data format. This file uses the same uplink as the old HUD:

| Path | What Hermes publishes |
| --- | --- |
| `GET /api/dashboard.json` | totals, sessions, tools, system, cognitive load, activity |
| `GET /api/deliverables` | projects |
| `GET /api/session/:id` | one session |
| `WS /ws` | the same JSON, live |

## How the page finds Hermes

1. If the page is on `localhost` or a `trycloudflare.com` tunnel, it talks to **this origin** (the agent herself).
2. If the page is on Netlify, it talks to the tunnel URL in the file (`HERMES_DEFAULT_ORIGIN`).
3. You can override that in the **Hermes uplink** field at the bottom. It is stored in `localStorage`.

So: keep publishing work to the same API. Replace the old Netlify `index.html` with this one. The new brain, Jarvis, and live panels light up from her real sessions.

## Upload

Netlify → the existing site → **Deploys** → drag `index.html` in, or replace the published file.

Or from the CLI:

```bash
netlify deploy --dir=standalone --prod
```

## How this file is put together

Read the comments at the top of `index.html`. In order:

1. **HUD CSS** — dark glass, Orbitron / Rajdhani / Share Tech Mono
2. **Markup** — header stats, nav, canvas, charts, Jarvis, uplink bar
3. **Feed** — `fetchD()` and `conn()` pull `/api/dashboard.json` and `/ws`
4. **Brain** — Three.js neural core (drag, zoom, click nodes)
5. **Jarvis** — typed commands over the live totals
6. **Fallback mesh** — only if the agent is unreachable, so the glass is not empty

The Next.js app in the repo root is the same idea with a build step. This HTML is the portable copy.
