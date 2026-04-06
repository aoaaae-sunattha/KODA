# Manual Test Cases: Authentication (KODA BNPL)

## TC-AUTH-001: Valid Login (Happy Path)
- **Priority:** P0
- **User:** `active@koda.test`
- **Precondition:** User is logged out.
- **Steps:**
  1. Navigate to `/login`.
  2. Enter `active@koda.test` (lowercase).
  3. Click "Log In".
- **Expected:** 
  - Redirect to `/dashboard`.
  - User name and avatar visible in header.
  - No error messages.

## TC-AUTH-002: Unknown Email (Negative)
- **Priority:** P1
- **User:** `ghost@koda.test`
- **Steps:**
  1. Navigate to `/login`.
  2. Enter `ghost@koda.test`.
  3. Click "Log In".
- **Expected:** 
  - Remains on login page.
  - Error message displayed: "No account found for this email."

## TC-AUTH-003: Email Normalization (Boundary)
- **Priority:** P2
- **User:** `  ACTIVE@KODA.TEST  `
- **Steps:**
  1. Navigate to `/login`.
  2. Enter email with leading/trailing spaces and mixed casing: `  ACTIVE@KODA.TEST  `.
  3. Click "Log In".
- **Expected:** 
  - Successful login to `/dashboard`.
  - Application logic trims and lowercases input before matching.
- **Note:** [Confirmed] `useStore.ts` login action normalizes input using `.toLowerCase().trim()`.

## TC-AUTH-004: Session Persistence (Positive)
- **Priority:** P1
- **User:** `active@koda.test`
- **Precondition:** User is logged in successfully; same browser profile (not incognito).
- **Steps:**
  1. Close the browser tab.
  2. Open a new tab and navigate to `/dashboard`.
  3. (Alternative) Stay on `/dashboard` and press F5 (page refresh).
- **Expected:** 
  - User is still logged in (Zustand persist middleware).
  - No need to re-authenticate.
  - Both new-tab navigation and page refresh restore session from localStorage.
- **Note:** Behavior is localStorage-based via Zustand persist; survives new tab and page refresh, but NOT a new incognito session.

## TC-AUTH-005: Logout Flow (Happy Path)
- **Priority:** P1
- **User:** `active@koda.test`
- **Precondition:** User is logged in and on `/dashboard`.
- **Steps:**
  1. Click the Logout button in the navigation.
- **Expected:** 
  - Redirect to `/login`.
  - Navigating back to `/dashboard` redirects user to `/login` (Auth Guard).
  - Zustand state (user object) is fully cleared (no stale user data in memory/nav).

## TC-AUTH-006: Merchant Routing (Happy Path)
- **Priority:** P1
- **User:** `merchant@koda.test`
- **Precondition:** User is logged out.
- **Steps:**
  1. Navigate to `/login`.
  2. Enter `merchant@koda.test`.
  3. Click "Log In".
- **Expected:** 
  - Successful login.
  - Automatic redirect to `/merchant` (NOT `/dashboard`).
  - Redirect logic respects the user's role defined at login.

## TC-AUTH-007: Auth Guard (Security)
- **Priority:** P0
- **User:** Guest (Logged out)
- **Steps:**
  1. Manually navigate to `/dashboard`, `/settings/cards`, or `/store` while logged out.
- **Expected:** 
  - Redirect to `/login` immediately.
  - Protected routes are inaccessible to unauthenticated users.
  - **Note:** For unauthenticated access to `/merchant` specifically, see TC-AUTH-019.

## TC-AUTH-008: Declined Card User (Negative)
- **Priority:** P1
- **User:** `declined@koda.test`
- **Steps:**
  1. Log in with `declined@koda.test`.
- **Expected:** 
  - Successful login.
  - Redirect to `/dashboard`.
  - Dashboard shows 'Action Required' state for the primary card.
  - Banner text reads: 'Payment failed on [Date] - Update Card' (per US.5 AC1).

## TC-AUTH-009: New User / KYC Deferred (Logic)
- **Priority:** P1
- **User:** `new@koda.test`
- **Steps:**
  1. Log in with `new@koda.test`.
- **Expected:** 
  - Successful login.
  - Dashboard shows "Unverified" state.
  - Credit limit visible but cannot be used until KYC is complete.
  - No KYC / ID Verify modal appears on dashboard load.
  - KYC is triggered at checkout only (see TC-KYC-001), not at login.

## TC-AUTH-010: Empty Email Submit (Boundary)
- **Priority:** P1
- **Steps:**
  1. Navigate to `/login`.
  2. Leave email field empty.
  3. Enter any password.
  4. Click "Log In".
- **Expected:** 
  - Browser-native validation tooltip appears ("Please fill out this field").
  - Form is not submitted.

## TC-AUTH-011: Empty Password Submit (Boundary)
- **Priority:** P1
- **Steps:**
  1. Navigate to `/login`.
  2. Enter valid email.
  3. Leave password field empty.
  4. Click "Log In".
- **Expected:** 
  - Browser-native validation tooltip appears.
  - Form is not submitted.

