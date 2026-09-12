# PayBasket — Your AI Store Partner

Mobile- and tablet-first PWA for kirana merchants, built around two AI agents:
a **Store Manager** (products, stock, insights) and **Sales & Billing**
(listen to the customer, build the bill, take payment, update stock).

Powered by Phinite × Paytm.

## Status: UI layer, ready for API integration

All 12 screens are built and responsive. Every value currently shown comes
from a single mock module — **`src/lib/mockData.ts`** — so wiring the Phinite
AI API means replacing those exports with real calls and leaving the screens
untouched. Nothing is hardcoded inside a component.

## Screens

| # | Screen | Route |
|---|--------|-------|
| 1 | Splash | `/` |
| 2 | Login | `/login` |
| 3 | Home / Dashboard | `/home` |
| 4 | Agent Selection | `/assistants` |
| 5 | Store Manager Chat | `/chat/store-manager` |
| 6 | Add Product (Voice) | `/add-product` |
| 7 | Product Details | `/product/:productId` |
| 8 | Inventory | `/inventory` |
| 9 | Sales & Billing | `/chat/sales` |
| 10 | Payment | `/payment` |
| 11 | Transaction Success | `/payment/success` |
| 12 | Business Insights | `/insights` |

## Responsive behaviour

One shell (`src/components/AppShell.tsx`) drives every screen:

- **Phone (< 768px)** — full-bleed single column, bottom tab bar
  (Home · Products · Sales · Insights · More), safe-area padding for notches.
- **Tablet (≥ 768px)** — the bottom bar is replaced by a persistent left nav
  rail; content gets a comfortable max-width instead of stretching.
- **Tablet landscape / desktop (≥ 1024px)** — screens with a natural split go
  two-column (Product Details, Sales & Billing, Inventory), stat grids go 4-up.

Verified at 390×844, 768×1024 and 1024×768: no console errors and no
horizontal overflow on any of the 12 routes.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build
```

## Integrating the Phinite AI API

Start in `src/lib/mockData.ts`. Each export maps to one part of the UI:

- `store`, `dashboardStats`, `dashboardCounts` → Dashboard
- `products`, `inventoryFilters` → Inventory + Product Details
- `storeManagerThread` → Store Manager chat
- `salesSession`, `initialCart` → Sales & Billing
- `payment` → Payment + Transaction Success
- `insightsStats`, `topSelling`, `lowStockAlert` → Business Insights

Product images are currently emoji placeholders rendered by the `Thumb`
component (`src/components/ui.tsx`) — swap that for an `<img>` once the API
supplies image URLs.

## Deploying

Built with a relative base path and hash routing, so the same `dist/` works
from a domain root or a subpath. `.github/workflows/deploy-pages.yml` publishes
to GitHub Pages on every push to the default branch; `firebase.json` is set up
as an alternative (`npm run deploy`).

Live: https://gokulnath30.github.io/paytm-hackthon/
