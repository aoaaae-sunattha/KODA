import { addMonths, format } from 'date-fns'
import { calculatePlan } from './feeRates'
import { defaultOrders } from './seedOrders'
import type { User, Order, Card, MerchantOrder } from './types'

function makeInstallments(
  plan: ReturnType<typeof calculatePlan>,
  paidCount: number,
  startDate: Date
) {
  return plan.installments.map((amount, i) => ({
    index: i,
    amount,
    dueDate: format(i === 0 ? startDate : addMonths(startDate, i), 'yyyy-MM-dd'),
    status: (i < paidCount ? 'paid' : 'upcoming') as 'paid' | 'upcoming' | 'overdue',
  }))
}

// ─── PRE-COMPUTE PLANS ────────────────────────────────────────────────────────
const illumPlan    = calculatePlan(2000, 4)
const magasinPlan  = calculatePlan(3000, 8)
const norrPlan     = calculatePlan(3000, 10)
const samsoePlan   = calculatePlan(2500, 6)
const norsePlan    = calculatePlan(2500, 4)
const boliaPlan    = calculatePlan(4000, 4)
const illumsPlan   = calculatePlan(2000, 6)
const boPlan       = calculatePlan(6000, 12)
const sneakerPlan  = calculatePlan(2400, 8)

// ─── USERS ────────────────────────────────────────────────────────────────────
export const MOCK_USERS: Record<string, User> = {
  'active@anyway.test': {
    id: 'u1', email: 'active@anyway.test', name: 'Alex Johnson',
    verified: true, creditLimit: 10000, accountStatus: 'active', role: 'shopper',
  },
  'new@anyway.test': {
    id: 'u2', email: 'new@anyway.test', name: 'Sam New',
    verified: false, creditLimit: 0, accountStatus: 'kyc_pending', role: 'shopper',
  },
  'fresh@anyway.test': {
    id: 'u3', email: 'fresh@anyway.test', name: 'Jordan Fresh',
    verified: true, creditLimit: 8000, accountStatus: 'active', role: 'shopper',
  },
  'overdue@anyway.test': {
    id: 'u4', email: 'overdue@anyway.test', name: 'Riley Overdue',
    verified: true, creditLimit: 10000, accountStatus: 'locked',
    overdueAmount: 500, overdueSince: '2026-02-15', role: 'shopper',
  },
  'declined@anyway.test': {
    id: 'u5', email: 'declined@anyway.test', name: 'Morgan Declined',
    verified: true, creditLimit: 10000, accountStatus: 'action_required',
    declineReason: 'Card expired — payment failed on 2026-03-01', role: 'shopper',
  },
  'maxed@anyway.test': {
    id: 'u6', email: 'maxed@anyway.test', name: 'Casey Maxed',
    verified: true, creditLimit: 5000, accountStatus: 'active', role: 'shopper',
  },
  'power@anyway.test': {
    id: 'u7', email: 'power@anyway.test', name: 'Taylor Power',
    verified: true, creditLimit: 25000, accountStatus: 'active', role: 'shopper',
  },
  'merchant@anyway.test': {
    id: 'u8', email: 'merchant@anyway.test', name: 'Copenhagen Concept Store',
    verified: true, creditLimit: 0, accountStatus: 'active',
    role: 'merchant', businessName: 'Copenhagen Concept Store',
  },
}

