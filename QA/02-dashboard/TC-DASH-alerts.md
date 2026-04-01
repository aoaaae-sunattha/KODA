# TC-DASH: Account Alert Banners

## Component: Dashboard alert banners
Tests the conditional alert banners at the top of the dashboard for locked, action required, unverified, and success states.

---

### TC-DASH-10: Locked account alert
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `overdue@koda.test` | Dashboard loads |
| 2 | Observe top of page | **Red** alert banner visible |
| 3 | Verify alert title | "Account Locked" |
| 4 | Verify alert message | "Overdue payments detected. Settle them to resume shopping." |
| 5 | Verify red circle icon | AlertCircle icon present on left |
| 6 | Verify CTA button | "Pay Now" button in red |

---

### TC-DASH-11: Pay Now resolves locked state
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `overdue@koda.test` | Red "Account Locked" banner visible |
| 2 | Click "Pay Now" | Red banner animates out (shrinks + fades) |
| 3 | Observe success banner | **Green** "Payments Settled" banner appears |
| 4 | Verify success message | "Your account is now active again. Happy shopping!" |
| 5 | Wait ~3 seconds | Green success banner auto-dismisses |
| 6 | Verify order card status | Previously overdue order card no longer shows "Overdue" badge |

---

### TC-DASH-12: Action Required alert (expired card)
**Account:** `declined@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `declined@koda.test` | Dashboard loads |
| 2 | Observe top of page | **Amber/yellow** alert banner visible |
| 3 | Verify alert title | "Action Required" |
| 4 | Verify alert message | "Update your payment method to avoid service interruption." |
| 5 | Click "Update Card" button | Navigates to `/settings/cards` page |

---

### TC-DASH-13: KYC verification alert (unverified user)
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `new@koda.test` | Dashboard loads |
| 2 | Observe top of page | **Indigo/purple** alert banner visible |
| 3 | Verify alert title | "Identity Verification" |
| 4 | Verify alert message | "Complete KYC to unlock your full shopping power." |
| 5 | Click "Verify" button | IDVerifyModal opens |

---

### TC-DASH-14: KYC modal flow
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in and click "Verify" on KYC alert | Modal opens with shield icon |
| 2 | Verify modal title | "Identity Verify" |
| 3 | Verify description | Mentions "$8,000 credit limit" |
| 4 | Click "Start Verification" | Progress bar appears, "Scanning ID Document..." text |
| 5 | Wait for progress to reach 100% | Transitions to success screen with green checkmark |
| 6 | Verify success text | "Verified!" and "$8,000 credit limit" |
| 7 | Click "Go to Dashboard" | Modal closes |
| 8 | Verify KYC alert is gone | Purple alert banner no longer shown |
| 9 | Verify credit gauge updated | Available Credit now shows **$8,000** |

---

### TC-DASH-15: No alerts for healthy account
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Observe alert area | **No alert banners** visible (verified + active + card valid) |

---

### TC-DASH-16: KYC modal dismiss via backdrop
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in and click "Verify" | IDVerifyModal opens |
| 2 | Click the dark backdrop behind the modal | Modal closes |
| 3 | Verify KYC alert still present | Purple alert banner still visible (verification not completed) |
