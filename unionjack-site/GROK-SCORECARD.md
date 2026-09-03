# Grok prompt scorecard — Union Jack

## Task 1 — baseline
| Item | Status |
|---|---|
| Local serve | Done (`python3 -m http.server 8000` / `npm run dev`) |
| Screenshots 1440 / 390 | Done (artifacts under `/opt/cursor/artifacts/`) |
## Final Lighthouse (homepage, mobile simulation)
| Metric | Score |
|---|---|
| Performance | **88–95** (photoreal hero media; poster-first; throttled mobile LCP varies) |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

Polish pass: coherent British-roadster film (chase/side/bonnet), quiet hero nav, single brand lockup, atelier section voice, featured work, honest Healey progress slider, careers demoted from primary path.
| Fonts EB Garamond / IBM Plex | Linked |

## Task 2 — photoreal hero
| Item | Status |
|---|---|
| Throw procedural geometry | Done — homepage does not load `drive.js` |
| Photoreal film open (no black card) | Done — full-bleed `media/drive-hero.mp4` + poster |
| British roadster (E-Type / Healey / MGA) | Done for poster + hero loop (BRG roadster, golden hour). Continuous live-action drive clip still improves with Higgsfield once authenticated |
| Realtime GLTF + HDRI + full post (r160+) | **Not shipped** — cannot honestly meet 60fps / LCP / 8MB; used prompt’s **pre-rendered cinematic loop** |
| Poster first, then live media | Done (`preload` poster; video `preload=metadata`) |
| Tiered fallback / reduced-motion | Done (poster stays) |
| Hero assets under 8MB | Done (~2.9MB video + ~185KB poster) |

## Task 3 — motion
| Item | Status |
|---|---|
| Lenis + GSAP ScrollTrigger | Done (`src/motion.js`) |
| Calm rise/fade ~850ms, scrub lag | Done |
| Image parallax ≤12% | Done |
| `prefers-reduced-motion` disables | Done |

## Task 4 — layout
| Item | Status |
|---|---|
| Editorial rhythm, badge palette, plates not cards | Done |
| Before/after slider | Done (`#compare`, TODO for true same-car pair) |
| Marque pages full-bleed photo heroes + shared chrome | Done |
| No all-caps eyebrows / templated cards | Done (sentence-case eyebrows) |
| Type contrast / whitespace | Done |

## Build order extras
| Item | Status |
|---|---|
| Extract `styles.css` / `drive.js` | Done |
| Vite | Done |
| Quote form + photo | Done (FormSubmit → proposed `info@unionjack.com`, flagged) |
| Mini + American classics + Journal | Done |
| Process / FAQ / Reviews / Careers / Services | Done |
| Sitemap / robots AI bots | Done |
| Concours spelling / NAP / tel: / no telephone=no | Done |
| Answer-first + FAQ schema parity | Done |
| Opening hours 9–5 in schema | Done |
| `LICENSES.md` | Done |
| Own-domain photos / live Google feed / vector logo | Production TODOs |
| Push to `Union-Jack-Rebuild-` | **Blocked** — Cursor GitHub App 403 |
| Higgsfield continuous-drive swap | Optional upgrade — MCP `needsAuth` |

## Honest gaps left for the client
1. Authenticate Higgsfield → continuous live-action British drive clip (optional polish).
2. Grant Cursor GitHub App write on `HarrisCrypto/Union-Jack-Rebuild-` → push + Pages.
3. Supply a true same-car before/after pair; confirm `info@unionjack.com`; re-host Wix images; vector logo; live Google reviews.
