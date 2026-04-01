# design-reference.md — KODA BNPL: Visual & UX Reference

Ground truth for all UI decisions. Sources: live Anyday.io observation + industry BNPL patterns.

---

## Color Tokens (Confirmed from live site)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#5D5FEF` | Buttons, active states, links, progress fill |
| `primary-light` | `#E8E8FD` | Button hover bg, disabled pill bg tint |
| `secondary` | `#3EB489` | Success states, "paid" segment, checkmarks |
| `background` | `#F5F0EC` | App background (warm cream — confirmed) |
| `surface` | `#FFFFFF` | Cards, modals, nav bar |
| `text-primary` | `#1A1A2E` | Headings, primary labels |
| `text-secondary` | `#6B7280` | Subtext, legal disclaimer |
| `error` | `#EF4444` | Locked account, overdue, declined states |
| `warning` | `#F59E0B` | Near-limit, action required states |
| `refunded` | `#F97316` | Refunded segment on progress bar |
| `border` | `#E5E7EB` | Card borders, input borders |

---

## Typography

| Element | Size | Weight | Notes |
|---|---|---|---|
| Page title | 24px | 700 | Dashboard heading |
| Card title | 16px | 600 | Merchant name on order card |
| Amount (large) | 28–32px | 700 | Monthly payment in plan selector |
| Amount (normal) | 16px | 600 | Order totals on cards |
| Label | 12px | 500 | "Monthly payment", "One-time fee" |
| Legal text | 11px | 400 | Disclaimer below plan selector |
| Badge | 11px | 600 | "Free", "Most Flexible", status pills |

Font: **Inter** (system fallback: `-apple-system, sans-serif`)

---

## Spacing & Shape (Confirmed from live site)

| Element | Value |
|---|---|
| Card border-radius | `12px` |
| Button border-radius | `8px` |
| Pill/badge border-radius | `999px` (full round) |
| Card padding | `24px` |
| Card shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| Term button size | `~48px × 48px` |
| Gap between cards | `16px` |

---

## Plan Selector (Confirmed from live site)

```
┌─────────────────────────────────────────────┐
│  $5,000                                      │
│  ━━●━━━━━━━━━━━━━━━━━━━━━━━━━━  $100,000   │
│                                              │
│  Payments                                    │
│  [4] [6] [8] [10] [12̶] [1̶8̶] [2̶4̶]            │
│  (disabled terms shown in muted gray)        │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  4 payments                          │   │
│  │  Monthly      One-time fee   Total   │   │
│  │  $1,250       $0 [Free]      $5,000  │   │
│  │                                      │   │
│  │  Legal disclaimer text (11px gray)   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

- Active term button: `bg #5D5FEF`, white text, no border
- Available term button: white bg, `1.5px solid #E0DDF5`, purple text
- Disabled term button: `bg #F0EEF8`, muted text, `cursor: not-allowed`
- "Free" badge: `bg #5D5FEF`, white text, `border-radius: 999px`, inline next to "$0"
- Result card: `bg #F5F5F8` (slightly off-white), rounded `8px`

---

## Dashboard Layout (Industry Reference — Klarna / Affirm patterns)

```
┌────────────────────────────────────┐
│  🅐  KODA          [Avatar]      │  ← Top nav
├────────────────────────────────────┤
│  Credit Available                  │
│  ████████████░░░░  $7,750 / $10k  │  ← Credit gauge
├────────────────────────────────────┤
│  Active Orders (2)                 │
│  ┌──────────────────────────────┐  │
│  │ [Logo] Sinnerup    $1,000    │  │
│  │ Apr 1  ████░░░░░░  25%       │  │  ← Order card
│  │ [Pay Next $250]   [Refund]   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [Logo] Åberg       $2,400    │  │
│  │ Apr 1  ░░░░░░░░░░   0%       │  │
│  │ [Pay First $496]             │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Completed (1)   ▼ (collapsed)     │
└────────────────────────────────────┘
```

### Order Card anatomy
```
┌──────────────────────────────────────────┐
│ [Merchant Logo]  Merchant Name  $1,000   │
│ Purchased: Mar 15, 2026  •  4 payments  │
│                                          │
│ [████████░░░░░░░░░░░░]  1 of 4 paid     │
│  $250 paid    $750 remaining             │
│                                          │
│ Next: $250 on Apr 15     [Pay Now]       │
└──────────────────────────────────────────┘
```

Progress bar segments (left to right):
- Green = paid installments
- Orange = refunded amount (if any)
- Blue-gray = remaining installments

---

## Key UX Patterns (Industry Standard BNPL)

| Pattern | Implementation |
|---|---|
| First payment = today | Always shown as "Today" not a date |
| Fee transparency | Show fee separately, never bury it in monthly amount |
| Progress = installments not % | Show "2 of 6 paid" alongside the bar |
| Refund = reduces debt, not cash back | Show as orange segment reducing remaining |
| Locked = hard stop | Overlay checkout entirely, not just a warning |
| Plan switch = instant recalc | No confirm step — live update as user taps |

---

## What We Could NOT Confirm (not observable without login)

- Exact dashboard layout / card ordering
- Navigation bottom bar vs. top nav on mobile app
- Notification/alert banner exact styling
- Order history / completed orders display
- Profile / account settings screens
- Exact merchant logo display format (circle crop? rectangle?)

**Decision:** Use Klarna/Affirm/Afterpay dashboard patterns for the above. They are industry standard and interviewers will recognise them as credible.
