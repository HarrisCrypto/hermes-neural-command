#!/usr/bin/env python3
"""Upgrade marque/interior pages: shared nav, full-bleed photo heroes, cleaner alts."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NAV = """\
<header class="nav is-solid page-nav" id="nav">
  <div class="nav-inner">
    <a class="nav-logo" href="index.html" aria-label="Union Jack home">
      <img src="logo.png" width="120" height="60" alt="Union Jack">
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="services.html">Services</a>
      <a href="process.html">Process</a>
      <a href="index.html#marques">Marques</a>
      <a href="faq.html">FAQ</a>
      <a href="journal.html">Journal</a>
      <a href="index.html#quote" class="nav-cta">Get a quote</a>
      <a href="tel:+14086861101" class="nav-phone">(408) 686-1101</a>
    </nav>
    <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navDrawer" aria-label="Open menu">Menu</button>
  </div>
  <div class="nav-drawer" id="navDrawer" hidden>
    <a href="services.html">Services</a>
    <a href="process.html">Process</a>
    <a href="jaguar-restoration.html">Jaguar</a>
    <a href="mg-restoration.html">MG</a>
    <a href="triumph-restoration.html">Triumph</a>
    <a href="austin-healey-restoration.html">Austin-Healey</a>
    <a href="mini-restoration.html">Mini</a>
    <a href="morris-minor-restoration.html">Morris Minor</a>
    <a href="american-classics-restoration.html">American classics</a>
    <a href="other-british-marques.html">Other British</a>
    <a href="reviews.html">Reviews</a>
    <a href="faq.html">FAQ</a>
    <a href="careers.html">Careers</a>
    <a href="journal.html">Journal</a>
    <a href="index.html#quote">Get a quote</a>
    <a href="tel:+14086861101">Call (408) 686-1101</a>
  </div>
</header>
"""

FOOTER = """\
<footer class="site-foot">
  <div class="shell foot-grid">
    <div>
      <strong>Union Jack</strong>
      <p>British Auto Restoration<br>Est. 1988 · San Martin, CA</p>
    </div>
    <div>
      <a href="tel:+14086861101">(408) 686-1101</a><br>
      <a href="mailto:info@unionjack.com">info@unionjack.com</a>
      <p style="margin-top:.6rem;font-size:.85rem;color:#8E97A8">Proposed address — confirm before production mail.</p>
    </div>
    <div class="foot-links">
      <a href="services.html">Services</a>
      <a href="process.html">Process</a>
      <a href="faq.html">FAQ</a>
      <a href="reviews.html">Reviews</a>
      <a href="careers.html">Careers</a>
      <a href="journal.html">Journal</a>
      <a href="index.html#quote">Quote</a>
    </div>
  </div>
  <div class="shell foot-fine">
    <p>© 2026 Union Jack Ltd. · 13555 Depot Ave, San Martin, CA 95046 · <a href="sitemap.xml">Sitemap</a></p>
  </div>
