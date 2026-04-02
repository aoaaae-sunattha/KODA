# Phase 8.5 — Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align 3 UI features (Plan Selector, Payment Timeline, Flexible Payments) with anyday.io production design.

**Architecture:** Redesign PlanSelector and PaymentTimeline as vertical card-based layouts. Add a new PaymentModal component with 3 payment options backed by 2 new Zustand store actions (`paySpecificAmount`, `payFullBalance`). TDD — tests first, implementation second.

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
| Create | `playwright/tests/design-alignment.spec.ts` | E2E tests for all 3 features |

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

Add after the `payInstallment` action implementation (after line 152):

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

Replace the tests in `app/tests/unit/components/Checkout.test.tsx` that reference the old grid layout. The key changes: terms are now radio buttons in a vertical list, only primary terms (4, 10, 18, 24) visible by default, "+ other options!" expands secondary terms.

Update the test file — replace the `PlanSelector Component` describe block:

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
    // term 10 threshold is 2000, should be disabled
    const term10 = screen.getByTestId('plan-option-10')
    expect(term10.getAttribute('disabled')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run tests/unit/components/Checkout.test.tsx`
Expected: FAIL — old component doesn't have test IDs or new layout

- [ ] **Step 3: Rewrite PlanSelector component**

Replace the entire content of `app/src/components/checkout/PlanSelector.tsx`:

```tsx
import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TERMS, calculatePlan, TERM_THRESHOLDS } from '../../data/feeRates'
import type { Term } from '../../data/types'
import { formatCurrency } from '../../utils/format'

const PRIMARY_TERMS: Term[] = [4, 10, 18, 24]
const SECONDARY_TERMS: Term[] = [6, 8, 12]

