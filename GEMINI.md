# GEMINI.md

This file provides instructional context for Gemini CLI when working with the **Anyway** BNPL mockup project.

## Project Overview

**Anyway** is a high-fidelity Buy Now, Pay Later (BNPL) solution mockup. It is an interview-ready prototype designed to demonstrate core fintech features including purchase slicing, repayment progress, refund reconciliation, and risk-based account states.

### Core Technologies
- **Frontend Framework:** React 19 (Vite 8, TypeScript 5.9)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion 12
- **State Management:** Zustand 5
- **Routing:** React Router 7
- **Icons:** Lucide React

## Project Structure

- `app/` — Main React application.
  - `src/components/` — Feature-specific UI components (dashboard, checkout, etc.).
  - `src/pages/` — Main view routes.
  - `src/store/` — Zustand store for global state management.
  - `src/data/` — Mock data (seed orders, users).
- `Epic/` — Product epics and high-level goals.
- `Spec/` — Technical implementation specifications and business logic.
- `UserStories/` — Prioritized user stories with acceptance criteria.
- `tasks.md` — Master task plan and build order.
- `screens.md` — Complete inventory of UI routes, modals, and states.
- `account.check.md` — Predefined mock account scenarios for demo/testing.
- `CLAUDE.md` — Specialized guidance for Claude Code.

## Building and Running

Commands should be executed from the `app/` directory:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Development Conventions

- **Priority Order:** Follow the phases in `tasks.md`. Start with Foundation (Phase 1), Merchant Storefront (Phase 1.5), and Dashboard (Phase 2).
- **Mock Auth:** Authentication is email-only (password is ignored). Emails correspond to scenarios in `account.check.md` (e.g., `active@anyway.test`, `overdue@anyway.test`).
- **Business Logic:**
  - **Slicing:** 4 (Interest-free) to 24 terms.
  - **Fees:** One-time fees added to the first installment for extended terms.
  - **Refunds:** Subtract from the last installment first (backward reconciliation).
  - **Account States:** `Active`, `Locked` (overdue), `Action Required` (declined card), `Unverified` (KYC pending).
- **Design Tokens:**
  - Primary Purple: `#5D5FEF`
  - Success Green: `#3EB489`
  - Background (Cream): `#F5F0EC`
  - Surface: White
- **Animation:** Use Framer Motion for progress bar fills, number counters, and modal transitions.

## Verification Requirements

- **KYC Logic:** All checkouts must block if `user.verified` is false.
- **Credit Logic:** Item price must be checked against `availableCredit` (Limit - Used).
- **Locked State:** Accounts with overdue payments must receive a 403 response/state on checkout attempts.
- **Responsive Design:** Mobile-first approach (375px breakpoint).
