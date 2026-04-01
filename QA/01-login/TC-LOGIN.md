# TC-LOGIN: Authentication

## Route: `/login`
Tests mock login, account routing, and auth guards.

**Relevant specs:**
- `Spec/ImplementationSpecs.md` -- Priority 1.5: Pre-Checkout Validation (KYC, Lock, Credit checks)
- `UserStories/UserStories.md` -- US.1.5 (Browse & Select Products, AC2: validate KYC/credit before checkout)
- `account.check.md` -- 8 mock accounts with predefined states
- `screens.md` -- Login route, auth gate behavior

---

### TC-LOGIN-01: Login page renders correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page loads on cream background (#F5F0EC) |
| 2 | Verify logo | "-Koda" in purple (#5D5FEF) |
| 3 | Verify tagline | "Buy Now, Pay Later" below logo |
| 4 | Verify form fields | Email field (placeholder: `active@koda.test`) + Password field (placeholder: "Any password works") |
| 5 | Verify login button | Purple "Log in" button |
| 6 | Verify demo accounts section | "Demo accounts:" label with shortcut links |

---

### TC-LOGIN-02: Successful login with valid email
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `active@koda.test` in email field | Email accepted |
| 2 | Enter any password (e.g., "test") | Password field accepts input |
| 3 | Click "Log in" | Redirects to `/dashboard` |
| 4 | Verify user name in nav bar | Shows "Alex Johnson" + "active" status |

---

### TC-LOGIN-03: Login with each mock account
Repeat for all 8 accounts. Verify correct routing and initial visual:

| Email | Expected Destination | Key Visual |
|-------|---------------------|------------|
| `active@koda.test` | `/dashboard` | 3 order cards, credit gauge at 22% |
| `new@koda.test` | `/dashboard` | KYC alert + empty state + $0 credit |
| `fresh@koda.test` | `/dashboard` | Empty orders + $8,000 credit |
| `overdue@koda.test` | `/dashboard` | Red "Account Locked" banner |
| `declined@koda.test` | `/dashboard` | Amber "Action Required" banner |
| `maxed@koda.test` | `/dashboard` | Credit gauge at 99%, red fill |
| `power@koda.test` | `/dashboard` | 4 orders (2 active + 2 completed), 2 cards |
| `merchant@koda.test` | `/merchant` | Settlement table with "KODA.merchant" nav |

---

### TC-LOGIN-04: Invalid email (not in mock data)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `unknown@test.com` in email | Email entered |
| 2 | Enter any password and submit | Login fails |
| 3 | Verify error message | Red text: **"No account found for this email."** |
| 4 | Verify user stays on `/login` | No redirect, form still visible |

---

### TC-LOGIN-05: Login is case-insensitive and trims whitespace

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `  Active@KODA.test  ` (mixed case + spaces) | Email entered |
| 2 | Enter any password and submit | Login succeeds |
| 3 | Redirected to `/dashboard` | Active user dashboard loads correctly |

---

### TC-LOGIN-06: Empty password blocks form submission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `active@koda.test` in email | Email entered |
| 2 | Leave password field empty | Password field blank |
| 3 | Click "Log in" | Form does not submit (HTML `required` validation) |
| 4 | Enter any single character as password | Password field has content |
| 5 | Click "Log in" | Login succeeds, redirects to `/dashboard` |

---

### TC-LOGIN-07: Demo account shortcuts
**Note:** Only 4 of the 8 accounts are shown as shortcuts.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Demo accounts section visible |
| 2 | Verify listed shortcuts | Exactly 4 shown: `active@koda.test`, `overdue@koda.test`, `declined@koda.test`, `merchant@koda.test` |
| 3 | Click `active@koda.test` shortcut | Email field auto-fills with `active@koda.test` (does **not** auto-login) |
| 4 | Verify password still required | Must enter a password and click "Log in" to proceed |
| 5 | Click `merchant@koda.test` shortcut | Email field updates to `merchant@koda.test` |

---

### TC-LOGIN-08: Auth guard -- unauthenticated access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Without logging in, navigate to `/dashboard` | Redirected to `/login` |
| 2 | Navigate to `/store` | Redirected to `/login` |
| 3 | Navigate to `/settings/cards` | Redirected to `/login` |
| 4 | Navigate to `/merchant` | Redirected to `/login` |

---

### TC-LOGIN-09: Merchant role routing guard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `active@koda.test` (shopper) | Dashboard loads |
| 2 | Manually navigate to `/merchant` | Redirected to `/dashboard` (RequireMerchant checks role) |
| 3 | Log out, log in as `merchant@koda.test` | Merchant portal loads at `/merchant` |

> **Known behavior:** Merchant users CAN access `/dashboard` and other shopper routes -- `RequireAuth` only checks if logged in, not role. This may be intentional for the mockup but differs from `screens.md` which implies role-based separation.

---

### TC-LOGIN-10: Logout clears session

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with any account | Dashboard/merchant loads |
| 2 | Click logout button (LogOut icon in nav) | Redirected to `/login` |
| 3 | Try navigating to `/dashboard` | Redirected to `/login` (session cleared) |
| 4 | Navigate to `/store` | Redirected to `/login` |
| 5 | Log in again with a different account | New account's data loads correctly (no bleed from previous session) |

---

### TC-LOGIN-11: Unknown routes redirect to login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/nonexistent` | Redirected to `/login` |
| 2 | Navigate to `/admin` | Redirected to `/login` |
| 3 | Navigate to `/api/checkout` | Redirected to `/login` |

---

### TC-LOGIN-12: Input field focus styling

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click into email field | Border color changes to purple (#5D5FEF) |
| 2 | Click away from email field | Border returns to gray (#E5E7EB) |
| 3 | Click into password field | Border color changes to purple |
| 4 | Click away | Border returns to gray |

---

### BUG-LOGIN-01: No auto-redirect when already logged in

**Severity:** Low (cosmetic for mockup)
**Source:** `screens.md` line 12 states "Redirects to `/dashboard` if already logged in"
**Actual behavior:** No such redirect exists in `Login.tsx` or `App.tsx`. A logged-in user can visit `/login` and see the login form again.
**Steps to reproduce:**

| Step | Action | Expected Result | Actual Result |
|------|--------|-----------------|---------------|
| 1 | Log in as `active@koda.test` | Dashboard loads | Dashboard loads |
| 2 | Manually navigate to `/login` | Should redirect to `/dashboard` | Shows login page again |
