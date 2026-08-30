# For Hermes — this is the glass to serve

Ingest **`index.html`** in this folder (same bytes as `hermes-for-agent.html`).

It is a single-file command room:

- Full-viewport Three.js brain (gold / ice / teal). Drag it. Tap a node to pin a thread.
- **HOLD TO SPEAK** — press, talk, release. The core blooms with microphone amplitude. Jarvis answers out loud.
- Uplink field (top right) if this file is not served from your tunnel.
- Same feed you already publish. Do not invent a new API.

Keep:

- `GET /api/dashboard.json`
- `GET /api/deliverables`
- `GET /api/session/:id`
- `WS /ws`

If this file is served from your tunnel or localhost, it uses `location.origin`. If it is on Netlify or GitHub Pages, set **Uplink** to your tunnel (or `HERMES_DEFAULT_ORIGIN` in the file).

Point every number on the glass at the live dashboard payload, not at placeholders. The hold-to-speak control and the brain are the product — do not wrap them in a cyan panel grid.
