# Phase 8.5 — Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align 3 UI features (Plan Selector, Payment Timeline, Flexible Payments) with anyday.io production design.

**Architecture:** Redesign PlanSelector and PaymentTimeline as vertical card-based layouts. Add a new PaymentModal component with 3 payment type radio options backed by 2 new Zustand store actions (`paySpecificAmount`, `payFullBalance`). TDD — tests first, implementation second.

**Tech Stack:** React 19, TypeScript, Zustand, Framer Motion, Tailwind CSS v4, Vitest, Playwright

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/src/store/useStore.ts` | Add `paySpecificAmount` and `payFullBalance` actions |
| Modify | `app/src/components/checkout/PlanSelector.tsx` | Redesign to vertical radio layout with progressive disclosure |
| Modify | `app/src/components/checkout/PaymentTimeline.tsx` | Redesign to card-based layout with SVG progress rings |
| Create | `app/src/components/dashboard/PaymentModal.tsx` | New modal with 3 payment type radio options |
| Modify | `app/src/components/dashboard/OrderCard.tsx` | Change "Pay $X" to "Pay" button, wire to PaymentModal |
| Create | `app/tests/unit/FlexiblePayment.test.ts` | Unit tests for `paySpecificAmount` and `payFullBalance` |
| Modify | `app/tests/unit/components/Checkout.test.tsx` | Update tests for new PlanSelector layout |
| Create | `app/tests/unit/components/PaymentModal.test.tsx` | Component tests for PaymentModal |
| Create | `tests/e2e/regression/design-alignment.spec.ts` | E2E tests for all 3 features |

---

### Task 1: Store Actions — Failing Tests

**Files:**
- Create: `app/tests/unit/FlexiblePayment.test.ts`

- [ ] **Step 1: Write failing tests for `paySpecificAmount` and `payFullBalance`**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../src/store/useStore'
import { SEED_PRODUCTS } from '../../src/data/seedProducts'

describe('Flexible Payment Actions', () => {
  beforeEach(() => {
    useStore.getState().logout()
    useStore.getState().login('fresh@koda.test')
    useStore.getState().createOrder(SEED_PRODUCTS[0], 4) // $999, term 4, 0% fee
  })

  describe('paySpecificAmount', () => {
    it('pays exactly one installment amount', () => {
      const order = useStore.getState().orders[0]
      const nextUnpaid = order.installments.find(i => i.status !== 'paid')!

      useStore.getState().paySpecificAmount(order.id, nextUnpaid.amount)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.paidCount).toBe(order.paidCount + 1)
      expect(updated.installments[1].status).toBe('paid')
    })

    it('pays across multiple installments when amount covers more than one', () => {
      const order = useStore.getState().orders[0]
      // installments[1], [2], [3] are unpaid. Each is ~$249.
      const inst1 = order.installments[1].amount
      const inst2 = order.installments[2].amount
      const amount = inst1 + inst2

      useStore.getState().paySpecificAmount(order.id, amount)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.installments[1].status).toBe('paid')
      expect(updated.installments[2].status).toBe('paid')
      expect(updated.paidCount).toBe(order.paidCount + 2)
    })

    it('partially pays an installment when amount is less than one full installment', () => {
      const order = useStore.getState().orders[0]
      const nextAmount = order.installments[1].amount

      useStore.getState().paySpecificAmount(order.id, 50)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      // Installment not fully paid, so still 'upcoming'
      expect(updated.installments[1].status).toBe('upcoming')
      expect(updated.installments[1].amount).toBe(nextAmount - 50)
      expect(updated.paidCount).toBe(order.paidCount) // no new full payment
    })

    it('marks order as completed when specific amount covers all remaining', () => {
      const order = useStore.getState().orders[0]
      const remaining = order.installments
        .filter(i => i.status !== 'paid')
        .reduce((sum, i) => sum + i.amount, 0)

      useStore.getState().paySpecificAmount(order.id, remaining)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.status).toBe('completed')
      expect(updated.installments.every(i => i.status === 'paid')).toBe(true)
    })

    it('does nothing for non-existent order', () => {
      const ordersBefore = useStore.getState().orders
      useStore.getState().paySpecificAmount('nonexistent', 100)
      expect(useStore.getState().orders).toEqual(ordersBefore)
    })

    it('does nothing if amount is 0 or negative', () => {
      const order = useStore.getState().orders[0]
      const before = useStore.getState().orders.find(o => o.id === order.id)!

      useStore.getState().paySpecificAmount(order.id, 0)
      const after0 = useStore.getState().orders.find(o => o.id === order.id)!
      expect(after0.paidCount).toBe(before.paidCount)

      useStore.getState().paySpecificAmount(order.id, -50)
      const afterNeg = useStore.getState().orders.find(o => o.id === order.id)!
      expect(afterNeg.paidCount).toBe(before.paidCount)
    })
  })

  describe('payFullBalance', () => {
    it('marks all remaining installments as paid', () => {
      const order = useStore.getState().orders[0]

      useStore.getState().payFullBalance(order.id)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.installments.every(i => i.status === 'paid')).toBe(true)
      expect(updated.paidCount).toBe(order.term)
    })

    it('sets order status to completed', () => {
      const order = useStore.getState().orders[0]

      useStore.getState().payFullBalance(order.id)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.status).toBe('completed')
    })

    it('does nothing for non-existent order', () => {
      const ordersBefore = useStore.getState().orders
      useStore.getState().payFullBalance('nonexistent')
      expect(useStore.getState().orders).toEqual(ordersBefore)
    })

    it('does nothing if order is already completed', () => {
      const order = useStore.getState().orders[0]
      useStore.getState().payFullBalance(order.id)
      const completed = useStore.getState().orders.find(o => o.id === order.id)!
      expect(completed.status).toBe('completed')

      // Call again — should be no-op
      useStore.getState().payFullBalance(order.id)
      const stillCompleted = useStore.getState().orders.find(o => o.id === order.id)!
      expect(stillCompleted.paidCount).toBe(completed.paidCount)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run tests/unit/FlexiblePayment.test.ts`
