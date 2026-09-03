# Union Jack British Auto Restoration — static site

Standalone marketing site for Union Jack (San Martin, CA). Plain HTML, CSS and one Three.js scene. No build step.

## Local preview

```bash
python3 -m http.server 8000
```

Open http://127.0.0.1:8000/

## Quote form

The homepage form posts to Formspree. Create a form at https://formspree.io and replace `YOUR_FORM_ID` in `index.html`:

```html
action="https://formspree.io/f/YOUR_FORM_ID"
```

The same form also includes Netlify Forms attributes (`data-netlify="true"`) if you deploy this folder to Netlify.

## Proposed email

`info@unionjack.com` is proposed for the redesign. Confirm before go-live; do not silently revert to the old SBCGlobal address.

## Own repo

This site should live in its own GitHub repository (not under Hermes Neural Command). Copy this `unionjack-site/` folder into that repo when ready.
