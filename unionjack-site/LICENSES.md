# Media licences — Union Jack rebuild

Record every third-party 3D / HDRI / stock / generated asset before production launch.

| Asset | Source | Licence / notes |
|---|---|---|
| `media/drive-poster.jpg` | Generated for this redesign (British roadster, golden-hour country lane) | Commissioned for Union Jack prototype; replace with licensed film still or shop photography before launch if required |
| `media/drive-hero.mp4` | Ken Burns cinematic loop built from the poster + Union Jack workshop photographs hosted on the Wix CDN | Workshop photos are client property; hot-linked CDN URLs are prototype-only — re-host on unionjack.com before launch |
| Workshop stills throughout pages | Client Wix CDN (`static.wixstatic.com/media/0d4294_*`) | Client-owned; **do not** invent owner / year / colour / duration stories for specific cars |
| `logo.png` | Recovered raster from existing signage screenshot | Obtain original vector from signage vendor before print / high-DPI use |
| Fonts EB Garamond / IBM Plex Sans | Google Fonts | OFL |
| Lenis / GSAP (CDN ESM) | npm / jsDelivr | MIT / GreenSock standard licence — verify production licence for GSAP |

## Deliberately not shipped

Realtime Three.js photoreal stack (GLTF British roadster + HDRI + CSM + full post) was **not** shipped. Hitting 60fps @ 1440p, LCP &lt; 2.5s and &lt; 8MB hero assets with licensed geometry could not be guaranteed honestly in this environment. The Grok prompt’s **pre-rendered cinematic loop** alternative is what ships.

## Higgsfield follow-up

When Higgsfield MCP is authenticated in Cursor Desktop, replace `drive-hero.mp4` with a marque-accurate continuous drive clip (E-Type / Healey 3000 / MGA), golden hour, country lane, under 8MB, and update this table with the generation id and licence terms.