</footer>
"""

STICKY = '<a class="sticky-call" href="tel:+14086861101">Call (408) 686-1101</a>'
SITE_JS = '<script type="module" src="src/site.js"></script>'

HEROES = {
    "jaguar-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_a0f10c7ca8284e2aabc2ffe88cd08079.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_a0f10c7ca8284e2aabc2ffe88cd08079.jpg",
        "Jaguar S-Type after restoration, Union Jack, San Martin CA",
    ),
    "mg-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_bd421b2b8db345f4baa1457ba80cc475.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_bd421b2b8db345f4baa1457ba80cc475.jpg",
        "MGA roadster paint and panel work, Union Jack, San Martin CA",
    ),
    "triumph-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_993ba6831e7d47348993c007b4246606.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_993ba6831e7d47348993c007b4246606.jpg",
        "Triumph TR3 bodywork at Union Jack, San Martin CA",
    ),
    "austin-healey-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_99bd54f309c04345866c42c6d4d37f6b.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_99bd54f309c04345866c42c6d4d37f6b.jpg",
        "Austin-Healey 3000 Mk III BJ8, Union Jack, San Martin CA",
    ),
    "mini-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_b23a0dd600b14327ae5b42c02826da5d.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_b23a0dd600b14327ae5b42c02826da5d.jpg",
        "1962 Austin-Healey Sprite at Union Jack, San Martin CA",
    ),
    "morris-minor-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_06ea89db24214ba28267d8154bbc26d9.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_06ea89db24214ba28267d8154bbc26d9.jpg",
        "Classic British coachwork at Union Jack, San Martin CA",
    ),
    "other-british-marques.html": (
        "https://static.wixstatic.com/media/0d4294_394c8fb6e8354f2aa65e5b68528b61a1.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_394c8fb6e8354f2aa65e5b68528b61a1.jpg",
        "Daimler SP250 restored at Union Jack, San Martin CA",
    ),
    "american-classics-restoration.html": (
        "https://static.wixstatic.com/media/0d4294_993ba6831e7d47348993c007b4246606.jpg/v1/fill/w_1920,h_1080,al_c,q_85,enc_auto/0d4294_993ba6831e7d47348993c007b4246606.jpg",
        "Chassis and body restoration work at Union Jack, San Martin CA",
    ),
}

OTHER = [
    "services.html",
    "process.html",
    "faq.html",
    "reviews.html",
    "careers.html",
    "journal.html",
    "journal-mini-subframes.html",
    "engine-rebuilding.html",
    "paint-bodywork.html",
    "upholstery.html",
    "electrical-rewiring.html",
    "quote-thanks.html",
]


def clean_alts(html: str) -> str:
    def repl(m: re.Match) -> str:
        alt = m.group(1)
        alt = re.sub(
            r"\s*restored by Union Jack British Auto Restoration,?\s*",
            ", Union Jack, ",
            alt,
            flags=re.I,
        )
        alt = re.sub(r",\s*,", ",", alt)
        alt = re.sub(r"\s{2,}", " ", alt).strip(" ,")
        return f'alt="{alt}"'

    return re.sub(r'alt="([^"]*)"', repl, html)


def replace_top_nav(html: str) -> str:
    for pat in (
        r'<div class="top">.*?</div></div>\s*',
        r'<header class="site">.*?</header>\s*',
        r'<div class="topnav">.*?</div>\s*',
    ):
        html2, n = re.subn(pat, NAV + "\n", html, count=1, flags=re.S)
        if n:
            return html2
    return html


def upgrade_marque_hero(html: str, src: str, alt: str) -> str:
    m = re.search(
        r'<header class="hero-m"><div class="wrap">(.*?)</div></header>',
        html,
        flags=re.S,
    )
    if not m:
        return html
    inner = m.group(1)
    h1 = re.search(r"<h1>.*?</h1>", inner, flags=re.S)
    answer = re.search(r'<p class="answer">.*?</p>', inner, flags=re.S)
    cta = re.search(r'<div class="cta">.*?</div>', inner, flags=re.S)
    parts = [p.group(0) for p in (h1, answer, cta) if p]
    body = "\n".join("      " + p for p in parts)
    block = f"""\
<section class="page-hero" aria-label="Featured workshop photograph">
  <img class="page-hero-media" src="{src}" alt="{alt}" width="1920" height="1080" fetchpriority="high" decoding="async">
  <div class="page-hero-shade" aria-hidden="true"></div>
  <div class="page-hero-copy">
    <div class="shell">
{body}
    </div>
  </div>
</section>
"""
    return html[: m.start()] + block + html[m.end() :]


def replace_footer_and_chrome(html: str) -> str:
    html = re.sub(r'<footer class="foot">.*?</footer>\s*', "", html, count=1, flags=re.S)
    html = re.sub(r'<footer class="site-foot">.*?</footer>\s*', "", html, count=1, flags=re.S)
    html = re.sub(r"<footer(?![^>]*site-foot)[^>]*>.*?</footer>\s*", "", html, count=1, flags=re.S)
    html = re.sub(r'<a class="sticky-call"[^>]*>.*?</a>\s*', "", html, flags=re.S)
    html = re.sub(r'<script type="module" src="src/site\.js"></script>\s*', "", html)
    # Insert before closing body
    inject = FOOTER + "\n" + STICKY + "\n" + SITE_JS + "\n"
    if "</body>" not in html:
        html += inject
    else:
        html = html.replace("</body>", inject + "</body>", 1)
    return html


def process(path: Path, marque: bool = False) -> None:
    html = path.read_text(encoding="utf-8")
    html = html.replace('<html lang="en">', '<html lang="en-US">')
    html = replace_top_nav(html)
    if marque:
        src, alt = HEROES[path.name]
        html = upgrade_marque_hero(html, src, alt)
        # crumb should sit under sticky nav — move crumb before page-hero if needed
        # already is before hero-m, keep order: nav, crumb, page-hero
    html = clean_alts(html)
    html = replace_footer_and_chrome(html)
    path.write_text(html, encoding="utf-8")
    print("ok", path.name)


def main() -> None:
    for name in HEROES:
        process(ROOT / name, marque=True)
    for name in OTHER:
        p = ROOT / name
        if p.exists():
            process(p, marque=False)


if __name__ == "__main__":
    main()