// ─── ORDERS PER USER ──────────────────────────────────────────────────────────
export const MOCK_ORDERS: Record<string, Order[]> = {
  'active@anyway.test': defaultOrders,
  'new@anyway.test': [],
  'fresh@anyway.test': [],
  'overdue@anyway.test': [
    {
      id: 'ov-1', merchant: 'ILLUM', merchantCategory: 'Department Store',
      purchaseDate: '2026-01-15', principal: 2000, term: 4,
      fee: illumPlan.fee, monthly: illumPlan.monthly,
      firstPayment: illumPlan.firstPayment, total: illumPlan.total,
      paidCount: 2, refundedAmount: 0, status: 'overdue',
      installments: makeInstallments(illumPlan, 2, new Date('2026-01-15')).map((inst, i) =>
        i === 2 ? { ...inst, status: 'overdue' as const } : inst
      ),
    },
    {
      id: 'ov-2', merchant: 'Magasin', merchantCategory: 'Department Store',
      purchaseDate: '2026-02-01', principal: 3000, term: 8,
      fee: magasinPlan.fee, monthly: magasinPlan.monthly,
      firstPayment: magasinPlan.firstPayment, total: magasinPlan.total,
      paidCount: 3, refundedAmount: 0, status: 'active',
      installments: makeInstallments(magasinPlan, 3, new Date('2026-02-01')),
    },
  ],
  'declined@anyway.test': [
    {
      id: 'dec-1', merchant: 'Nørr Streetwear', merchantCategory: 'Fashion',
      purchaseDate: '2025-11-01', principal: 3000, term: 10,
      fee: norrPlan.fee, monthly: norrPlan.monthly,
      firstPayment: norrPlan.firstPayment, total: norrPlan.total,
      paidCount: 4, refundedAmount: 0, status: 'active',
      installments: makeInstallments(norrPlan, 4, new Date('2025-11-01')),
    },
  ],
  'maxed@anyway.test': [
    {
      id: 'max-1', merchant: 'Samsøe Samsøe', merchantCategory: 'Fashion',
      purchaseDate: '2026-03-01', principal: 2500, term: 6,
      fee: samsoePlan.fee, monthly: samsoePlan.monthly,
      firstPayment: samsoePlan.firstPayment, total: samsoePlan.total,
      paidCount: 1, refundedAmount: 0, status: 'active',
      installments: makeInstallments(samsoePlan, 1, new Date('2026-03-01')),
    },
    {
      id: 'max-2', merchant: 'Norse Projects', merchantCategory: 'Fashion',
      purchaseDate: '2026-03-15', principal: 2500, term: 4,
      fee: norsePlan.fee, monthly: norsePlan.monthly,
      firstPayment: norsePlan.firstPayment, total: norsePlan.total,
      paidCount: 1, refundedAmount: 0, status: 'active',
      installments: makeInstallments(norsePlan, 1, new Date('2026-03-15')),
    },
  ],
  'power@anyway.test': [
    {
      id: 'pow-1', merchant: 'Bolia', merchantCategory: 'Furniture & Interior',
      purchaseDate: '2025-08-01', principal: 4000, term: 4,
      fee: boliaPlan.fee, monthly: boliaPlan.monthly,
      firstPayment: boliaPlan.firstPayment, total: boliaPlan.total,
      paidCount: 4, refundedAmount: 0, status: 'completed',
      installments: makeInstallments(boliaPlan, 4, new Date('2025-08-01')),
    },
    {
      id: 'pow-2', merchant: 'Illums Bolighus', merchantCategory: 'Home & Garden',
      purchaseDate: '2025-10-01', principal: 2000, term: 6,
      fee: illumsPlan.fee, monthly: illumsPlan.monthly,
      firstPayment: illumsPlan.firstPayment, total: illumsPlan.total,
      paidCount: 6, refundedAmount: 0, status: 'completed',
      installments: makeInstallments(illumsPlan, 6, new Date('2025-10-01')),
    },
    {
      id: 'pow-3', merchant: 'Bang & Olufsen', merchantCategory: 'Electronics',
      purchaseDate: '2025-11-01', principal: 6000, term: 12,
      fee: boPlan.fee, monthly: boPlan.monthly,
      firstPayment: boPlan.firstPayment, total: boPlan.total,
      paidCount: 5, refundedAmount: 0, status: 'active',
      installments: makeInstallments(boPlan, 5, new Date('2025-11-01')),
    },
    {
      id: 'pow-4', merchant: 'Sneakersnstuff', merchantCategory: 'Fashion',
      purchaseDate: '2026-02-01', principal: 2400, term: 8,
      fee: sneakerPlan.fee, monthly: sneakerPlan.monthly,
      firstPayment: sneakerPlan.firstPayment, total: sneakerPlan.total,
      paidCount: 2, refundedAmount: 0, status: 'active',
      installments: makeInstallments(sneakerPlan, 2, new Date('2026-02-01')),
    },
  ],
  'merchant@anyway.test': [],
}

// ─── CARDS PER USER ───────────────────────────────────────────────────────────
export const MOCK_CARDS: Record<string, Card[]> = {
  'active@anyway.test':   [{ id: 'c1', last4: '4242', brand: 'visa',       expiryMonth: 12, expiryYear: 2028, isPrimary: true }],
  'new@anyway.test':      [],
  'fresh@anyway.test':    [{ id: 'c2', last4: '1234', brand: 'mastercard', expiryMonth: 8,  expiryYear: 2027, isPrimary: true }],
  'overdue@anyway.test':  [{ id: 'c3', last4: '9999', brand: 'visa',       expiryMonth: 6,  expiryYear: 2027, isPrimary: true }],
  'declined@anyway.test': [{ id: 'c4', last4: '5678', brand: 'mastercard', expiryMonth: 1,  expiryYear: 2026, isPrimary: true, isExpired: true }],
  'maxed@anyway.test':    [{ id: 'c5', last4: '3333', brand: 'visa',       expiryMonth: 9,  expiryYear: 2028, isPrimary: true }],
  'power@anyway.test':    [
    { id: 'c6', last4: '4242', brand: 'visa',       expiryMonth: 12, expiryYear: 2028, isPrimary: true },
    { id: 'c7', last4: '8888', brand: 'mastercard', expiryMonth: 3,  expiryYear: 2029, isPrimary: false },
  ],
  'merchant@anyway.test': [],
}

// ─── MERCHANT ORDERS ──────────────────────────────────────────────────────────
const COMMISSION_RATE = 0.025

function merchantOrder(
  id: string, orderId: string, amount: number,
  status: MerchantOrder['status'], date: string
): MerchantOrder {
  const commission = Math.round(amount * COMMISSION_RATE * 100) / 100
  return { id, orderId, amount, commission, payout: amount - commission, status, date }
}

export const MOCK_MERCHANT_ORDERS: MerchantOrder[] = [
  merchantOrder('m1', '#1001', 1000, 'settled', '2026-03-01'),
  merchantOrder('m2', '#1002', 2400, 'settled', '2026-03-10'),
  merchantOrder('m3', '#1003', 3000, 'pending', '2026-03-25'),
  merchantOrder('m4', '#1004', 5000, 'held',    '2026-03-28'),
]