Expected: FAIL — `paySpecificAmount` and `payFullBalance` are not defined on the store

---

### Task 2: Store Actions — Implementation

**Files:**
- Modify: `app/src/store/useStore.ts`

- [ ] **Step 1: Add action signatures to `AppState` interface**

In `app/src/store/useStore.ts`, after the `simulateFailure` line in the interface, add:

```ts
  paySpecificAmount: (orderId: string, amount: number) => void
  payFullBalance: (orderId: string) => void
```

- [ ] **Step 2: Implement `paySpecificAmount`**

Add after the `payInstallment` action implementation:

```ts
  // ─── PAY SPECIFIC AMOUNT ──────────────────────────────────────────────────
  paySpecificAmount: (orderId: string, amount: number) => {
    if (amount <= 0) return
    set(state => ({
      orders: state.orders.map(order => {
        if (order.id !== orderId) return order
        let remaining = amount
        let newPaidCount = order.paidCount
        const updatedInstallments = order.installments.map(inst => {
          if (inst.status === 'paid' || remaining <= 0) return inst
          if (remaining >= inst.amount) {
            remaining -= inst.amount
            newPaidCount++
            return { ...inst, status: 'paid' as const }
          } else {
            const newAmount = inst.amount - remaining
            remaining = 0
            return { ...inst, amount: newAmount }
          }
        })
        const allPaid = updatedInstallments.every(i => i.status === 'paid')
        return {
          ...order,
          paidCount: newPaidCount,
          status: allPaid ? 'completed' as const : order.status,
          installments: updatedInstallments,
        }
      }),
    }))
  },
```

- [ ] **Step 3: Implement `payFullBalance`**

Add after `paySpecificAmount`:

```ts
  // ─── PAY FULL BALANCE ─────────────────────────────────────────────────────
  payFullBalance: (orderId: string) => {
    set(state => ({
      orders: state.orders.map(order => {
        if (order.id !== orderId || order.status === 'completed') return order
        const updatedInstallments = order.installments.map(inst =>
          inst.status !== 'paid' ? { ...inst, status: 'paid' as const } : inst
        )
        return {
          ...order,
          paidCount: order.term,
          status: 'completed' as const,
          installments: updatedInstallments,
        }
      }),
    }))
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run tests/unit/FlexiblePayment.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Run full store test suite to confirm no regressions**

Run: `cd app && npx vitest run tests/unit/store/useStore.test.ts`
Expected: All existing tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/src/store/useStore.ts app/tests/unit/FlexiblePayment.test.ts
git commit -m "feat: add paySpecificAmount and payFullBalance store actions (TDD)"
```

---

### Task 3: Plan Selector Redesign

**Files:**
- Modify: `app/src/components/checkout/PlanSelector.tsx`
- Modify: `app/tests/unit/components/Checkout.test.tsx`

- [ ] **Step 1: Update PlanSelector component tests for new layout**

Replace the tests in `app/tests/unit/components/Checkout.test.tsx` that reference the old grid layout.

