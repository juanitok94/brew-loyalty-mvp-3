# Brew Loyalty MVP — Claude Context

## Overview

Brew Loyalty is a production-ready multi-tenant loyalty stamp card platform for independent coffee shops, built by Peachy Kean DevOps LLC.

Customers:
- Enter a phone number (no app required)
- Receive a digital loyalty card
- Show a QR code at the counter

Baristas:
- Look up customers by last 4 digits of phone (primary) or full phone
- Add stamps
- Remove incorrect stamps (correction)
- Redeem rewards

---

## Tech Stack

- Next.js (App Router, TypeScript)
- Supabase (Postgres) — **migration from JSON flat file complete; Supabase is the live data layer**
- Vercel (deployment)
- No Supabase Auth
- Server-side DB access only (service role key)

---

## Route Map

| URL | File | Purpose |
|-----|------|---------|
| `/` | `src/app/page.tsx` | Customer phone entry |
| `/card` | `src/app/card/page.tsx` | Customer stamp card view |
| `/admin` | `src/app/admin/page.tsx` | Admin token verification gate |
| `/admin/customer` | `src/app/admin/customer/page.tsx` | Barista dashboard — lookup, stamp, redeem |
| `/qr` | `src/app/qr/page.tsx` | Printable QR code for counter |

API routes live under `src/app/api/admin/` (stamp, remove-stamp, redeem, lookup, lookup-last4, verify) and `src/app/api/stamps/`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/config/shop.ts` | **Single source of truth for all shop-specific values** — name, tagline, logo, colors, copy, stamp target |
| `src/lib/stamps.ts` | Data access layer — all Supabase reads/writes for loyalty logic |
| `src/lib/auth.ts` | Admin token verification (`SHOP_ADMIN_TOKEN` env var) |
| `src/lib/db.ts` | Supabase client (server-only, service role) |
| `src/lib/constants.ts` | Re-exports `STAMPS_REQUIRED` from `shopConfig.stampsRequired` |

---

## Shop Config Pattern

All hardcoded shop values were moved to `src/config/shop.ts`. To swap branding:
1. Edit `shopConfig` in that file — name, logo path, colors, copy, stamp target
2. Drop the new logo in `/public/`
3. Update `NEXT_PUBLIC_SHOP_SLUG` env var in Vercel to match the `shops` table row
4. No other files need to change

CSS custom properties (`--background`, `--brown`, etc.) are injected from `shopConfig.colors` via inline style on `<html>` in `src/app/layout.tsx`. There are no hardcoded hex values in `globals.css`.

---

## Core Data Model

### shops
| Column | Notes |
|---|---|
| id | |
| slug | URL-safe shop identifier (e.g. `rowan-coffee`) |
| name | Display name |
| stamps_required | Stamp goal per reward cycle |

### customers
| Column | Notes |
|---|---|
| id | |
| phone | Normalized E.164 format |

### loyalty_cards
| Column | Notes |
|---|---|
| id | |
| shop_id | FK → shops |
| customer_id | FK → customers |
| stamp_count | Current derived state |
| reward_count | Lifetime redemptions |
| last_stamp_at | |

### stamp_events (append-only ledger)
| Column | Notes |
|---|---|
| id | |
| shop_id | FK → shops |
| customer_id | FK → customers |
| loyalty_card_id | FK → loyalty_cards |
| event_type | `stamp_added`, `stamp_removed`, `reward_redeemed` |
| stamp_delta | +1, -1, or 0 |
| note | e.g. `admin_correction` |
| created_at | |

### Key relationships
- Customer ↔ shop via `loyalty_cards`
- `loyalty_cards` holds current state (`stamp_count`)
- `stamp_events` is the source of truth for audit and history
- **Multi-tenancy is enforced via `shop_id` on every `loyalty_cards` and `stamp_events` row — never query without scoping to a shop**

---

## Core Business Logic

### addStamp(phone, shopId)
- Increments `stamp_count` by 1
- Logs event: `event_type = "stamp_added"`, `stamp_delta = +1`

### removeStamp(phone, shopId)
- Decrements `stamp_count` by 1, floor 0
- Logs event: `event_type = "stamp_added"`, `stamp_delta = -1`, `note = "admin_correction"`

### redeemReward(phone, shopId)
- Resets `stamp_count` to 0
- Increments `reward_count`
- Logs event: `event_type = "reward_redeemed"`

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Service role key — server-only, never expose to client |
| `NEXT_PUBLIC_SHOP_SLUG` | Shop slug matching `shops` table (e.g. `rowan-coffee`) |
| `SHOP_ADMIN_TOKEN` | Secret token for barista login link |

---

## DO NOT Touch

- `design-system/` — Rowan-owned design assets, out of scope for all code changes
- `docs/` — documentation only, no app logic here

---

## Constraints (non-negotiable)

- Do NOT redesign architecture
- Prefer minimal, surgical changes
- Do NOT introduce Supabase Auth
- Do NOT expose DB or service role key to client
- Maintain production stability
- Do NOT query across tenants — always scope to `shop_id`

---

## Current Status

- Fully working in production (Rowan Coffee — active tenant)
- Supabase migration complete — JSON flat file no longer in use
- Multi-tenant schema live (`shop_id` scoping on all loyalty tables)
- All shop-specific values centralized in `src/config/shop.ts`
- Admin uses last-4-digit lookup as primary flow; full phone as fallback

---

## Expectations for Claude

- Read the relevant files before editing
- Make minimal, surgical changes only
- Preserve all working flows
- Always scope DB queries to `shop_id`
- Avoid touching unrelated components
- Do not touch `design-system/` for any reason
- If unsure, inspect the repo and infer — do not guess

---

## Execution Model

- Implementation is driven by SESSION-BRIEF.md (generated fresh each sprint)
- Claude Code executes only from SESSION-BRIEF
- Do not infer beyond the brief
- Stop and ask if anything is ambiguous

---

## Definition of Done

- Acceptance tests in SESSION-BRIEF pass
- DECISIONS.md updated if a locked decision changed
- Feature verified in preview or production
- Claude + ChatGPT review complete
- Juan signs off

---

## Project State — April 2026

Three live loyalty card apps (Odds Cafe, Rowan Coffee, Dynamite Roasting) — repos brew-loyalty-mvp, brew-loyalty-mvp-2, brew-loyalty-mvp-3. Shared Supabase database, separate repos. Each shop has one admin who stamps by entering last 4 digits of customer phone. Onboarding = clone repo + config swap. More shops coming (Bad Manners, Press). No payment layer yet. Odds is live with customers, Rowan and Dynamite launching soon.
