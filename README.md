# HERMES — Neural Command

A cinematic command room for the work your Hermes agent already publishes. Hold the gold orb to speak to Jarvis. The brain listens with you.

## Open it on your phone

GitHub Pages (same file as `standalone/index.html` / `docs/index.html`):

**https://harriscrypto.github.io/hermes-neural-command/**

1. Tap **HOLD TO SPEAK** and keep your finger down.
2. Talk. The core should bloom with your voice.
3. Release to send. Jarvis answers out loud.
4. Drag the brain. Tap a glowing project nodule — synapses fire, and that work spins to the front. Ask Jarvis about a project by name and the same nodule comes forward.
5. **Uplink** once if her tunnel URL changed.

Safari needs HTTPS for the microphone. Pages is HTTPS. `http://127.0.0.1` on the phone will not work.

## Talk to Jarvis

- Hold the button, or hold **space** in the Next.js app
- Chips: `status`, `projects`, `purr`
- Type a command under the button if you prefer silence
- `connect https://your-tunnel.trycloudflare.com`

## What Hermes still publishes

Unchanged:

- `GET /api/dashboard.json`
- `GET /api/deliverables`
- `GET /api/session/:id`
- `WS /ws`

On localhost or a Cloudflare tunnel the glass talks to the page origin. On Pages it uses the saved uplink, or her usual tunnel.

Drop-in copies:

- `standalone/index.html` — Netlify / Hermes
- `docs/index.html` — GitHub Pages
- `/hermes.html` — served from the Next.js app

## Next.js room (this repo)

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43177. Same hold-to-speak room, with a live Three.js core.

## Stack

Next.js, TypeScript, Tailwind, React Three Fiber. The Pages / Netlify surface is one HTML file and Three.js from a CDN.
