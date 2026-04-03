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
      // @ts-ignore
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
