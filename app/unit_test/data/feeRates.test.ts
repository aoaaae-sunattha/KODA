import { describe, it, expect } from 'vitest'
import { calculatePlan, getAvailableTerms } from '../../src/data/feeRates'

describe('feeRates logic', () => {
  describe('calculatePlan', () => {
    it('calculates term 4 correctly (interest-free)', () => {
      const result = calculatePlan(1000, 4)
      expect(result.fee).toBe(0)
      expect(result.monthly).toBe(250)
      expect(result.total).toBe(1000)
      expect(result.installments).toEqual([250, 250, 250, 250])
    })

    it('calculates term 6 with fee correctly', () => {
      const result = calculatePlan(1000, 6)
      expect(result.fee).toBe(40)
      expect(result.monthly).toBe(166)
      expect(result.total).toBe(1040)
      expect(result.installments[0]).toBe(206)
      expect(result.installments[5]).toBe(170)
      expect(result.installments.reduce((a, b) => a + b, 0)).toBe(1040)
    })

    it('handles large purchases (term 24)', () => {
      const result = calculatePlan(15500, 24)
      expect(result.fee).toBe(Math.round(15500 * 0.2338))
      expect(result.installments.length).toBe(24)
      expect(result.installments.reduce((a, b) => a + b, 0)).toBe(15500 + result.fee)
    })
  })

  describe('getAvailableTerms', () => {
    it('unlocks only term 4 for $500', () => {
      const terms = getAvailableTerms(500)
      expect(terms).toEqual([4])
    })

    it('unlocks multiple terms for $2500', () => {
      const terms = getAvailableTerms(2500)
      expect(terms).toEqual([4, 6, 8, 10])
    })

    it('unlocks everything for $15000+', () => {
      const terms = getAvailableTerms(15000)
      expect(terms.length).toBe(7)
    })
  })
})
