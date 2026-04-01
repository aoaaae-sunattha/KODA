import { addMonths, format } from 'date-fns'
import { calculatePlan } from './feeRates'
import type { Order, Installment } from './types'

const TODAY = new Date('2026-03-30')

function buildInstallments(
  plan: ReturnType<typeof calculatePlan>,
  paidCount: number,
  startDate: Date
): Installment[] {
  return plan.installments.map((amount, i) => {
    const dueDate = i === 0 ? startDate : addMonths(startDate, i)
    let status: Installment['status'] = 'upcoming'
    if (i < paidCount) status = 'paid'
    return { index: i, amount, dueDate: format(dueDate, 'yyyy-MM-dd'), status }
  })
}

// Order A — Sinnerup: 1 of 4 paid (25%)
const planA = calculatePlan(1000, 4)
export const orderA: Order = {
  id: 'order-a',
  merchant: 'Sinnerup',
  merchantCategory: 'Home & Garden',
  purchaseDate: '2026-03-01',
  principal: 1000,
  term: 4,
  fee: planA.fee,
  monthly: planA.monthly,
  firstPayment: planA.firstPayment,
  total: planA.total,
  paidCount: 1,
  refundedAmount: 0,
  status: 'active',
  installments: buildInstallments(planA, 1, new Date('2026-03-01')),
}

// Order B — Luksus Baby: 1 paid + $180 refunded
const planB = calculatePlan(1000, 4)
export const orderB: Order = {
  id: 'order-b',
  merchant: 'Luksus Baby',
  merchantCategory: 'Kids',
  purchaseDate: '2026-02-15',
  principal: 1000,
  term: 4,
  fee: planB.fee,
  monthly: planB.monthly,
  firstPayment: planB.firstPayment,
  total: planB.total,
  paidCount: 1,
  refundedAmount: 180,
  status: 'active',
  installments: buildInstallments(planB, 1, new Date('2026-02-15')),
}

// Order C — Åberg: just approved, 0 paid
const planC = calculatePlan(700, 4)
export const orderC: Order = {
  id: 'order-c',
  merchant: 'Åberg',
  merchantCategory: 'Fashion',
  purchaseDate: '2026-03-30',
  principal: 700,
  term: 4,
  fee: planC.fee,
  monthly: planC.monthly,
  firstPayment: planC.firstPayment,
  total: planC.total,
  paidCount: 0,
  refundedAmount: 0,
  status: 'pending',
  installments: buildInstallments(planC, 0, TODAY),
}

export const defaultOrders: Order[] = [orderA, orderB, orderC]
