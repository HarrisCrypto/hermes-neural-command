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

Real-time photoreal Three.js (GLTF roadster + HDRI + GTAO + motion blur + DoF) cannot honestly hit the **60fps / LCP &lt; 2.5s / &lt;8MB** budget without licensed models and KTX2 textures.

Per the prompt’s explicit alternative (Apple-style), the shipped hero is a **photoreal pre-rendered cinematic loop** of a British racing green roadster at golden hour:

- `media/drive-poster.jpg` paints immediately (~185KB)
- `media/drive-hero.mp4` (~2.9MB) autoplays muted when ready
- `prefers-reduced-motion` keeps the poster
- See `LICENSES.md` and `GROK-SCORECARD.md`

Legacy `drive.js` (r128 procedural) is archive only; not loaded on the homepage.

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
