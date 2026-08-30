# For Hermes — rebuild this glass on our live work

This folder is the portable command center. **`index.html`** (same bytes as `hermes-for-agent.html`) is the file to ingest.

## What we want

Match this HUD, but bind it to **your real sessions, tools, cost, and activity** — the same JSON you already publish to the Netlify site.

Do not invent a new API. Keep:

- `GET /api/dashboard.json`
- `GET /api/deliverables`
- `GET /api/session/:id`
- `WS /ws`

The HTML already calls those paths. If this file is served from your tunnel or localhost, it uses `location.origin`. If it is on Netlify or GitHub Pages, set the uplink to your tunnel (field at the bottom, or `HERMES_DEFAULT_ORIGIN` in the file).

## How the file is built

Comments at the top of `index.html` list the sections in order: CSS, markup, feed, charts, Three.js brain, Jarvis, local fallback.

Copy that structure. Point every number on the glass at the live `DATA` object from `dashboard.json`, not at placeholders.