interface PlanSelectorProps {
  price: number
  selectedTerm: Term
  onTermSelect: (term: Term) => void
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  price,
  selectedTerm,
  onTermSelect,
}) => {
  const [showOtherOptions, setShowOtherOptions] = useState(false)

  const plans = useMemo(
    () => Object.fromEntries(TERMS.map(t => [t, calculatePlan(price, t)])) as Record<Term, ReturnType<typeof calculatePlan>>,
    [price]
  )
  const selectedPlan = plans[selectedTerm]

  const visibleTerms: Term[] = useMemo(() => {
    if (!showOtherOptions) return PRIMARY_TERMS
    return [...TERMS].sort((a, b) => a - b)
  }, [showOtherOptions])

  const renderTermRow = (term: Term) => {
    const isSelected = selectedTerm === term
    const isAvailable = price >= TERM_THRESHOLDS[term]

    return (
      <button
        key={term}
        data-testid={`plan-option-${term}`}
        disabled={!isAvailable}
        onClick={() => isAvailable && onTermSelect(term)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left ${
          isSelected
            ? 'bg-primary/5 ring-1 ring-primary'
            : isAvailable
              ? 'bg-white hover:bg-gray-50 cursor-pointer'
              : 'bg-gray-50/50 opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Radio circle */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Term label */}
        <span className={`flex-1 font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
          {term} Payments
        </span>

        {/* Badges */}
        {term === 4 && isAvailable && (
          <span
            data-testid="plan-badge-free"
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white uppercase"
          >
            free
          </span>
        )}
        {term === 24 && isAvailable && (
          <span
            data-testid="plan-badge-flexible"
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white uppercase"
          >
            most flexible
          </span>
        )}

        {/* Threshold label for disabled terms */}
        {!isAvailable && (
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {formatCurrency(TERM_THRESHOLDS[term])}+
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Term list */}
      <div className="bg-gray-50 rounded-2xl p-2 space-y-1">
        {visibleTerms.map(renderTermRow)}
      </div>

      {/* Expand link */}
      {!showOtherOptions && (
        <button
          data-testid="expand-other-options"
          onClick={() => setShowOtherOptions(true)}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors pl-2"
        >
          + other options!
        </button>
      )}

      {/* Summary Card */}
      <motion.div
        key={selectedTerm}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-500 font-medium">Total to pay</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(selectedPlan.total)}
          </span>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">First payment (Today)</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(selectedPlan.firstPayment)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Includes first installment + {selectedTerm > 4 ? formatCurrency(selectedPlan.fee) + ' one-time setup fee' : '0% interest'}.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run tests/unit/components/Checkout.test.tsx`
Expected: All 7 tests PASS

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

Replace the entire content of `app/src/components/checkout/PaymentTimeline.tsx`:

```tsx
import React from 'react'
import { addMonths } from 'date-fns'
import { calculatePlan } from '../../data/feeRates'
import type { Term } from '../../data/types'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface PaymentTimelineProps {
  price: number
  term: Term
}

interface ProgressRingProps {
  index: number
  isFirst: boolean
  size?: number
  strokeWidth?: number
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  index,
  isFirst,
  size = 40,
  strokeWidth = 3,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isFirst ? '#E8E8FD' : '#E5E7EB'}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isFirst ? '#5D5FEF' : '#3EB489'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
        isFirst ? 'text-primary' : 'text-gray-600'
      }`}>
        {index + 1}
      </span>
    </div>
  )
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ price, term }) => {
  const plan = calculatePlan(price, term)
  const today = new Date()

  return (
    <div className={`space-y-2 ${term >= 18 ? 'max-h-72 overflow-y-auto pr-1' : ''}`}>
      {Array.from({ length: term }).map((_, i) => {
        const isFirst = i === 0
        const date = addMonths(today, i)
        const amount = plan.installments[i]

        return (
          <div
            key={i}
            data-testid={`timeline-card-${i}`}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
          >
            <div data-testid={`timeline-ring-${i}`}>
              <ProgressRing index={i} isFirst={isFirst} />
            </div>

            <div className="flex-1 min-w-0">
              <span className={`text-sm font-bold ${isFirst ? 'text-primary' : 'text-gray-900'}`}>
                {isFirst ? 'Upon checkout' : formatShortDate(date.toISOString())}
              </span>
              <span className="block text-xs text-gray-400 font-medium">Due</span>
            </div>

            <div className="text-right flex-shrink-0" data-testid={`timeline-amount-${i}`}>
              <span className={`font-bold ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>
                {formatCurrency(amount)}
              </span>
              {isFirst && plan.fee > 0 && (
                <span className="block text-[10px] text-gray-400">
                  (incl. {formatCurrency(plan.fee)} fee)
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify app builds without errors**

Run: `cd app && npm run build`
Expected: Build succeeds with no TypeScript errors

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

Create `app/tests/unit/components/PaymentModal.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentModal } from '../../src/components/dashboard/PaymentModal'
import type { Order } from '../../src/data/types'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockOrder: Order = {
  id: 'test-order-1',
  merchant: 'TestShop',
  merchantCategory: 'Electronics',
  purchaseDate: '2026-01-01',
  principal: 1000,
  term: 4,
  fee: 0,
  monthly: 250,
  firstPayment: 250,
  total: 1000,
  paidCount: 1,
  refundedAmount: 0,
  status: 'active',
  installments: [
    { index: 0, amount: 250, dueDate: '2026-01-01', status: 'paid' },
    { index: 1, amount: 250, dueDate: '2026-02-01', status: 'upcoming' },
    { index: 2, amount: 250, dueDate: '2026-03-01', status: 'upcoming' },
    { index: 3, amount: 250, dueDate: '2026-04-01', status: 'upcoming' },
  ],
}

describe('PaymentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnConfirm.mockClear()
  })

  const renderModal = (order = mockOrder) =>
    render(
      <PaymentModal
        order={order}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    )

  it('renders the modal with all 3 payment options', () => {
    renderModal()
    expect(screen.getByTestId('payment-modal')).toBeDefined()
    expect(screen.getByTestId('payment-option-next')).toBeDefined()
    expect(screen.getByTestId('payment-option-specific')).toBeDefined()
    expect(screen.getByTestId('payment-option-full')).toBeDefined()
  })

  it('selects "Pay my next installment" by default', () => {
    renderModal()
    const radio = screen.getByTestId('payment-option-next').querySelector('input[type="radio"]')
    expect((radio as HTMLInputElement).checked).toBe(true)
  })

  it('shows next installment amount for "next" option', () => {
    renderModal()
    expect(screen.getByText('$250')).toBeDefined()
  })

  it('shows remaining balance for "full" option', () => {
    renderModal()
    // Remaining = 3 * $250 = $750
    expect(screen.getByText('$750')).toBeDefined()
  })

  it('reveals amount input when "specific" option selected', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    expect(screen.getByTestId('specific-amount-input')).toBeDefined()
  })

  it('calls onConfirm with "next" type and amount', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('next', 250)
  })

  it('calls onConfirm with "full" type and remaining balance', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-full'))
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('full', 750)
  })

  it('calls onConfirm with "specific" type and entered amount', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '100' } })
    fireEvent.click(screen.getByTestId('confirm-payment-btn'))
    expect(mockOnConfirm).toHaveBeenCalledWith('specific', 100)
  })

  it('disables confirm button when specific amount is invalid', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '0' } })
    const btn = screen.getByTestId('confirm-payment-btn')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('disables confirm button when specific amount exceeds remaining balance', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('payment-option-specific'))
    fireEvent.change(screen.getByTestId('specific-amount-input'), { target: { value: '1000' } })
    const btn = screen.getByTestId('confirm-payment-btn')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('calls onClose when cancel button is clicked', () => {
    renderModal()
    fireEvent.click(screen.getByTestId('cancel-payment-btn'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run tests/unit/components/PaymentModal.test.tsx`
Expected: FAIL — `PaymentModal` module does not exist

- [ ] **Step 3: Implement PaymentModal component**

Create `app/src/components/dashboard/PaymentModal.tsx`:

```tsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import type { Order } from '../../data/types'

type PaymentType = 'next' | 'specific' | 'full'

interface PaymentModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (type: PaymentType, amount: number) => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('next')
  const [specificAmount, setSpecificAmount] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentType('next')
      setSpecificAmount('')
    }
  }, [isOpen])

  if (!order) return null

  const nextUnpaid = order.installments.find(i => i.status !== 'paid')
  const remainingBalance = order.installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0)
  const nextAmount = nextUnpaid?.amount ?? 0
  const parsedSpecific = parseFloat(specificAmount) || 0
  const isSpecificValid = parsedSpecific >= 1 && parsedSpecific <= remainingBalance

  const isConfirmDisabled = paymentType === 'specific' && !isSpecificValid

  const getConfirmAmount = (): number => {
    switch (paymentType) {
      case 'next': return nextAmount
      case 'specific': return parsedSpecific
      case 'full': return remainingBalance
    }
  }

  const handleConfirm = () => {
    if (isConfirmDisabled) return
    onConfirm(paymentType, getConfirmAmount())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            data-testid="payment-modal"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{order.merchant}</h2>
                <p className="text-sm text-gray-400 font-medium">
                  Remaining: {formatCurrency(remainingBalance)}
                </p>
              </div>
              <button
                data-testid="cancel-payment-btn"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Payment type options */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Type of payment</p>

              {/* Option: Next installment */}
              <label
                data-testid="payment-option-next"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'next' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="next"
                  checked={paymentType === 'next'}
                  onChange={() => setPaymentType('next')}
                  className="accent-primary w-4 h-4"
                />
                <span className="flex-1 font-medium text-gray-900">Pay my next installment</span>
                <span className="font-bold text-gray-900">{formatCurrency(nextAmount)}</span>
              </label>

              {/* Option: Specific amount */}
              <label
                data-testid="payment-option-specific"
                className={`flex flex-col px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'specific' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentType"
                    value="specific"
                    checked={paymentType === 'specific'}
                    onChange={() => setPaymentType('specific')}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="flex-1 font-medium text-gray-900">Pay specific amount</span>
                </div>
                {paymentType === 'specific' && (
                  <div className="mt-3 ml-7">
                    <input
                      data-testid="specific-amount-input"
                      type="number"
                      min={1}
                      max={remainingBalance}
                      step="0.01"
                      value={specificAmount}
                      onChange={e => setSpecificAmount(e.target.value)}
                      placeholder={`$1 – ${formatCurrency(remainingBalance)}`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    {specificAmount && !isSpecificValid && (
                      <p className="text-xs text-error mt-1 font-medium">
                        Enter an amount between $1 and {formatCurrency(remainingBalance)}
                      </p>
                    )}
                  </div>
                )}
              </label>

              {/* Option: Full balance */}
              <label
                data-testid="payment-option-full"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  paymentType === 'full' ? 'bg-primary/5 ring-1 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === 'full'}
                  onChange={() => setPaymentType('full')}
                  className="accent-primary w-4 h-4"
                />
                <span className="flex-1 font-medium text-gray-900">Pay off my balance in full</span>
                <span className="font-bold text-gray-900">{formatCurrency(remainingBalance)}</span>
              </label>
            </div>

            {/* Confirm button */}
            <button
              data-testid="confirm-payment-btn"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Payment
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npx vitest run tests/unit/components/PaymentModal.test.tsx`
Expected: All 10 tests PASS

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

In `app/src/components/dashboard/OrderCard.tsx`, make these changes:

Add import at the top (after the RefundModal import):

```ts
import { PaymentModal } from './PaymentModal'
```

Update the component to add PaymentModal state. Replace the destructuring line:

```ts
// Old:
const { payInstallment, simulateFailure } = useStore()
// New:
const { payInstallment, paySpecificAmount, payFullBalance, simulateFailure } = useStore()
```

Add state for the payment modal (after the `isRefundModalOpen` state):

```ts
const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
```

Replace the "Pay" button (the `{nextUnpaid && (` block inside the Actions section):

```tsx
{nextUnpaid && (
  <button
    onClick={() => setIsPaymentModalOpen(true)}
    data-testid="pay-btn"
    className="flex-1 py-3 px-4 rounded-2xl bg-[#5D5FEF] text-white text-sm font-bold shadow-lg shadow-[#5D5FEF]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
  >
    Pay
    <ChevronRight size={16} />
  </button>
)}
```

Add the PaymentModal component at the end (after the `<RefundModal ... />` line):

```tsx
<PaymentModal
  order={order}
  isOpen={isPaymentModalOpen}
  onClose={() => setIsPaymentModalOpen(false)}
  onConfirm={(type, amount) => {
    switch (type) {
      case 'next':
        payInstallment(order.id)
        break
      case 'specific':
        paySpecificAmount(order.id, amount)
        break
      case 'full':
        payFullBalance(order.id)
        break
    }
    setIsPaymentModalOpen(false)
  }}
/>
```

- [ ] **Step 2: Verify app builds without errors**

Run: `cd app && npm run build`
Expected: Build succeeds with no TypeScript errors

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
- Create: `playwright/tests/design-alignment.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests**

Create `playwright/tests/design-alignment.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Phase 8.5 — Design Alignment', () => {

  test.describe('Plan Selector', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'active@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
      await page.goto('/store')
    })

    test('shows primary terms and hides secondary terms by default', async ({ page }) => {
      // Click first product's "Buy with KODA" button to open checkout
      await page.click('[data-testid="buy-btn"]:first-of-type')
      await expect(page.getByTestId('plan-option-4')).toBeVisible()
      await expect(page.getByTestId('plan-option-10')).toBeVisible()
      await expect(page.getByTestId('plan-option-18')).toBeVisible()
      await expect(page.getByTestId('plan-option-24')).toBeVisible()
      await expect(page.getByTestId('plan-option-6')).not.toBeVisible()
      await expect(page.getByTestId('plan-option-8')).not.toBeVisible()
    })

    test('expands secondary terms when "+ other options!" is clicked', async ({ page }) => {
      await page.click('[data-testid="buy-btn"]:first-of-type')
      await page.click('[data-testid="expand-other-options"]')
      await expect(page.getByTestId('plan-option-6')).toBeVisible()
      await expect(page.getByTestId('plan-option-8')).toBeVisible()
    })

    test('shows free badge on term 4 and most flexible on term 24', async ({ page }) => {
      await page.click('[data-testid="buy-btn"]:first-of-type')
      await expect(page.getByTestId('plan-badge-free')).toBeVisible()
      await expect(page.getByTestId('plan-badge-flexible')).toBeVisible()
    })
  })

  test.describe('Payment Timeline', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'active@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
      await page.goto('/store')
    })

    test('renders timeline cards with progress rings', async ({ page }) => {
      await page.click('[data-testid="buy-btn"]:first-of-type')
      await expect(page.getByTestId('timeline-card-0')).toBeVisible()
      await expect(page.getByTestId('timeline-ring-0')).toBeVisible()
      await expect(page.getByTestId('timeline-amount-0')).toBeVisible()
    })

    test('first card shows "Upon checkout"', async ({ page }) => {
      await page.click('[data-testid="buy-btn"]:first-of-type')
      const firstCard = page.getByTestId('timeline-card-0')
      await expect(firstCard).toContainText('Upon checkout')
    })
  })

  test.describe('Payment Modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'active@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
    })

    test('opens payment modal when Pay button is clicked', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-modal')).toBeVisible()
    })

    test('shows all 3 payment options', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-option-next')).toBeVisible()
      await expect(page.getByTestId('payment-option-specific')).toBeVisible()
      await expect(page.getByTestId('payment-option-full')).toBeVisible()
    })

    test('pay next installment updates order card', async ({ page }) => {
      const orderCard = page.getByTestId('order-card').first()
      const paidTextBefore = await orderCard.getByText(/\d+ \/ \d+ Payments/).textContent()

      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="confirm-payment-btn"]')

      // Modal should close
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
      // Paid count should increase
      const paidTextAfter = await orderCard.getByText(/\d+ \/ \d+ Payments/).textContent()
      expect(paidTextAfter).not.toBe(paidTextBefore)
    })

    test('pay specific amount shows input field', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="payment-option-specific"]')
      await expect(page.getByTestId('specific-amount-input')).toBeVisible()
    })

    test('pay off full balance completes the order', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="payment-option-full"]')
      await page.click('[data-testid="confirm-payment-btn"]')
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
    })

    test('cancel closes the modal', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-modal')).toBeVisible()
      await page.click('[data-testid="cancel-payment-btn"]')
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
    })
  })
})
```

- [ ] **Step 2: Run E2E tests (dev server must be running)**

Run: `npm run test:e2e -- playwright/tests/design-alignment.spec.ts`
Expected: All tests pass (assuming dev server is available)

- [ ] **Step 3: Commit**

```bash
git add playwright/tests/design-alignment.spec.ts
git commit -m "test: add E2E tests for Phase 8.5 design alignment"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run full unit test suite**

Run: `cd app && npm run test`
Expected: All tests pass

- [ ] **Step 2: Run TypeScript build check**

Run: `cd app && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run lint**

Run: `cd app && npm run lint`
Expected: No errors

- [ ] **Step 4: Run full E2E suite**

Run: `npm run test:e2e`
Expected: All tests pass

- [ ] **Step 5: Final commit (if any lint/build fixes needed)**

```bash
git add -A
git commit -m "chore: Phase 8.5 design alignment complete"
```
