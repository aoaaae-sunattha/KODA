# TC-DASH: Animations & Transitions

## Tests for Phase 8 animation polish on the dashboard.

---

### TC-DASH-27: Page load stagger animation
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Observe page entrance | Elements fade in and slide up (opacity 0->1, y: 20->0) |
| 3 | Observe stagger timing | Each section appears ~100ms after the previous (alerts -> gauge -> orders) |

---

### TC-DASH-28: Credit counter animation
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Dashboard loads |
| 2 | Observe "Available Credit" number | Counts up from $0 to $7,750 (animated ~0.8s) |
| 3 | Observe "used" number | Counts up from $0 to $2,250 (animated) |
| 4 | Pay an installment | Both counters animate to new values (not instant jump) |

---

### TC-DASH-29: Progress bar spring animation
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Order cards load |
| 2 | Observe progress bars | Green segments animate from width 0 to their target width |
| 3 | Pay an installment | Green segment grows with smooth animation |

---

### TC-DASH-30: Alert banner exit animation
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `overdue@koda.test` | Red locked banner visible |
| 2 | Click "Pay Now" | Red banner shrinks (height -> 0), fades out, scales down |
| 3 | Green success banner enters | Animates in (scale 0.95 -> 1, opacity 0 -> 1) |
| 4 | After ~3 seconds | Success banner exits with same shrink animation |

---

### TC-DASH-31: Order card layout animation
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Order cards animate in (staggered, scale 0.95 -> 1) |
| 2 | Pay all installments on one order | Card exits with scale-down animation |
| 3 | Remaining cards reflow | Cards smoothly reposition (layout animation) |

---

### TC-DASH-32: Page transition animation
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | From dashboard, click "Shop" in nav | Dashboard fades out + slides up (y: 0 -> -10) |
| 2 | Store page enters | Fades in + slides down (y: 10 -> 0), duration ~0.3s |
| 3 | Click back to "Dashboard" | Same transition pattern |
