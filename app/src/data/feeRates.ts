export const TERMS = [4, 6, 8, 10, 12, 18, 24] as const
export type Term = typeof TERMS[number]

export const FEE_RATES: Record<Term, number> = {
  4:  0,
  6:  0.0398,
  8:  0.0622,
  10: 0.07997,
  12: 0.1118,
  18: 0.1725,
  24: 0.2338,
}

export const APR: Record<Term, number> = {
  4:  0,
  6:  19,
  8:  21.2,
  10: 21.2,
  12: 24.3,
  18: 24.3,
  24: 24.35,
}

// Minimum purchase amount required to unlock each term
export const TERM_THRESHOLDS: Record<Term, number> = {
  4:  300,
  6:  1000,
  8:  1000,
  10: 2000,
  12: 5000,
  18: 5000,
  24: 15000,
}

export interface PlanResult {
  term: Term
  monthly: number       // Principal / N (no fee included)
  fee: number           // One-time fee added to first payment only
  firstPayment: number  // monthly + fee
  total: number         // principal + fee
  durationMonths: number // term - 1
  installments: number[] // length = term; installments[0] includes fee
  apr: number
}

export function calculatePlan(principal: number, term: Term): PlanResult {
  const feeRate = FEE_RATES[term]
  const fee = Math.round(principal * feeRate)
  const base = Math.floor(principal / term)
  const remainder = principal - base * term

  // Build installments: all equal to base, last one absorbs rounding remainder
  const installments = Array(term).fill(base) as number[]
  installments[term - 1] += remainder
  // Fee charged on first payment only
  installments[0] += fee

  return {
    term,
    monthly: base,
    fee,
    firstPayment: base + fee,
    total: principal + fee,
    durationMonths: term - 1,
    installments,
    apr: APR[term],
  }
}

export function getAvailableTerms(principal: number): Term[] {
  return TERMS.filter(t => principal >= TERM_THRESHOLDS[t])
}
