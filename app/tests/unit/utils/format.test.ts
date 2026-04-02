import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatShortDate } from '../../../src/utils/format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats whole numbers without decimals', () => {
      expect(formatCurrency(100)).toBe('$100')
      expect(formatCurrency(5000)).toBe('$5,000')
    })

    it('formats numbers with decimals correctly', () => {
      expect(formatCurrency(99.99)).toBe('$99.99')
      expect(formatCurrency(100.5)).toBe('$100.50')
      expect(formatCurrency(1234.567)).toBe('$1,234.57')
    })

    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('formats large amounts with commas', () => {
      expect(formatCurrency(15500)).toBe('$15,500')
      expect(formatCurrency(1000000)).toBe('$1,000,000')
    })
  })

  describe('formatDate', () => {
    it('formats ISO strings to standard display', () => {
      const result = formatDate('2026-03-30T10:00:00Z')
      expect(result).toMatch(/Mar 30, 2026/)
    })

    it('formats date-only ISO strings', () => {
      const result = formatDate('2026-01-15')
      expect(result).toMatch(/Jan/)
      expect(result).toMatch(/2026/)
    })
  })

  describe('formatShortDate', () => {
    it('formats without year', () => {
      const result = formatShortDate('2026-03-30')
      expect(result).toMatch(/Mar/)
      expect(result).toMatch(/30/)
      expect(result).not.toMatch(/2026/)
    })
  })
})
