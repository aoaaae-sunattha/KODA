import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../src/store/useStore'
import { SEED_PRODUCTS } from '../../src/data/seedProducts'

describe('useStore Zustand actions', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  describe('Auth', () => {
    it('logins correctly with mock email', () => {
      const { login } = useStore.getState()
      const success = login('active@anyway.test')

      expect(success).toBe(true)
      const { currentUser, orders, cards } = useStore.getState()
      expect(currentUser?.email).toBe('active@anyway.test')
      expect(orders.length).toBeGreaterThan(0)
      expect(cards.length).toBeGreaterThan(0)
    })

    it('fails login with unknown email', () => {
      const { login } = useStore.getState()
      const success = login('nonexistent@anyway.test')

      expect(success).toBe(false)
      expect(useStore.getState().currentUser).toBeNull()
      expect(useStore.getState().loginError).toBe('No account found for this email.')
    })

    it('normalizes email case for user lookup', () => {
      const success = useStore.getState().login('Active@Anyway.Test')
      expect(success).toBe(true)
      expect(useStore.getState().currentUser?.email).toBe('active@anyway.test')
    })

    it('normalizes email for orders and cards lookup', () => {
      useStore.getState().login('Active@Anyway.Test')
      // active@anyway.test has 3 orders and 1 card
      expect(useStore.getState().orders.length).toBe(3)
      expect(useStore.getState().cards.length).toBe(1)
    })

    it('trims whitespace from email', () => {
      const success = useStore.getState().login('  active@anyway.test  ')
      expect(success).toBe(true)
      expect(useStore.getState().orders.length).toBe(3)
    })

    it('logout clears all state', () => {
      useStore.getState().login('active@anyway.test')
      useStore.getState().logout()
      const state = useStore.getState()
      expect(state.currentUser).toBeNull()
      expect(state.orders).toEqual([])
      expect(state.cards).toEqual([])
      expect(state.merchantOrders).toEqual([])
    })

    it('loads merchant orders for merchant role', () => {
      useStore.getState().login('merchant@anyway.test')
      expect(useStore.getState().merchantOrders.length).toBeGreaterThan(0)
    })

    it('does not load merchant orders for shopper role', () => {
      useStore.getState().login('active@anyway.test')
      expect(useStore.getState().merchantOrders).toEqual([])
    })
  })

  // ─── CREATE ORDER ──────────────────────────────────────────────────────────
  describe('createOrder', () => {
    it('creates a new order with correct structure', () => {
      useStore.getState().login('fresh@anyway.test')
      const product = SEED_PRODUCTS[0] // iPhone, $999

      useStore.getState().createOrder(product, 4)

      const orders = useStore.getState().orders
      expect(orders.length).toBe(1)
      expect(orders[0].principal).toBe(999)
      expect(orders[0].term).toBe(4)
      expect(orders[0].fee).toBe(0) // term 4 = 0%
      expect(orders[0].status).toBe('active')
      expect(orders[0].paidCount).toBe(1) // first payment at checkout
      expect(orders[0].installments.length).toBe(4)
      expect(orders[0].installments[0].status).toBe('paid')
    })

    it('includes fee in first installment for term > 4', () => {
      useStore.getState().login('fresh@anyway.test')
      const product = SEED_PRODUCTS[1] // MacBook, $2499

      useStore.getState().createOrder(product, 6)

      const order = useStore.getState().orders[0]
      expect(order.fee).toBeGreaterThan(0)
      expect(order.installments[0].amount).toBeGreaterThan(order.monthly)
      expect(order.firstPayment).toBe(order.monthly + order.fee)
    })

    it('prepends new order to existing orders', () => {
      useStore.getState().login('active@anyway.test')
      const initialCount = useStore.getState().orders.length

      useStore.getState().createOrder(SEED_PRODUCTS[0], 4)

      expect(useStore.getState().orders.length).toBe(initialCount + 1)
      expect(useStore.getState().orders[0].principal).toBe(999)
    })
  })

  // ─── PAY INSTALLMENT ──────────────────────────────────────────────────────
  describe('payInstallment', () => {
    it('pays the next unpaid installment', () => {
      useStore.getState().login('active@anyway.test')
      const order = useStore.getState().orders[0]
      const initialPaidCount = order.paidCount

      useStore.getState().payInstallment(order.id)

      const updated = useStore.getState().orders.find(o => o.id === order.id)!
      expect(updated.paidCount).toBe(initialPaidCount + 1)
    })

    it('marks order as completed when all installments paid', () => {
      useStore.getState().login('fresh@anyway.test')
      useStore.getState().createOrder(SEED_PRODUCTS[0], 4)

      const orderId = useStore.getState().orders[0].id
      // Already 1 paid at checkout, need 3 more
      useStore.getState().payInstallment(orderId)
      useStore.getState().payInstallment(orderId)
      useStore.getState().payInstallment(orderId)

      const order = useStore.getState().orders.find(o => o.id === orderId)!
      expect(order.status).toBe('completed')
      expect(order.paidCount).toBe(4)
    })

    it('does nothing for non-existent order', () => {
      useStore.getState().login('active@anyway.test')
      const ordersBefore = useStore.getState().orders

      useStore.getState().payInstallment('nonexistent')

      expect(useStore.getState().orders).toEqual(ordersBefore)
    })

    it('does nothing if all installments already paid', () => {
      useStore.getState().login('fresh@anyway.test')
      useStore.getState().createOrder(SEED_PRODUCTS[0], 4)
      const orderId = useStore.getState().orders[0].id

      // Pay all remaining
      useStore.getState().payInstallment(orderId)
      useStore.getState().payInstallment(orderId)
      useStore.getState().payInstallment(orderId)

      const before = useStore.getState().orders.find(o => o.id === orderId)!
      useStore.getState().payInstallment(orderId) // Extra pay should be no-op
      const after = useStore.getState().orders.find(o => o.id === orderId)!

      expect(after.paidCount).toBe(before.paidCount)
    })
  })

  // ─── SIMULATE REFUND ──────────────────────────────────────────────────────
  describe('simulateRefund', () => {
    it('deducts refund from last unpaid installment first', () => {
      useStore.getState().login('fresh@anyway.test')
      useStore.getState().createOrder(SEED_PRODUCTS[0], 4) // $999, term 4
      const order = useStore.getState().orders[0]
      const lastInstallmentAmount = order.installments[3].amount

      useStore.getState().simulateRefund(order.id, 100)

      const updated = useStore.getState().orders[0]
      expect(updated.refundedAmount).toBe(100)
      expect(updated.total).toBe(order.total - 100)
      expect(updated.installments[3].amount).toBe(lastInstallmentAmount - 100)
    })

    it('cascades to earlier installments if last one zeroed out', () => {
      useStore.getState().login('fresh@anyway.test')
      useStore.getState().createOrder(SEED_PRODUCTS[5], 4) // Dyson $949, term 4
      const order = useStore.getState().orders[0]
      const lastAmount = order.installments[3].amount
      const penultimateAmount = order.installments[2].amount
      const refundAmount = lastAmount + 50

      useStore.getState().simulateRefund(order.id, refundAmount)

      const updated = useStore.getState().orders[0]
      expect(updated.installments[3].amount).toBe(0)
      expect(updated.installments[2].amount).toBe(penultimateAmount - 50)
    })

    it('skips paid installments', () => {
      useStore.getState().login('fresh@anyway.test')
      useStore.getState().createOrder(SEED_PRODUCTS[0], 4)
      const order = useStore.getState().orders[0]
      // installment 0 is already paid

      useStore.getState().simulateRefund(order.id, order.total) // Huge refund

      const updated = useStore.getState().orders[0]
      // Paid installment (index 0) should be untouched
      expect(updated.installments[0].amount).toBe(order.installments[0].amount)
    })
  })

  // ─── KYC ───────────────────────────────────────────────────────────────────
  describe('verifyKYC', () => {
    it('sets verified=true, active status, and grants $8000 credit', () => {
      useStore.getState().login('new@anyway.test')
      expect(useStore.getState().currentUser?.verified).toBe(false)

      useStore.getState().verifyKYC()

      const user = useStore.getState().currentUser!
      expect(user.verified).toBe(true)
      expect(user.accountStatus).toBe('active')
      expect(user.creditLimit).toBe(8000)
    })
  })

  // ─── ACCOUNT LOCKING ──────────────────────────────────────────────────────
  describe('lockAccount / payOverdue', () => {
    it('lockAccount sets status to locked', () => {
      useStore.getState().login('active@anyway.test')
      useStore.getState().lockAccount()
      expect(useStore.getState().currentUser?.accountStatus).toBe('locked')
    })

    it('payOverdue restores active status and clears overdueAmount', () => {
      useStore.getState().login('overdue@anyway.test')
      expect(useStore.getState().currentUser?.accountStatus).toBe('locked')

      useStore.getState().payOverdue()

      const user = useStore.getState().currentUser!
      expect(user.accountStatus).toBe('active')
      expect(user.overdueAmount).toBe(0)
    })

    it('payOverdue changes overdue orders to active', () => {
      useStore.getState().login('overdue@anyway.test')
      const overdueOrders = useStore.getState().orders.filter(o => o.status === 'overdue')
      expect(overdueOrders.length).toBeGreaterThan(0)

      useStore.getState().payOverdue()

      const stillOverdue = useStore.getState().orders.filter(o => o.status === 'overdue')
      expect(stillOverdue.length).toBe(0)
    })
  })

  // ─── CARDS ─────────────────────────────────────────────────────────────────
  describe('Card actions', () => {
    it('addCard appends a new card', () => {
      useStore.getState().login('fresh@anyway.test')
      const initialCount = useStore.getState().cards.length

      useStore.getState().addCard({
        last4: '4444',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2029,
        isPrimary: false,
      })

      expect(useStore.getState().cards.length).toBe(initialCount + 1)
      expect(useStore.getState().cards.at(-1)?.last4).toBe('4444')
    })

    it('removeCard removes the specified card', () => {
      useStore.getState().login('power@anyway.test')
      const initialCount = useStore.getState().cards.length
      const cardToRemove = useStore.getState().cards.find(c => !c.isPrimary)!

      useStore.getState().removeCard(cardToRemove.id)

      expect(useStore.getState().cards.length).toBe(initialCount - 1)
      expect(useStore.getState().cards.find(c => c.id === cardToRemove.id)).toBeUndefined()
    })

    it('setPrimaryCard sets only one card as primary', () => {
      useStore.getState().login('power@anyway.test')
      const nonPrimary = useStore.getState().cards.find(c => !c.isPrimary)!

      useStore.getState().setPrimaryCard(nonPrimary.id)

      const cards = useStore.getState().cards
      const primaries = cards.filter(c => c.isPrimary)
      expect(primaries.length).toBe(1)
      expect(primaries[0].id).toBe(nonPrimary.id)
    })
  })

  // ─── COMPUTED CREDIT ───────────────────────────────────────────────────────
  describe('getUsedCredit / getAvailableCredit', () => {
    it('returns 0 for user with no orders', () => {
      useStore.getState().login('fresh@anyway.test')
      expect(useStore.getState().getUsedCredit()).toBe(0)
      expect(useStore.getState().getAvailableCredit()).toBe(8000)
    })

    it('correctly calculates used credit accounting for fee in first payment', () => {
      useStore.getState().login('fresh@anyway.test')
      // Create order with fee: MacBook $2499, term 6
      useStore.getState().createOrder(SEED_PRODUCTS[1], 6) // fee = round(2499 * 0.0398) = 99

      const order = useStore.getState().orders[0]
      const expected = order.total - order.firstPayment
      expect(useStore.getState().getUsedCredit()).toBe(expected)
    })

    it('excludes completed orders from used credit', () => {
      useStore.getState().login('power@anyway.test')
      // power user has completed orders
      const completed = useStore.getState().orders.filter(o => o.status === 'completed')
      expect(completed.length).toBeGreaterThan(0)

      // Used credit should only count non-completed orders
      const active = useStore.getState().orders.filter(o => o.status !== 'completed')
      const usedCredit = useStore.getState().getUsedCredit()
      const manualCalc = active.reduce((sum: number, o) => {
        const paidAmt = o.paidCount > 0
          ? o.firstPayment + (o.paidCount - 1) * o.monthly
          : 0
        return sum + (o.total - paidAmt)
      }, 0)
      expect(usedCredit).toBe(manualCalc)
    })

    it('available credit never goes below 0', () => {
      useStore.getState().login('maxed@anyway.test')
      expect(useStore.getState().getAvailableCredit()).toBeGreaterThanOrEqual(0)
    })

    it('returns 0 for available credit when no user', () => {
      expect(useStore.getState().getAvailableCredit()).toBe(0)
    })
  })
})
