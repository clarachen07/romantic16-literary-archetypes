# ROMANTIC16 Website

A static Chinese-language questionnaire built with HTML, CSS, and native JavaScript modules. All application assets are included in `dist/`; there is no npm installation or application build step.

## Local server

From the repository root:

```sh
python3 -m http.server 4173 --directory romantic16-site/dist
```

Open `http://localhost:4173/`. Direct `file://` navigation is unsuitable for the module and JSON loading used by the website.

## Checks

```sh
node romantic16-site/tests/package-integrity.mjs
```

This checks byte-for-byte parity with `questionnaire-engine/`, all 16 public profiles, bundled portraits and fonts, and essential accessibility markup.

The existing browser checks require the local server above and Chrome with remote debugging on port 9223. Use a separate temporary browser profile. They use Node.js built-in WebSocket support; Node.js 24 or later is recommended.

```sh
node romantic16-site/tests/browser-smoke.mjs
node romantic16-site/tests/loading-smoke.mjs
node romantic16-site/tests/share-actions.mjs
```

`browser-smoke.mjs` supports `SITE_URL`, `CHROME_DEBUG_PORT`, and `SCREENSHOT_DIR`. `loading-smoke.mjs` supports `SITE_URL`; `share-actions.mjs` uses the default local URL. Some screenshot checks write into temporary directories, which must exist before running them. Browser sharing checks simulate browser APIs and do not prove actual mobile sharing behavior.

## Maintenance scripts

- `scripts/generate-share-qr.py` creates the bundled QR for `https://romantic16.netlify.app/`. It requires Python with `qrcode` and Pillow; ordinary website use does not.
- `scripts/subset-fonts.mjs` regenerates font subsets from three supplied original font files. It requires Python FontTools with WOFF2 support. Keep the existing font licenses with generated assets.

## Hosting

Serve `dist/` as the document root. For the existing Netlify configuration, use `romantic16-site/` as the base directory and `dist` as the publish directory. Local provider credentials and account identifiers are excluded from this repository. Uploading source to GitHub does not redeploy the website.
