# IDOC — Minimal Web App (TH/EN)

Single-file SPA built with Tailwind (CDN) + vanilla JS. Stores data in localStorage.
Features:
- Bilingual TH/EN switcher
- Customers & Items management
- Create Invoice with VAT modes (exclusive/inclusive/none) and WHT
- Live preview + Print to PDF
- Liquid Glass UI style

## Run locally
Open `index.html` in a browser (no build step).

## Deploy (GitHub Pages)
1. Create a new repo and upload the files in this folder.
2. In GitHub, go to **Settings → Pages** and choose Branch `main` (or `master`) and root `/`.
3. Wait 1–2 minutes. Your site is live: `https://<username>.github.io/<repo>`

Or serve locally:
```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Notes
- This is a client‑side MVP: no auth, no database. All data stored in localStorage.
- To reset the app, clear browser storage for the site.
