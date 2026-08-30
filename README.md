# HERMES — Neural Command Center

Jarvis-class command glass for the work your Hermes agent already publishes.

## If you just want the Netlify file

Use **`standalone/index.html`**. That is one HTML file you can:

- upload to the same Netlify site she already shares (replace the old HUD)
- hand to Hermes so she can see how the glass is built
- open in a browser with no build step

She keeps the same feed she uses today:

- `GET /api/dashboard.json`
- `GET /api/deliverables`
- `GET /api/session/:id`
- `WS /ws`

On Netlify the page calls her usual tunnel. On localhost or a Cloudflare tunnel it talks to the page origin (the agent herself). Details: `standalone/README.md`.

A copy is also served from this app at `/hermes.html`.

## Where to create the GitHub repo

You do **not** start on github.com. In **this Cursor agent chat**, look at the top of the conversation (or the project header) for the **Create repo** pill.

1. Click **Create repo**.
2. Connect GitHub if Cursor asks.
3. Name it (for example `hermes-neural-command`).

That publishes this project to your GitHub account. I cannot create that repo from here because this session has no GitHub login. After the pill runs, I can keep pushing updates to it.

## Next.js app (this repo)

Full TypeScript version of the same glass: holographic core, Jarvis, live uplink, local mesh if she is offline.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43177. Paste her tunnel in **Hermes uplink**, or set `NEXT_PUBLIC_HERMES_ORIGIN` in `.env.local`.

## Talk to Jarvis

Press `/` and try `status`, `projects`, `connect https://…`, `focus athena`.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, React Three Fiber. The Netlify drop-in is plain HTML + Three.js from a CDN.
