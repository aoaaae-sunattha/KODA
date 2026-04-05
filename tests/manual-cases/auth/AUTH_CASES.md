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
- **Expected:** 
  - User is still logged in (Zustand persist middleware).
  - No need to re-authenticate.
- **Note:** Behavior is localStorage-based via Zustand persist; survives new tab, but NOT a new incognito session.

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

## TC-AUTH-008: Declined Card User (Negative)
- **Priority:** P1
- **User:** `declined@koda.test`
- **Steps:**
  1. Log in with `declined@koda.test`.
- **Expected:** 
  - Successful login.
  - Dashboard displays "Action Required" state for the primary card.
  - Red banner or warning visible in the header/dashboard.

## TC-AUTH-009: New User / KYC Deferred (Logic)
- **Priority:** P1
- **User:** `new@koda.test`
- **Steps:**
  1. Log in with `new@koda.test`.
- **Expected:** 
  - Successful login.
  - Dashboard shows "Unverified" state.
  - Credit limit visible but cannot be used until KYC is complete.
