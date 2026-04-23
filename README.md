# Badly Brewed Coffee

A complete coffee shop management system — customer ordering, barista kanban, manager analytics, admin employee management — built as a single Next.js app on SQLite.

## Stack

- **Next.js 15** (App Router) + **TypeScript strict**
- **Tailwind CSS v4** with a warm terracotta/cream/coffee theme
- **SQLite** via **Drizzle ORM** (`better-sqlite3`)
- **Auth.js v5** credentials provider with role-based middleware
- **Recharts** for analytics
- **Zustand** (with localStorage persistence) for the cart
- **Zod** for client + server validation

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:push        # create schema
pnpm db:seed        # four roles + products + 15 sample orders + refunds + promos
pnpm dev
```

Open http://localhost:3000 and sign in with one of the test accounts below.

Reset everything:
```bash
pnpm db:reset       # removes data/bbc.db, recreates schema, reseeds
```

## Test accounts

Password = username for every one:

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@test.com` | `customer` |
| Barista | `barista@test.com` | `barista` |
| Manager | `manager@test.com` | `manager` |
| Admin | `admin@test.com` | `admin` |

The landing page at `/` has one-click sign-in buttons for each role.

## What's inside

### Manager dashboard (`/dashboard`)
- KPIs: today's revenue, active orders, pending refunds, low-stock beans
- Revenue chart (last 14 days) and top sellers bar chart

### Products (`/dashboard/products`)
- Sortable, filterable table (search by name/origin/roast, filter by type)
- Add drink / add bean flows with different field sets
- Detail page with edit form, toggle availability, soft-delete (hide)

### Sales analytics (`/dashboard/analytics`)
- Date-range filter, revenue-by-day line chart
- Top 5 products bar chart, drinks-vs-beans pie
- Summary cards: total revenue, order count, avg order value

### Customers (`/dashboard/customers` + `/[id]`)
- Total accounts, new-this-month, loyalty-activated stats
- Sortable table with lifetime spend + order count
- Detail page: full order history + suspend/reactivate

### Refunds (`/dashboard/refunds`)
- Stats cards: approved count, total refunded, avg, this-month
- Date-range + reason filter
- Approve/Reject inline with audit trail

### Promotions (`/dashboard/promotions`)
- List of active codes with usage + discount-given totals
- Modal to create new codes with eligibility (all/drinks/beans)

### Employees (`/dashboard/employees` — admin only)
- Create staff with temp password
- Suspend / reactivate / remove

### Customer shop (`/shop`)
- Menu browse with drink cards (milk selector: whole/oat/almond/skim) and bean cards
- Cart with line-item quantities, milk swaps, promo code verification
- Order history with status (`/shop/orders`) + per-item refund requests

### Barista kanban (`/barista`)
- Four columns: Pending → In progress → Ready → Collected
- Today / Last-7-days filter
- One-click advance button on each card

## Key decisions

- **Credentials auth, bcrypt hashes** — simplest path for a self-contained demo; a real deployment would bolt on an external IdP.
- **Soft-delete products** (toggle `availability` to `false`) to keep historical order rows joinable.
- **Audit log table** (`audit_logs`) written on every manager/admin mutation.
- **Promo verification** is a separate GET endpoint so the cart can validate without placing the order.
- **`dynamic = "force-dynamic"`** on dashboard + shop pages because they all depend on live DB reads tied to the session.
- **Zustand + persist** for the cart instead of a server-side one — no login friction for browsing, and no wasted DB writes.
- **No image uploads** — products accept an image URL. The seed uses Unsplash links so the menu looks alive out of the box.

## Scripts

| Command | What it does |
|--|--|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm db:push` | Apply Drizzle schema to `data/bbc.db` |
| `pnpm db:seed` | Wipe & reseed the database |
| `pnpm db:reset` | `rm data/bbc.db` + push + seed |

## Project layout

```
src/
  app/
    (root)             landing, signin
    dashboard/         manager + admin, sidebar layout
      products, promotions, analytics, customers, refunds, employees
    shop/              customer: menu, cart, orders
    barista/           kanban board
    api/               route handlers (products, orders, refunds, promos, employees)
  components/          sidebar, topbar, charts, ui primitives
  lib/
    db/                drizzle schema, client, seed-helpers
    auth.ts            Auth.js config + requireRole guard
    queries.ts         dashboard aggregations
    validators.ts      zod schemas shared by client + server
    cart-store.ts      zustand cart
    utils.ts           GBP/date formatters
  middleware.ts        role-based routing
scripts/
  seed.ts              deterministic-ish seed with 4 users, 10 products, 15 orders
```
