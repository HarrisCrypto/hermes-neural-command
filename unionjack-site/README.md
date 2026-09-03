# Union Jack British Auto Restoration — site

Static marketing site for Union Jack (San Martin, CA), built against the SEO/AEO brief and the full Grok Cursor prompt.

## Run

```bash
# simple (no motion modules)
python3 -m http.server 8000

# recommended (Vite + Lenis/GSAP)
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # dist/
```

## Hero approach (Task 2)

Real-time photoreal Three.js (GLTF roadster + HDRI + GTAO + motion blur + DoF) cannot honestly hit the **60fps / LCP &lt; 2.5s / &lt;8MB** budget on an M1 Air without licensed models, KTX2 textures, and weeks of art direction — and we still lack a licensed E-Type/Healey/MGA GLTF.

Per the prompt’s explicit alternative (Apple-style), the shipped hero is a **photoreal pre-rendered cinematic video loop** with an immediate poster swap:

- Poster paints first → video autoplays muted when ready
- `prefers-reduced-motion` keeps the poster
- Higgsfield MCP can replace `media/drive-hero.mp4` with a British-marque-specific clip once Desktop auth is complete

Legacy `drive.js` (r128 procedural) is retained only as archive; it is not loaded on the homepage.

## Design system

Badge-derived tokens: `--ink #12203F`, `--brass #B8912E`, `--paper #EDE9DF`, `--green #12352A`, EB Garamond / IBM Plex Sans. Marques as build plates, not cards.

## Content / SEO / AEO

- No invented car/owner stories; Concours spelling; NAP on Depot Ave; `info@unionjack.com` flagged as proposed
- Unique titles/descriptions/canonicals; `tel:` links; FAQ HTML ↔ schema parity; robots allow AI bots
- Marque pages + Mini + American classics + Journal + Process/FAQ/Reviews/Careers/Services

## Before production

- Host photos on own domain (still Wix CDN hotlinks)
- Drop `.html` via host config
- Live Google review feed; true same-car before/after frames from Marcello
- Vector logo; licence any future 3D/HDRI assets
- Confirm `info@unionjack.com`
- Authenticate Higgsfield in Cursor Desktop for marque-accurate hero film
- Grant Cursor GitHub App write on `Union-Jack-Rebuild-` for Pages deploy
