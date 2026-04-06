import type { Term } from './feeRates'
export type { Term }

export type OrderStatus = 'pending' | 'active' | 'overdue' | 'completed'
export type AccountStatus = 'active' | 'locked' | 'action_required' | 'kyc_pending'
export type SettlementStatus = 'pending' | 'settled' | 'held'
export type CardBrand = 'visa' | 'mastercard'

export interface Installment {
  index: number       // 0-based
  amount: number      // Current amount due (decreases with partial payments)
  originalAmount: number // Original amount scheduled
  dueDate: string     // ISO date string
  status: 'paid' | 'upcoming' | 'overdue'
}

export interface Order {
  id: string
  merchant: string
  merchantCategory: string
  purchaseDate: string  // ISO date string
  principal: number
  term: Term
  fee: number
  monthly: number
  firstPayment: number
  total: number
  paidCount: number     // how many installments paid
  refundedAmount: number
  status: OrderStatus
  installments: Installment[]
}

export interface Card {
  id: string
  last4: string
  brand: CardBrand
  expiryMonth: number
  expiryYear: number
  isPrimary: boolean
  isExpired?: boolean
}

export interface User {
  id: string
  email: string
  name: string
  verified: boolean
  creditLimit: number
  accountStatus: AccountStatus
  overdueAmount?: number
  overdueSince?: string
  declineReason?: string
  role: 'shopper' | 'merchant'
  businessName?: string
}

export type ProductCategory = 'Electronics' | 'Fashion' | 'Home & Garden' | 'Sports'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  description: string
  color: string        // gradient/bg color for placeholder image
  emoji: string        // icon for placeholder image
}

export interface MerchantOrder {
  id: string
  orderId: string
  amount: number
  commission: number
  payout: number
  status: SettlementStatus
  date: string
}
