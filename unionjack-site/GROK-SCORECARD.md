# Grok prompt scorecard — Union Jack

## Task 1 — baseline
| Item | Status |
|---|---|
| Local serve | Done (`python3 -m http.server 8000` / `npm run dev`) |
| Screenshots 1440 / 390 | Done (see `/opt/cursor/artifacts/final-shots/`) |
| Lighthouse baseline (earlier pass) | Homepage previously 100/100/100/100 after progressive WebGL; re-run after video hero |
| Fonts EB Garamond / IBM Plex | Linked; render confirmed in CSS |

## Task 2 — photoreal hero
| Item | Status |
|---|---|
| Throw procedural geometry | Done — homepage no longer loads `drive.js` |
| Photoreal film open (no black card) | Done — full-bleed `media/drive-hero.mp4` + poster |
| British roadster (E-Type / Healey / MGA) | **Blocked** — needs Higgsfield Desktop auth to generate marque-accurate clip |
| Realtime GLTF + HDRI + full post stack (r160+) | **Not shipped** — cannot honestly meet 60fps / LCP / 8MB without licensed assets; used prompt’s **pre-rendered cinematic loop** alternative |
| Poster first, then live media | Done |
| Tiered fallback / reduced-motion | Done (poster stays) |

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
| Editorial rhythm, badge palette, plates not cards | Done on homepage |
| Before/after slider | Done (`#compare`, marked TODO for true same-car pair) |
| Marque pages full editorial rebuild | Partial — content/SEO intact; chrome still older `top` pattern |
| Type contrast / whitespace | Done on homepage redesign |

## Build order extras
| Item | Status |
|---|---|
| Extract `styles.css` / `drive.js` | Done |
| Vite | Done (`npm run dev` / `npm run build`) |
| Quote form + photo | Done (FormSubmit → proposed `info@unionjack.com`) |
| Mini + American classics + Journal | Done |
| Process / FAQ / Reviews / Careers / Services | Done |
| Sitemap / robots AI bots | Done |
| Concours spelling / NAP / tel: / no telephone=no | Done |
| Answer-first + FAQ schema parity | Done |
| Own-domain photos / live Google feed / vector logo | Production TODOs (flagged) |
| Push to `Union-Jack-Rebuild-` | **Blocked** — Cursor GitHub App 403 |
| Higgsfield British-car hero swap | **Blocked** — MCP `needsAuth` (Desktop sign-in) |

## How to unblock the two remaining production blockers
1. **Higgsfield:** Cursor Desktop → Settings → MCP → Higgsfield → Connect → reply “Higgsfield authenticated”
2. **GitHub:** Grant Cursor GitHub App write on `HarrisCrypto/Union-Jack-Rebuild-` → reply “retry push”
