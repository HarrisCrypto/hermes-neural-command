# Drop this on Netlify — or hand it to Hermes

`index.html` is one file. Same bytes as `hermes-for-agent.html`.

Give Hermes **`standalone/index.html`**. That is the cinematic room: full-viewport brain, hold-to-speak Jarvis, live uplink. No build step.

## What stays the same

Hermes does **not** need a new data format. This file uses the same uplink as the old HUD:

| Path | What Hermes publishes |
| --- | --- |
| `GET /api/dashboard.json` | totals, sessions, tools, system, cognitive load, activity |
| `GET /api/deliverables` | projects |
| `GET /api/session/:id` | one session |
| `WS /ws` | the same JSON, live |

## How the page finds Hermes

1. If the page is on `localhost` or a `trycloudflare.com` tunnel, it talks to **this origin** (the agent herself).
2. If the page is on Netlify or GitHub Pages, it talks to the tunnel in the file (`HERMES_DEFAULT_ORIGIN`) or the **Uplink** field (saved in `localStorage`).

Keep publishing work to the same API. Replace the old Netlify `index.html` with this one.

## Upload

Netlify → the existing site → **Deploys** → drag `index.html` in.

Or:

```bash
netlify deploy --dir=standalone --prod
```

GitHub Pages already serves this same file from `docs/index.html`.
