# TC-LOGIN: Authentication

## Route: `/login`
Tests mock login, account routing, and auth guards.

---

### TC-LOGIN-01: Successful login with valid email
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Enter `active@koda.test` in email field | Email accepted |
| 3 | Enter any password (e.g., "test") | Password field accepts input |
| 4 | Click login / submit | Redirects to `/dashboard` |
| 5 | Verify user name in nav bar | Shows user name + "active" status |

---

### TC-LOGIN-02: Login with each mock account
Repeat for all 8 accounts. Verify correct routing:

| Email | Expected Destination | Key Visual |
|-------|---------------------|------------|
| `active@koda.test` | `/dashboard` | 3 order cards |
| `new@koda.test` | `/dashboard` | KYC alert + empty state |
| `fresh@koda.test` | `/dashboard` | Empty orders + $8,000 credit |
| `overdue@koda.test` | `/dashboard` | Red locked banner |
| `declined@koda.test` | `/dashboard` | Amber action required banner |
| `maxed@koda.test` | `/dashboard` | Credit gauge at 99% |
| `power@koda.test` | `/dashboard` | 4 orders (2 active + 2 completed) |
| `merchant@koda.test` | `/merchant` | Settlement table |

---

### TC-LOGIN-03: Invalid email (not in mock data)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `unknown@test.com` | Email entered |
| 2 | Submit form | Login fails, error message shown |
| 3 | User stays on `/login` | No redirect |

---

### TC-LOGIN-04: Demo account shortcuts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page loads |
| 2 | Check for quick-login shortcuts | Shortcut buttons/links for demo accounts visible |
| 3 | Click a shortcut | Auto-fills email and logs in |

---

### TC-LOGIN-05: Auth guard - unauthenticated access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Without logging in, navigate to `/dashboard` | Redirected to `/login` |
| 2 | Navigate to `/store` | Redirected to `/login` |
| 3 | Navigate to `/settings/cards` | Redirected to `/login` |
| 4 | Navigate to `/merchant` | Redirected to `/login` |

---

### TC-LOGIN-06: Merchant role routing guard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `active@koda.test` (shopper) | Dashboard loads |
| 2 | Manually navigate to `/merchant` | Redirected away (not a merchant) |
| 3 | Log out, log in as `merchant@koda.test` | Merchant portal loads |
| 4 | Verify merchant cannot access `/dashboard` | Redirected to `/merchant` |

---

### TC-LOGIN-07: Logout

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with any account | Dashboard/merchant loads |
| 2 | Click logout button (LogOut icon in nav) | Redirected to `/login` |
| 3 | Try navigating to `/dashboard` | Redirected to `/login` (session cleared) |

---

### TC-LOGIN-08: Unknown routes

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/nonexistent` | Redirected to `/login` |
| 2 | Navigate to `/admin` | Redirected to `/login` |
