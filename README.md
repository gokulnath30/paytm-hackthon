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
