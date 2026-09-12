# PayBasket — Your AI Store Partner

Mobile- and tablet-first PWA for kirana merchants, built around two AI agents:
a **Store Manager** (products, stock, insights) and **Sales & Billing**
(listen to the customer, build the bill, take payment, update stock).

Powered by Phinite × Paytm.

## Status: wired to the PayBasket API

All 12 screens read and write through `src/lib/api/`, which speaks the
collections and endpoints in the PayBasket Integration Guide. With no
configuration the app runs on mock data exactly as before, so `npm run dev`
still gives you a working demo out of the box.

## Data sources

One repository interface, three transports, chosen at load from the env:

| Mode | Trigger | What it does |
|------|---------|--------------|
| `proxy` | `VITE_API_BASE` set | Calls your backend, which holds the Firebase secret. The shape the guide recommends. |
| `direct` | `VITE_FIREBASE_DB_URL` set | Realtime Database REST straight from the browser. **Demo only** — see below. |
| `mock` | neither set | `src/lib/mockData.ts`, shaped into PayBasket records. Sales still run end to end, in memory. |

Copy `.env.example` to `.env.local` to configure. Nothing else in the app knows
which transport it got.

> **The database secret is a root password.** `FIREBASE_DB_SECRET` grants full
> read and write over every collection and bypasses security rules. Anything
> shipped to a browser can be read out of it. `direct` mode exists so a demo can
> run before the backend does — never set `VITE_FIREBASE_DB_SECRET` for a build
> you deploy.

## The seven collections

Typed in `src/lib/api/types.ts`, exactly as stored:

| Path | Keyed by | Holds |
|------|----------|-------|
| `/products` | `product_id` | Catalogue: prices, stock, reorder level |
| `/inventory_movements` | `movement_id` | Append-only audit trail of stock changes |
| `/customer_sessions` | `session_id` | One per customer visit — keeps baskets apart |
| `/orders` | `order_id` | Cart, totals, lifecycle status |
| `/payments` | `payment_id` | Incoming payments, matched and unmatched |
| `/sales` | `sale_id` | Per-line ledger with realised profit |
| `/approvals` | `approval_id` | Anything awaiting the owner's decision |

## Wiring the backend

`proxy` mode expects these. The first six are the guide's own list; the rest are
what a POS front end needs on top of it.

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/products` | Product records |
| `GET` | `/api/products/:id` | One product, or `null` |
| `GET` | `/api/sessions/active` | Sessions at the counter now |
| `GET` | `/api/orders/:id` | One order with its items |
| `GET` | `/api/approvals?status=pending` | The owner's inbox |
| `POST` | `/api/chat` | `{ message, session_id, role }` → the agent's reply |
| `PUT` | `/api/products/:id` | Create or replace a product |
| `GET` | `/api/sales` | Sale rows, for the rollups |
| `GET` | `/api/sessions` | All sessions, for "customers today" |
| `POST` | `/api/sessions` | Opens a session |
| `POST` | `/api/orders` | `{ session_id, items }` → the created order |
| `POST` | `/api/payments` | Records a payment against an order |
| `POST` | `/api/orders/:id/complete` | Step 06: stock cut, sale rows, `COMPLETED` |
| `GET` | `/api/dashboard/today` | Optional rollup — derived client-side if it 404s |
| `GET` | `/api/insights?range=` | Optional rollup — same fallback |

Your backend is also where the Paytm webhook lands (`POST
/api/payments/webhook`). Verify the provider's signature there before writing a
payment row: an unverified endpoint lets anyone mark an order paid and walk out
with the stock.

## Order lifecycle

`NEW → CART_CREATED → WAITING_FOR_PAYMENT → PAYMENT_RECEIVED → RECONCILED →
COMPLETED`, with `NEEDS_CLARIFICATION`, `PAYMENT_MISMATCH`,
`UNMATCHED_PAYMENT`, `NEEDS_OWNER_APPROVAL`, `CANCELLED` and `REFUNDED` breaking
out of it.

Generating a bill writes the order and stops. Stock is cut and the sale row
written only at `COMPLETED` — so revenue counted before then would be
overstated. The Payment screen watches the order rather than the payment,
because the webhook lands on your backend, not in the browser; the waiting card
doubles as a manual confirmation for cash or a demo with no webhook wired up.

Once the graph is deployed, completion is the assistant's job and `proxy` mode
just forwards to it. The `direct` and `mock` transports stand in for it so a sale
can finish locally.

## The assistant

`POST /api/chat` through your backend, or the trigger URL from the Phinite
Deploy screen directly (`VITE_AGENT_CHAT_URL`). A graph with no published build
has no chat URL — Build, then Deploy, and the endpoint appears on that screen.

Every message in one visit carries the same `session_id`, which is what keeps two
shoppers at the counter from sharing a basket, and `role` (`owner` / `customer`),
which is what routes the message to the right specialist. Both are attached in
`src/lib/api/index.ts`; the screens just pass text.

## Screens

| # | Screen | Route | Reads |
|---|--------|-------|-------|
| 1 | Splash | `/` | — |
| 2 | Login | `/login` | — |
| 3 | Home / Dashboard | `/home` | Today's rollup |
| 4 | Agent Selection | `/assistants` | — |
| 5 | Store Manager Chat | `/chat/store-manager` | Agent (`owner`) |
| 6 | Add Product | `/add-product` | Writes `/products`; agent dock |
| 7 | Product Details | `/product/:productId` | One product |
| 8 | Inventory | `/inventory` | `/products` |
| 9 | Sales & Billing | `/chat/sales` | `/products`; writes an order |
| 10 | Payment | `/payment?order=` | One order; records payment |
| 11 | Transaction Success | `/payment/success?order=` | One order |
| 12 | Business Insights | `/insights` | Rollup by range |

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

## Things the data model will bite you with

- **Writing `null` deletes.** In Realtime Database, setting a key to `null`
  removes it. Read defensively: `p.brand ?? '—'`.
- **There is no `WHERE`.** Every filter and rollup here fetches the collection
  and works in code — correct at kirana volumes, worth revisiting at tens of
  thousands of rows.
- **Stock is not auto-derived.** A movement, a sale row and the stock cut are
  three separate writes; skip one and the ledger drifts.
- **Two writers, no locking.** The agent and this app can both write a product.
  Prefer PATCH over PUT for single-field edits, and let the agent own stock
  decrements during a sale.

## Deploying

Built with a relative base path and hash routing, so the same `dist/` works
from a domain root or a subpath. `.github/workflows/deploy-pages.yml` publishes
to GitHub Pages on every push to the default branch; `firebase.json` is set up
as an alternative (`npm run deploy`).

Live: https://gokulnath30.github.io/paytm-hackthon/
