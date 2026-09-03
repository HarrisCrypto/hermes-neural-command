# Union Jack British Auto Restoration — static site

Standalone marketing site for Union Jack (San Martin, CA). Plain HTML, CSS and one Three.js scene. No build step.

## Local preview

```bash
python3 -m http.server 8000
```

Open http://127.0.0.1:8000/

## Quote form

The homepage form posts to [FormSubmit](https://formsubmit.co) at `info@unionjack.com` (no account needed). The first submission may ask you to confirm that inbox.

To switch to Formspree later, change the form `action` in `index.html`. Netlify Forms attributes are also present if you deploy to Netlify.

## Proposed email

`info@unionjack.com` is proposed for the redesign. Confirm before go-live; do not silently revert to the old SBCGlobal address.

## Own repo

This site should live in its own GitHub repository (not under Hermes Neural Command). Copy this `unionjack-site/` folder into that repo when ready.
