import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../src/store/useStore'
import { calculatePlan, getAvailableTerms } from '../src/data/feeRates'
import { SEED_PRODUCTS } from '../src/data/seedProducts'

describe('Checkout Flow & Payment Slicing (Phase 3)', () => {
  beforeEach(() => {
    useStore.getState().logout()
  })

  describe('calculatePlan Math', () => {
    it('calculates Pay-in-4 correctly (interest free)', () => {
      const principal = 400
      const plan = calculatePlan(principal, 4)
      
      expect(plan.fee).toBe(0)
      expect(plan.monthly).toBe(100)
      expect(plan.firstPayment).toBe(100)
      expect(plan.total).toBe(400)
      expect(plan.installments).toHaveLength(4)
      expect(plan.installments.reduce((a, b) => a + b, 0)).toBe(400)
    })

    it('calculates 6-month plan with fee correctly', () => {
      const principal = 1000
      const plan = calculatePlan(principal, 6)
      
      // Fee rate for 6 months is 0.0398
      // 1000 * 0.0398 = 39.8 -> rounded to 40
      expect(plan.fee).toBe(40)
      // 1000 / 6 = 166.666... -> base 166
      expect(plan.monthly).toBe(166)
      // firstPayment = 166 + 40 = 206
      expect(plan.firstPayment).toBe(206)
      // total = 1000 + 40 = 1040
      expect(plan.total).toBe(1040)
      
      expect(plan.installments).toHaveLength(6)
      // installments[0] = 166 + 40 = 206
      expect(plan.installments[0]).toBe(206)
      // installments[5] should have the remainder
      // 1000 - (166 * 6) = 1000 - 996 = 4
      // installments[5] = 166 + 4 = 170
      expect(plan.installments[5]).toBe(170)
      expect(plan.installments.reduce((a, b) => a + b, 0)).toBe(1040)
    })

    it('handles high-value terms (24 months)', () => {
      const principal = 15500
      const plan = calculatePlan(principal, 24)
      
      // Fee rate for 24 months is 0.2338
      // 15500 * 0.2338 = 3623.9 -> rounded to 3624
      expect(plan.fee).toBe(3624)
      expect(plan.total).toBe(15500 + 3624)
      expect(plan.installments).toHaveLength(24)
      expect(plan.installments.reduce((a, b) => a + b, 0)).toBe(15500 + 3624)
    })
  })

  describe('getAvailableTerms Thresholds', () => {
    it('returns only Pay-in-4 for low amounts', () => {
      const terms = getAvailableTerms(500)
      expect(terms).toEqual([4])
    })

    it('returns terms up to 10 months for $2500', () => {
      const terms = getAvailableTerms(2500)
      // Thresholds: 4:300, 6:1000, 8:1000, 10:2000, 12:5000
      expect(terms).toEqual([4, 6, 8, 10])
    })

    it('returns all terms for $16000', () => {
      const terms = getAvailableTerms(16000)
      expect(terms).toEqual([4, 6, 8, 10, 12, 18, 24])
    })
  })

  describe('Store Order Creation', () => {
    it('creates a new order with correct installments and status', () => {
      useStore.getState().login('fresh@koda.test')
      const product = SEED_PRODUCTS[0] // iPhone 15 Pro, $999
      
      useStore.getState().createOrder(product, 4)
      
      const state = useStore.getState()
      expect(state.orders).toHaveLength(1)
      const order = state.orders[0]
      
      expect(order.merchant).toBe(product.brand)
      expect(order.principal).toBe(product.price)
      expect(order.term).toBe(4)
      expect(order.paidCount).toBe(1)
      expect(order.status).toBe('active')
      
      expect(order.installments).toHaveLength(4)
      expect(order.installments[0].status).toBe('paid')
      expect(order.installments[1].status).toBe('upcoming')
      
      // Credit check
      const usedCredit = state.getUsedCredit()
      // principal 999, term 4, monthly 249, remainder 3. 
      // installments: [249, 249, 249, 249+3=252]
      // first payment 249 is paid.
      // remaining: 999 - 249 = 750
      expect(usedCredit).toBe(999 - 249)
    })
  })
})