## TC-AUTH-012: Invalid Email Format (Negative)
- **Priority:** P1
- **Steps:**
  1. Navigate to `/login`.
  2. Enter "notanemail".
  3. Enter any password.
  4. Click "Log In".
- **Expected:** 
  - Browser-native validation tooltip appears (e.g., "Please include an '@' in the email address").
  - Form is not submitted.

## TC-AUTH-013: Password is not Validated (Mock Behavior)
- **Priority:** P2
- **User:** `active@koda.test`
- **Steps:**
  1. Navigate to `/login`.
  2. Enter `active@koda.test`.
  3. Enter any string as password (even whitespace).
  4. Click "Log In".
- **Expected:** 
  - Successful login to `/dashboard`.
  - Password field is present but value is not checked by mock auth logic.

## TC-AUTH-014: Demo Account Quick-Fill Button (Happy Path)
- **Priority:** P1
- **Steps:**
  1. Navigate to `/login`.
  2. Click the `active@koda.test` link in the "Demo accounts:" panel.
  3. Click "Log In".
- **Expected:** 
  - Email field is populated with `active@koda.test`.
  - Successful login to `/dashboard`.

## TC-AUTH-015: Error State Clears on Valid Re-attempt (Edge)
- **Priority:** P2
- **Steps:**
  1. Navigate to `/login`.
  2. Enter unknown email `ghost@koda.test` and click "Log In".
  3. Verify error message "No account found for this email." is displayed.
  4. Enter valid email `active@koda.test` and click "Log In".
- **Expected:** 
  - Error message disappears on new attempt.
  - Successful redirect to `/dashboard`.

## TC-AUTH-016: Overdue/Locked User Login (Happy Path)
- **Priority:** P1
- **User:** `overdue@koda.test`
- **Steps:**
  1. Log in with `overdue@koda.test`.
- **Expected:** 
  - Successful login.
  - Redirect to `/dashboard`.
  - Dashboard shows locked account state with an overdue/locked indicator visible.
  - **Note:** Auth does not block locked users — locking affects checkout and dashboard state only.

## TC-AUTH-017: RequireMerchant Guard — Non-Merchant Blocked (Security)
- **Priority:** P1
- **Precondition:** Logged in as `active@koda.test` (shopper role).
- **Steps:**
  1. Manually navigate to `/merchant`.
- **Expected:** 
  - Redirect to `/dashboard`.
  - Merchant portal is restricted to users with 'merchant' role.

## TC-AUTH-018: Already-authenticated User visits /login (Edge)
- **Priority:** P3
- **Precondition:** User is logged in.
- **Steps:**
  1. Navigate to `/login`.
- **Expected:** 
  - Login page renders normally.
  - User can see the login form while still being authenticated (no auto-redirect).
  - Potential UX gap — documented as known behavior.

## TC-AUTH-019: Unauthenticated Access to /merchant (Security)
- **Priority:** P1
- **Precondition:** User is logged out.
- **Steps:**
  1. Manually navigate to `/merchant`.
- **Expected:** 
  - Redirect to `/login` immediately. RequireMerchant checks !currentUser before role check (App.tsx:19).
- **Note:** Distinct from TC-AUTH-017 which requires being authenticated but with wrong role.

## TC-AUTH-020: Unknown Route Redirect (Wildcard Guard)
- **Priority:** P2
- **Precondition:** User is logged out.
- **Steps:**
  1. Navigate to a non-existent route (e.g., `/foobar` or `/admin`).
- **Expected:** 
  - Redirect to `/login` immediately. `App.tsx` path='*' wildcard catches all unmatched routes.

## TC-AUTH-021: Session Not Persisted in Incognito (Logic)
- **Priority:** P2
- **Precondition:** User is logged in on a normal browser window.
- **Steps:**
  1. Open a new incognito / private browsing window.
  2. Navigate to `/dashboard`.
- **Expected:** 
  - Redirect to `/login`. Zustand persist uses localStorage; incognito starts with fresh localStorage — no stored session found.

## TC-AUTH-022: Repeated Failed Login — Error Persists (Negative)
- **Priority:** P2
- **Steps:**
  1. Navigate to `/login`.
  2. Enter `ghost@koda.test`.
  3. Click "Log In".
  4. Verify error "No account found for this email." is shown.
  5. Enter `nobody@koda.test`.
  6. Click "Log In".
- **Expected:** 
  - Error message "No account found for this email." remains visible.
  - Error is not cleared between consecutive failed attempts.

## TC-AUTH-023: Deep Link to Protected Route — No Redirect-Back (Logic)
- **Priority:** P3
- **Precondition:** User is logged out.
- **Steps:**
  1. Directly navigate to `/store` or `/settings/cards` while logged out.
  2. Observe redirect to `/login`.
  3. Log in with `active@koda.test`.
- **Expected:**
  - After login, user is redirected to `/dashboard` (not the originally requested route).
  - `RequireAuth` in `App.tsx` does not preserve intended destination — no redirect-back logic implemented.
- **Note:** Known limitation. `<Navigate to="/login" replace />` (App.tsx:13) discards the original URL. Document only; not a bug.
