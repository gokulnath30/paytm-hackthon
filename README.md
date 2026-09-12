# Kirana AI — Paytm Store Assistant (PWA prototype)

Voice-first AI assistant for kirana (small shop) merchants. A working
prototype of the flow: chat home → add a product by voice → build a bill by
voice → generate a Paytm-style QR → soundbox-style "payment received" alert →
automatic reconciliation against the pending bill → an "ask merchant"
fallback when a payment can't be auto-matched → an AI insights dashboard
(low stock, top sellers, reorder recommendation).

Installs as a Progressive Web App — add it to your phone's home screen for a
fullscreen, standalone experience, or just use it as a normal browser tab.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## What's real vs. simulated

There is no live Paytm merchant account, UPI PSP, or physical Soundbox
device wired up here — none of that is available outside a real Paytm
integration. To keep the app genuinely working end-to-end rather than a
static mockup:

- The QR code encodes a realistic `upi://pay` deep link (scannable by any
  UPI app), pointed at a placeholder merchant VPA.
- The "Simulate Payment Received" control on the QR screen stands in for the
  webhook a real Paytm integration would call when a customer actually pays.
  That's the exact point where a real webhook handler would plug in.
- Everything downstream of that — matching the payment to a pending bill,
  updating inventory, the "ask merchant" fallback when nothing matches, and
  the insights dashboard — runs on real local logic against data persisted
  in `localStorage` (no backend).

## Deploying

The app builds with a relative base path and hash-based routing
(`/#/insights` rather than `/insights`), so the same `dist/` build works
unmodified whether it's served from a domain root or a subpath like
`/Payment-hackthon/` — no separate "GitHub Pages build" needed. Hash routing
also means a deep-linked screen survives a hard refresh with zero server
config, which matters on GitHub Pages since it has no server-side rewrite
rules.

### Option A: GitHub Pages (free, no secrets needed)

`.github/workflows/deploy-pages.yml` is already set up: on every push to
`main` (or manually via the Actions tab), it builds the app and publishes
`dist/` to GitHub Pages automatically using the repo's built-in permissions
— no tokens or secrets to create.

One-time setup in the GitHub UI: **Settings → Pages → Build and
deployment → Source: "GitHub Actions"**. After that, every push to `main`
deploys, and the app is live at `https://<username>.github.io/<repo>/`.

If your default branch isn't `main`, update the `branches:` line in the
workflow file to match.

### Option B: Firebase Hosting

The repo also has `firebase.json` configured: cache headers that keep the
service worker/manifest fresh while long-caching the hashed JS/CSS bundles,
plus an SPA rewrite rule (belt-and-suspenders — hash routing means it's
rarely needed, but it's free to keep).

One-time setup:

```bash
npm install -g firebase-tools   # or just use `npx firebase-tools ...` below
firebase login                  # opens a browser to sign in to your Google account
firebase projects:create        # or reuse an existing project
firebase use --add              # link this folder to that project, creates .firebaserc
```

Then, any time you want to (re)deploy:

```bash
npm run deploy
```

That runs `npm run build` followed by `firebase deploy --only hosting`
(via `npx firebase-tools`, so you don't need it installed globally). Your
app will be live at `https://<project-id>.web.app`.

`firebase use --add` creates a `.firebaserc` file recording which Firebase
project this folder deploys to (just a project id, safe to commit). It
isn't in the repo yet since no project has been linked — commit it once you
run that command.

## Voice input

Product/bill entry uses the Web Speech API (`SpeechRecognition`) with
support for Hindi/English code-switched phrases like *"Das Maggi, bees
rupay"* (10 Maggi, ₹20) or *"2 Maggi, 1 Parle-G"*, plus a smaller Tamil
number vocabulary. Every voice screen has a type-to-enter fallback, since
Web Speech API support varies by browser (notably: no support in Firefox,
partial support in some mobile WebViews).

## Tech

React + TypeScript + Vite, Tailwind CSS, React Router, `vite-plugin-pwa`
(installable manifest + service worker), `qrcode.react`.