```tsx
describe('PlanSelector Component', () => {
  const mockOnTermSelect = vi.fn()
  const defaultProps = {
    price: 5000,
    selectedTerm: 4 as Term,
    onTermSelect: mockOnTermSelect,
  }

  beforeEach(() => {
    mockOnTermSelect.mockClear()
  })

  it('renders primary terms (4, 10, 18, 24) by default', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-option-4')).toBeDefined()
    expect(screen.getByTestId('plan-option-10')).toBeDefined()
    expect(screen.getByTestId('plan-option-18')).toBeDefined()
    expect(screen.getByTestId('plan-option-24')).toBeDefined()
  })

  it('hides secondary terms (6, 8, 12) by default', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.queryByTestId('plan-option-6')).toBeNull()
    expect(screen.queryByTestId('plan-option-8')).toBeNull()
    expect(screen.queryByTestId('plan-option-12')).toBeNull()
  })

  it('shows secondary terms after clicking "+ other options!"', () => {
    render(<PlanSelector {...defaultProps} />)
    fireEvent.click(screen.getByTestId('expand-other-options'))
    expect(screen.getByTestId('plan-option-6')).toBeDefined()
    expect(screen.getByTestId('plan-option-8')).toBeDefined()
    expect(screen.getByTestId('plan-option-12')).toBeDefined()
  })

  it('shows "free" badge on term 4', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-badge-free')).toBeDefined()
  })

  it('shows "most flexible" badge on term 24', () => {
    render(<PlanSelector {...defaultProps} />)
    expect(screen.getByTestId('plan-badge-flexible')).toBeDefined()
  })

  it('calls onTermSelect when a term is clicked', () => {
    render(<PlanSelector {...defaultProps} />)
    fireEvent.click(screen.getByTestId('plan-option-10'))
    expect(mockOnTermSelect).toHaveBeenCalledWith(10)
  })

  it('disables terms above price threshold', () => {
    render(<PlanSelector {...{ ...defaultProps, price: 500 }} />)
    // $500 only qualifies for term 4 (threshold 300)
    const term10 = screen.getByTestId('plan-option-10')
    expect(term10.getAttribute('disabled')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run tests/unit/components/Checkout.test.tsx`
Expected: FAIL

- [ ] **Step 3: Rewrite PlanSelector component**

Update `app/src/components/checkout/PlanSelector.tsx` with vertical radio layout.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run tests/unit/components/Checkout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/components/checkout/PlanSelector.tsx app/tests/unit/components/Checkout.test.tsx
git commit -m "feat: redesign PlanSelector to vertical radio layout with progressive disclosure"
```

---

### Task 4: Payment Timeline Redesign

**Files:**
- Modify: `app/src/components/checkout/PaymentTimeline.tsx`

- [ ] **Step 1: Rewrite PaymentTimeline component**

Update `app/src/components/checkout/PaymentTimeline.tsx` with card-based layout and SVG rings.

- [ ] **Step 2: Verify app builds without errors**

Run: `cd app && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/components/checkout/PaymentTimeline.tsx
git commit -m "feat: redesign PaymentTimeline to card-based layout with progress rings"
```

---

### Task 5: PaymentModal Component

**Files:**
- Create: `app/src/components/dashboard/PaymentModal.tsx`
- Create: `app/tests/unit/components/PaymentModal.test.tsx`

- [ ] **Step 1: Write component tests**

Create `app/tests/unit/components/PaymentModal.test.tsx` with tests for all 3 options.
Use `../../../src/...` for imports.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run tests/unit/components/PaymentModal.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement PaymentModal component**

Create `app/src/components/dashboard/PaymentModal.tsx`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run tests/unit/components/PaymentModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/components/dashboard/PaymentModal.tsx app/tests/unit/components/PaymentModal.test.tsx
git commit -m "feat: add PaymentModal with 3 payment type options (TDD)"
```

---

### Task 6: Wire OrderCard to PaymentModal

**Files:**
- Modify: `app/src/components/dashboard/OrderCard.tsx`

- [ ] **Step 1: Update OrderCard to use PaymentModal**

Wire "Pay" button to open `PaymentModal`. Implement `onConfirm` callback.

- [ ] **Step 2: Verify app builds without errors**

Run: `cd app && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run all unit tests to confirm no regressions**

Run: `cd app && npm run test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add app/src/components/dashboard/OrderCard.tsx
git commit -m "feat: wire OrderCard Pay button to PaymentModal"
```

---

### Task 7: E2E Tests

**Files:**
- Create: `tests/e2e/regression/design-alignment.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests**

Create `tests/e2e/regression/design-alignment.spec.ts`.

- [ ] **Step 2: Run E2E tests**

Run: `npm run test:e2e -- tests/e2e/regression/design-alignment.spec.ts`
Expected: PASS

- [ ] **Step 3: Generate QA Report**

Run: `node tests/e2e/helpers/generate-e2e-report.mjs`
Expected: New report in `QA/REPORTS/2026-04-02/`

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/regression/design-alignment.spec.ts
git commit -m "test: add E2E tests for Phase 8.5 design alignment"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run full unit test suite**
- [ ] **Step 2: Run TypeScript build check**
- [ ] **Step 3: Run lint**
- [ ] **Step 4: Run full E2E suite**
- [ ] **Step 5: Final commit**
